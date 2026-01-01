import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
    fetchResourceById, 
    fetchResourceDraft, 
    saveResourceDraft, 
    publishResource, 
    clearActiveResource 
} from '../../store/slices/resourceSlice';
import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Textarea } from '../../components/textarea';
import { Badge } from '../../components/badge';
import { Job, JobPosting, EmploymentType, PostingStatus } from '../../types/jobs';
import { CHANNELS } from '../../config/channels';
import { PostingEditor } from './PostingEditor';
import { CoverPicker } from './components/CoverPicker';
import NProgress from 'nprogress';
import { Spinner } from '@/components/ui/spinner';

export default function JobDetailPage() {
  const { orgId, jobId } = useParams<{ orgId: string; jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeResource, activeDraft, loading } = useSelector((state: RootState) => state.resource);
  
  const [postings, setPostings] = useState<Record<string, JobPosting>>({});
  const [editorState, setEditorState] = useState<{ isOpen: boolean; channelId?: string }>({ isOpen: false });
  const [showPicker, setShowPicker] = useState(false);

  // Job Form State
  const [jobForm, setJobForm] = useState<Partial<Job>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (orgId && jobId) {
      dispatch(fetchResourceById({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId }));
      dispatch(fetchResourceDraft({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId }));
    }
    return () => {
      dispatch(clearActiveResource());
    };
  }, [dispatch, orgId, jobId]);

  useEffect(() => {
    if (activeDraft) {
      const draftData = activeDraft.data as any;
      setJobForm({
        title: draftData.title || activeResource?.name || '',
        location: draftData.location || '',
        employmentType: draftData.employmentType || 'Full-time',
        description: draftData.description || '',
        coverImage: draftData.coverImage
      });
      setPostings(draftData.postings || {});
    } else if (activeResource) {
      setJobForm({
        title: activeResource.name,
        location: (activeResource as any).location || '',
        employmentType: (activeResource as any).employmentType || 'Full-time',
        description: (activeResource as any).description || '',
        coverImage: (activeResource as any).coverImage
      });
    }
  }, [activeDraft, activeResource]);

  const handleJobSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orgId || !jobId || isSaving || isPublishing) return;
    
    setIsSaving(true);
    NProgress.start();
    try {
        await dispatch(saveResourceDraft({
            orgId,
            moduleId: 'hire',
            resourceType: 'jobs',
            resourceId: jobId,
            data: { 
                ...jobForm, 
                id: jobId,
                postings 
            },
            resourceUpdates: { name: jobForm.title }
        })).unwrap();
        toast.success('Job draft saved');
    } catch (error) {
        toast.error('Failed to save job');
    } finally {
        setIsSaving(false);
        NProgress.done();
    }
  };

  const handlePublish = async () => {
    if (!orgId || !jobId || isSaving || isPublishing) return;
    
    setIsPublishing(true);
    NProgress.start();
    try {
        // First save draft
        await dispatch(saveResourceDraft({
            orgId,
            moduleId: 'hire',
            resourceType: 'jobs',
            resourceId: jobId,
            data: { 
                ...jobForm, 
                id: jobId,
                postings 
            },
            resourceUpdates: { name: jobForm.title }
        })).unwrap();

        await dispatch(publishResource({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId })).unwrap();
        toast.success("Job published!");
    } catch (error) {
        toast.error("Failed to publish job");
    } finally {
        setIsPublishing(false);
        NProgress.done();
    }
  };

  const handleOpenEditor = (channelId: string) => {
    setEditorState({ isOpen: true, channelId });
  };

  const handleEditorSave = (posting: JobPosting) => {
    if (!jobId) return;
    const newPostings = { ...postings, [posting.channelId]: posting };
    setPostings(newPostings);
    toast.success('Posting draft updated (save job to persist)');
  };

  const handleEditorPublish = (posting: JobPosting) => {
    if (!jobId) return;
    
    let updatedPosting = { ...posting };
    if (posting.simulateFailure) {
        updatedPosting = { 
            ...posting, 
            status: 'failed' as PostingStatus, 
            error: 'Simulated failure: internal server error.' 
        };
        toast.error('Publish failed (simulated)');
    } else {
        toast.success('Published (save job to persist)');
    }
    
    const newPostings = { ...postings, [updatedPosting.channelId]: updatedPosting };
    setPostings(newPostings);
  };

  const handleUnpublish = (channelId: string) => {
     if (!jobId || !confirm('Are you sure you want to unpublish?')) return;
     
     const newPostings = { ...postings };
     if (newPostings[channelId]) {
         newPostings[channelId] = { ...newPostings[channelId], status: 'draft' };
     }
     setPostings(newPostings);
     toast.success('Unpublished');
  };

  const handleRetry = (channelId: string) => {
      handleOpenEditor(channelId);
  };

  if (loading && !activeResource) return <div className="p-8"><Spinner /></div>;
  if (!activeResource && !loading) return null;

  const jobForEditor: Job = {
      id: jobId!,
      title: jobForm.title || '',
      location: jobForm.location || '',
      employmentType: jobForm.employmentType || 'Full-time',
      description: jobForm.description || '',
      status: (activeResource?.status as any) || 'draft',
      createdAt: activeResource?.createdAt || '',
      updatedAt: activeResource?.updatedAt || ''
  };

  return (
    <div className="mx-auto max-w-5xl md:p-8 pb-32">
      {/* Header section with cover */}
      <div className="bg-white dark:bg-zinc-950 md:rounded-xl border md:border-zinc-200 md:dark:border-zinc-800 shadow-sm overflow-hidden mb-8">
        <div className="relative group h-48 md:h-64 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          {jobForm.coverImage ? (
            <img 
              src={jobForm.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">No cover image</span>
            </div>
          )}
          
          <div className="absolute bottom-4 left-8 md:bottom-6 md:left-12 flex items-center gap-2">
            <div className="relative">
              <Button 
                plain 
                className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm"
                onClick={() => setShowPicker(!showPicker)}
              >
                {jobForm.coverImage ? 'Change cover' : 'Add cover'}
              </Button>
              {showPicker && (
                <CoverPicker
                  currentCover={jobForm.coverImage}
                  onSelect={(url) => {
                    setJobForm({ ...jobForm, coverImage: url });
                  }}
                  onRemove={() => {
                    setJobForm({ ...jobForm, coverImage: undefined });
                  }}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="p-8 md:px-12 md:py-8 flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
              <button onClick={() => navigate(`/orgs/${orgId}/jobs`)} className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 text-sm font-medium transition-colors">
                &larr; Jobs
              </button>
              <span>/</span>
              <span className="text-sm">{jobId}</span>
            </div>
            <div className="flex items-center gap-4">
              <Heading>{jobForm.title || activeResource?.name}</Heading>
              <Badge color={activeResource?.status === 'active' ? 'green' : 'zinc'}>
                {activeResource?.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
             <Button outline onClick={() => navigate(`/orgs/${orgId}/jobs`)}>Cancel</Button>
             <Button 
                onClick={handleJobSave} 
                disabled={isSaving || isPublishing}
                loading={isSaving}
                className="px-6"
             >
                {isSaving ? "Saving..." : "Save Draft"}
             </Button>
             <Button 
                onClick={handlePublish} 
                disabled={isSaving || isPublishing}
                loading={isPublishing}
                color="indigo" 
                className="px-6"
             >
                {isPublishing ? "Publishing..." : "Publish"}
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Main Job Details */}
        <div className="lg:col-span-2 space-y-8">
            <form id="job-form" onSubmit={handleJobSave} className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-900">Job Details</h3>
                  <Fieldset>
                      <Field>
                          <Label>Job Title</Label>
                          <Input 
                              placeholder="e.g. Senior Product Designer"
                              value={jobForm.title || ''} 
                              onChange={e => setJobForm({...jobForm, title: e.target.value})} 
                          />
                      </Field>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Field>
                              <Label>Location</Label>
                              <Input 
                                  placeholder="e.g. Helsinki (Hybrid)"
                                  value={jobForm.location || ''} 
                                  onChange={e => setJobForm({...jobForm, location: e.target.value})} 
                              />
                          </Field>
                          <Field>
                              <Label>Employment Type</Label>
                              <Select 
                                  value={jobForm.employmentType}
                                  onChange={e => setJobForm({...jobForm, employmentType: e.target.value as EmploymentType})}
                              >
                                  <option value="Full-time">Full-time</option>
                                  <option value="Part-time">Part-time</option>
                                  <option value="Contract">Contract</option>
                                  <option value="Temporary">Temporary</option>
                              </Select>
                          </Field>
                      </div>
                      <Field>
                          <Label>Description</Label>
                          <Textarea 
                              rows={12}
                              placeholder="Describe the role..."
                              value={jobForm.description || ''} 
                              onChange={e => setJobForm({...jobForm, description: e.target.value})} 
                          />
                      </Field>
                  </Fieldset>
                </div>
            </form>
        </div>

        {/* Distribution / Postings */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Distribution</h3>
                  <Badge>{CHANNELS.length} Channels</Badge>
                </div>
                <div className="space-y-4">
                    {CHANNELS.map(channel => {
                        const posting = postings[channel.id];
                        const status = posting?.status || 'not_configured';

                        return (
                            <div key={channel.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{channel.name}</h3>
                                    <Badge color={
                                        (status === 'published' ? 'green' :
                                        status === 'failed' ? 'red' :
                                        status === 'draft' ? 'yellow' : 'zinc') as any
                                    }>
                                        {status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                {posting?.lastUpdatedAt && (
                                    <div className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Updated: {new Date(posting.lastUpdatedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {status === 'failed' && posting.error && (
                                     <div className="text-xs text-red-600 mb-3 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20">
                                        {posting.error}
                                     </div>
                                )}

                                <div className="flex gap-2 mt-4">
                                    {status === 'not_configured' && (
                                        <Button className="w-full" onClick={() => handleOpenEditor(channel.id)}>
                                            Create Posting
                                        </Button>
                                    )}
                                    {status === 'draft' && (
                                        <>
                                            <Button outline className="flex-1" onClick={() => handleOpenEditor(channel.id)}>Edit</Button>
                                            <Button className="flex-1" onClick={() => handleOpenEditor(channel.id)}>Publish</Button>
                                        </>
                                    )}
                                    {status === 'published' && (
                                        <>
                                            <Button outline className="flex-1" onClick={() => handleOpenEditor(channel.id)}>View</Button>
                                            <Button color="red" className="flex-1" onClick={() => handleUnpublish(channel.id)}>Unpublish</Button>
                                        </>
                                    )}
                                    {status === 'failed' && (
                                        <>
                                            <Button outline className="flex-1" onClick={() => handleOpenEditor(channel.id)}>Edit</Button>
                                            <Button className="flex-1" onClick={() => handleRetry(channel.id)}>Retry</Button>
                                        </>
                                    )}
                                    {status === 'paused' && (
                                         <Button className="w-full" onClick={() => handleOpenEditor(channel.id)}>Resume</Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>

      {editorState.isOpen && editorState.channelId && activeResource && (
        <PostingEditor
          isOpen={editorState.isOpen}
          onClose={() => setEditorState({ isOpen: false })}
          job={jobForEditor}
          channelId={editorState.channelId}
          existingPosting={postings[editorState.channelId]}
          onSave={handleEditorSave}
          onPublish={handleEditorPublish}
        />
      )}
    </div>
  );
}
