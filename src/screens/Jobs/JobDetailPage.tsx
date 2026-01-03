
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
    clearActiveResource,
    fetchResources,
    fetchResourceVersions
} from '../../store/slices/resourceSlice';
import { Button } from '../../components/button';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Textarea } from '../../components/textarea';
import { Badge } from '../../components/badge';
import { JobDraft, EmploymentType } from '../../types/jobs';

import { CoverPicker } from './components/CoverPicker';


import { PipelinePreview } from './components/PipelinePreview';
import { FormPreviewBox } from './components/FormPreviewBox';
import NProgress from 'nprogress';
import clsx from 'clsx';
import JobEditorSkeleton from './components/JobEditorSkeleton';
import { SharingDialog } from '../../database-components/SharingDialog';
import { ResourceVersion } from '../../types/resource';
import { PostingPanel } from './components/PostingPanel';

import { 
    UsersIcon,
    ChevronLeftIcon,
    BriefcaseIcon,
    ArrowPathIcon,
    GlobeAltIcon,
    ArrowDownOnSquareIcon,
    RocketLaunchIcon,
    DocumentTextIcon
} from '@heroicons/react/20/solid';

export default function JobDetailPage() {
  const { orgId, jobId } = useParams<{ orgId: string; jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeResource, activeDraft, loading, resources } = useSelector((state: RootState) => state.resource);
  
  const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'form' | 'postings'>('details');
  const [showPicker, setShowPicker] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);

  // Job Form State

  const [jobForm, setJobForm] = useState<Partial<JobDraft>>({});

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);


  // Version States
  const [pipelineVersions, setPipelineVersions] = useState<ResourceVersion[]>([]);
  const [formVersions, setFormVersions] = useState<ResourceVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (orgId && jobId) {
      dispatch(fetchResourceById({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId }));
      dispatch(fetchResourceDraft({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId }));
      
      dispatch(fetchResources({ orgId, moduleId: 'hire', resourceType: 'forms' }));
      dispatch(fetchResources({ orgId, moduleId: 'hire', resourceType: 'pipelines' }));
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
        coverImage: draftData.coverImage,
        formId: draftData.formId,
        formVersionId: draftData.formVersionId,
        pipelineId: draftData.pipelineId,
        pipelineVersionId: draftData.pipelineVersionId,
      });
    } else if (activeResource) {


      setJobForm({
        title: activeResource.name,
        location: (activeResource as any).location || '',
        employmentType: (activeResource as any).employmentType || 'Full-time',
        description: (activeResource as any).description || '',
        coverImage: (activeResource as any).coverImage,

        formId: (activeResource as any).formId,
        formVersionId: (activeResource as any).formVersionId,
        pipelineId: (activeResource as any).pipelineId,
        pipelineVersionId: (activeResource as any).pipelineVersionId,
      });
    }
  }, [activeDraft, activeResource]);

  // Load versions for selected pipeline
  useEffect(() => {
      const loadVersions = async () => {
          if (orgId && jobForm.pipelineId) {
              setLoadingVersions(true);
              try {
                const versions = await dispatch(fetchResourceVersions({ 
                    orgId, 
                    moduleId: 'hire', 
                    resourceType: 'pipelines', 
                    resourceId: jobForm.pipelineId 
                })).unwrap();
                setPipelineVersions(versions);
                
                // If no version selected, default to published version
                if (!jobForm.pipelineVersionId) {
                    const pipeline = (resources['pipelines'] || []).find(p => p.id === jobForm.pipelineId);
                    if (pipeline?.publishedVersionId) {
                        setJobForm(prev => ({ ...prev, pipelineVersionId: pipeline.publishedVersionId }));
                    }
                }
              } catch (err) {
                  console.error("Failed to fetch pipeline versions", err);
              } finally {
                  setLoadingVersions(false);
              }
          } else {
              setPipelineVersions([]);
          }
      };
      loadVersions();
  }, [orgId, jobForm.pipelineId, dispatch, resources]);

  // Load versions for selected form
  useEffect(() => {
      const loadVersions = async () => {
          if (orgId && jobForm.formId) {
              setLoadingVersions(true);
              try {
                const versions = await dispatch(fetchResourceVersions({ 
                    orgId, 
                    moduleId: 'hire', 
                    resourceType: 'forms', 
                    resourceId: jobForm.formId 
                })).unwrap();
                setFormVersions(versions);

                // If no version selected, default to published version
                if (!jobForm.formVersionId) {
                    const form = (resources['forms'] || []).find(f => f.id === jobForm.formId);
                    if (form?.publishedVersionId) {
                        setJobForm(prev => ({ ...prev, formVersionId: form.publishedVersionId }));
                    }
                }
              } catch (err) {
                  console.error("Failed to fetch form versions", err);
              } finally {
                  setLoadingVersions(false);
              }
          } else {
              setFormVersions([]);
          }
      };
      loadVersions();
  }, [orgId, jobForm.formId, dispatch, resources]);

  const handleJobSave = async () => {
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
                id: jobId
            },

            resourceUpdates: { 
                name: jobForm.title,
                formId: jobForm.formId,
                formVersionId: jobForm.formVersionId,
                pipelineId: jobForm.pipelineId,
                pipelineVersionId: jobForm.pipelineVersionId,
            } as any
        })).unwrap();
        toast.success('Job saved');
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
        await dispatch(saveResourceDraft({
            orgId,
            moduleId: 'hire',
            resourceType: 'jobs',
            resourceId: jobId,
            data: { 
                ...jobForm, 
                id: jobId
            },

            resourceUpdates: { 
                name: jobForm.title,
                formId: jobForm.formId,
                formVersionId: jobForm.formVersionId,
                pipelineId: jobForm.pipelineId,
                pipelineVersionId: jobForm.pipelineVersionId,
            } as any
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




  if (loading && !activeResource) return <JobEditorSkeleton />;
  if (!activeResource && !loading) return null;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-2 border-b border-zinc-200 dark:border-white/10 shrink-0 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/orgs/${orgId}/jobs`)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 font-medium">Job Editor</span>
            <input 
                value={jobForm.title || ''} 
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="text-sm font-semibold bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-white p-0 "
            />
          </div>
          <Badge color={activeResource?.status === 'active' ? 'green' : 'zinc'}>
            {activeResource?.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
            <Button 
                plain
                 onClick={() => setIsSharingOpen(true)}
                 className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
                 title="Sharing"
             >
                 <UsersIcon className="w-4 h-4" />
             </Button>
            <Button 
                outline
                onClick={() => navigate(`/orgs/${orgId}/jobs`)}
                className="h-9 px-4 text-sm font-medium border border-zinc-200 dark:border-white/10 rounded-lg"
            >
                Cancel
            </Button>
            <Button 
                onClick={handleJobSave}
                disabled={isSaving || isPublishing}
                loading={isSaving}
                className="h-9 px-4 text-sm font-medium bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            >
                {!isSaving && <ArrowDownOnSquareIcon className="mr-2 h-4 w-4 opacity-70" />}
                {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
                onClick={handlePublish}
                disabled={isSaving || isPublishing}
                loading={isPublishing}
                color="indigo"
                className="h-9 px-4 text-sm font-semibold rounded-lg shadow-sm transition-all"
            >
                {!isPublishing && <RocketLaunchIcon className="mr-2 h-4 w-4" />}
                {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-200 dark:border-white/10 flex flex-col bg-zinc-50/50 dark:bg-black/20 shrink-0">
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 px-2">Config</h4>
                    <nav className="space-y-1">
                        <SidebarItem 
                            icon={BriefcaseIcon} 
                            label="Job Details" 
                            active={activeTab === 'details'} 
                            onClick={() => setActiveTab('details')} 
                        />
                        <SidebarItem 
                            icon={ArrowPathIcon} 
                            label="Workflow" 
                            active={activeTab === 'workflow'} 
                            onClick={() => setActiveTab('workflow')} 
                        />
                         <SidebarItem 
                            icon={DocumentTextIcon} 
                            label="Application Form" 
                            active={activeTab === 'form'} 
                            onClick={() => setActiveTab('form')} 
                        />
                    </nav>
                </div>
                
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 px-2">Distribution</h4>
                    <nav className="space-y-1">
                        <SidebarItem 
                            icon={GlobeAltIcon} 
                            label="Postings" 
                            active={activeTab === 'postings'} 
                            onClick={() => setActiveTab('postings')} 
                        />
                    </nav>
                </div>

            </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/10">
            <div className="max-w-4xl mx-auto p-8">
                {activeTab === 'details' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <BriefcaseIcon className="w-5 h-5 text-blue-500" />
                                Basic Information
                            </h3>
                            <div className="relative group h-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-8 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                {jobForm.coverImage ? (
                                    <img src={jobForm.coverImage} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                        <GlobeAltIcon className="w-8 h-8 opacity-20 mb-1" />
                                        <span className="text-xs">No cover image</span>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4">
                                     <Button 
                                        plain 
                                        className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs"
                                        onClick={() => setShowPicker(!showPicker)}
                                     >
                                        {jobForm.coverImage ? 'Change cover' : 'Add cover'}
                                     </Button>
                                     {showPicker && (
                                        <CoverPicker
                                            currentCover={jobForm.coverImage}
                                            onSelect={(url) => { setJobForm({ ...jobForm, coverImage: url }); setShowPicker(false); }}
                                            onRemove={() => { setJobForm({ ...jobForm, coverImage: undefined }); setShowPicker(false); }}
                                            onClose={() => setShowPicker(false)}
                                        />
                                     )}
                                </div>
                            </div>

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
                        </section>
                    </div>
                )}

                {activeTab === 'workflow' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <ArrowPathIcon className="w-5 h-5 text-purple-500" />
                                Recruitment Workflow
                            </h3>
                             <Fieldset>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field>
                                        <Label>Recruitment Pipeline</Label>
                                        <p className="text-xs text-zinc-500 mb-2">The hiring stages candidates will move through.</p>
                                        <Select 
                                            value={jobForm.pipelineId || ''}
                                            onChange={e => {
                                                const id = e.target.value;
                                                const pipeline = (resources['pipelines'] || []).find(p => p.id === id);
                                                setJobForm({
                                                    ...jobForm,
                                                    pipelineId: id || undefined,
                                                    pipelineVersionId: pipeline?.publishedVersionId
                                                });
                                            }}
                                        >
                                            <option value="">Select Pipeline</option>
                                            {(resources['pipelines'] || []).map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </Select>
                                    </Field>

                                    {jobForm.pipelineId && (
                                        <Field className="animate-in fade-in slide-in-from-left-2 duration-300">
                                            <Label>Pipeline Version</Label>
                                            <p className="text-xs text-zinc-500 mb-2">Select a snapshot to use.</p>
                                            <Select 
                                                value={jobForm.pipelineVersionId || ''}
                                                disabled={loadingVersions}
                                                onChange={e => setJobForm({ ...jobForm, pipelineVersionId: e.target.value })}
                                            >
                                                <option value="">Latest Published</option>
                                                {pipelineVersions.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {new Date(v.publishedAt || v.createdAt).toLocaleDateString()} ({v.id})
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    )}
                                </div>
                             </Fieldset>
                        </section>

                        {jobForm.pipelineId && (
                             <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <PipelinePreview 
                                    orgId={orgId!} 
                                    pipelineId={jobForm.pipelineId} 
                                    versionId={jobForm.pipelineVersionId}
                                />
                             </section>
                        )}
                    </div>
                )}

                {activeTab === 'form' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-emerald-500" />
                                Application Form
                            </h3>
                             <Fieldset>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field>
                                        <Label>Application Form</Label>
                                        <p className="text-xs text-zinc-500 mb-2">The form candidates will fill out when applying.</p>
                                        <Select 
                                            value={jobForm.formId || ''}
                                            onChange={e => {
                                                const id = e.target.value;
                                                const form = (resources['forms'] || []).find(f => f.id === id);
                                                setJobForm({
                                                    ...jobForm,
                                                    formId: id || undefined,
                                                    formVersionId: form?.publishedVersionId
                                                });
                                            }}
                                        >
                                            <option value="">Select Form</option>
                                            {(resources['forms'] || []).map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </Select>
                                    </Field>

                                    {jobForm.formId && (
                                        <Field className="animate-in fade-in slide-in-from-left-2 duration-300">
                                            <Label>Form Version</Label>
                                            <p className="text-xs text-zinc-500 mb-2">Select a snapshot to use.</p>
                                            <Select 
                                                value={jobForm.formVersionId || ''}
                                                disabled={loadingVersions}
                                                onChange={e => setJobForm({ ...jobForm, formVersionId: e.target.value })}
                                            >
                                                <option value="">Latest Published</option>
                                                {formVersions.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {new Date(v.publishedAt || v.createdAt).toLocaleDateString()} ({v.id})
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    )}
                                </div>
                             </Fieldset>
                        </section>

                        {jobForm.formId && (
                             <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <FormPreviewBox 
                                    orgId={orgId!} 
                                    formId={jobForm.formId} 
                                    versionId={jobForm.formVersionId}
                                />
                             </section>
                        )}
                    </div>
                )}

                {activeTab === 'postings' && (
                    <PostingPanel 
                        orgId={orgId!} 
                        jobId={jobId!} 
                        jobTitle={jobForm.title || ''}
                        jobLocation={jobForm.location || ''}
                        jobDescription={jobForm.description || ''}
                        formId={jobForm.formId}
                        pipelineId={jobForm.pipelineId}
                    />
                )}

            </div>
        </main>
      </div>

      <SharingDialog 
          isOpen={isSharingOpen} 
          onClose={() => setIsSharingOpen(false)} 
          title="Sharing"
          description="Manage who can view and edit this job posting."
          visibility={(activeResource as any)?.visibility || 'private'}
          ownerIds={(activeResource as any)?.ownerIds || []}
          availableRoles={['viewer', 'editor', 'owner']}
          orgId={orgId!}
          moduleId="hire"
          resourceType="jobs"
          resourceId={jobId!}
          currentUserId={(activeResource as any)?.ownerIds?.[0]} // Fallback or use auth state if available
      />
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, badge }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: string }) {
    return (
        <button 
            onClick={onClick}
            className={clsx(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all",
                active 
                    ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-zinc-200 dark:border-white/10" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
            )}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <Icon className={clsx("w-4 h-4 shrink-0", active ? "text-blue-500" : "text-zinc-400")} />
                <span className="truncate">{label}</span>
            </div>
            {badge && badge !== 'not_configured' && (
                <div className={clsx(
                    "w-2 h-2 rounded-full",
                    badge === 'published' ? 'bg-green-500' :
                    badge === 'draft' ? 'bg-yellow-500' :
                    badge === 'failed' ? 'bg-red-500' : 'bg-zinc-300'
                )} />
            )}
        </button>
    );
}


