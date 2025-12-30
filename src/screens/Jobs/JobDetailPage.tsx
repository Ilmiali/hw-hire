import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Textarea } from '../../components/textarea';
import { Badge } from '../../components/badge';
import { JobService } from '../../services/JobService';
import { Job, JobPosting, EmploymentType, PostingStatus } from '../../types/jobs';
import { CHANNELS } from '../../config/channels';
import { PostingEditor } from './PostingEditor';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [postings, setPostings] = useState<Record<string, JobPosting>>({});
  const [editorState, setEditorState] = useState<{ isOpen: boolean; channelId?: string }>({ isOpen: false });

  // Job Form State
  const [jobForm, setJobForm] = useState<Partial<Job>>({});

  useEffect(() => {
    if (jobId) {
      loadData(jobId);
    }
  }, [jobId]);

  const loadData = (id: string) => {
    const loadedJob = JobService.getJob(id);
    if (!loadedJob) {
      navigate('/jobs');
      return;
    }
    setJob(loadedJob);
    setJobForm(loadedJob);
    setPostings(JobService.getPostingsForJob(id));
  };

  const handleJobSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !jobId) return;
    
    const updated = JobService.updateJob(jobId, jobForm);
    if (updated) {
        setJob(updated);
        // Toast success
        alert('Job updated successfully');
    }
  };

  const handleOpenEditor = (channelId: string) => {
    setEditorState({ isOpen: true, channelId });
  };

  const handleEditorSave = (posting: JobPosting) => {
    if (!jobId) return;
    JobService.savePosting(jobId, posting);
    setPostings(JobService.getPostingsForJob(jobId));
    // Toast success
    alert('Posting draft saved');
  };

  const handleEditorPublish = (posting: JobPosting) => {
    if (!jobId) return;
    
    if (posting.simulateFailure) {
        const failedPosting = { ...posting, status: 'failed' as PostingStatus, error: 'Simulated failure: internal server error.' };
        JobService.savePosting(jobId, failedPosting);
        alert('Publish failed (simulated)');
    } else {
        JobService.savePosting(jobId, posting);
        alert('Published successfully');
    }
    setPostings(JobService.getPostingsForJob(jobId));
  };

  const handleUnpublish = (channelId: string) => {
     if (!jobId || !confirm('Are you sure you want to unpublish?')) return;
     
     JobService.updatePostingStatus(jobId, channelId, 'draft');
     setPostings(JobService.getPostingsForJob(jobId));
     alert('Unpublished');
  };

  const handleRetry = (channelId: string) => {
      // For MVP retry just opens editor or immediately retries. Let's open editor.
      handleOpenEditor(channelId);
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="mx-auto max-w-5xl p-8 pb-32">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
             <Button plain onClick={() => navigate('/jobs')}>&larr; Back</Button>
             <Heading>Edit Job: {job.title}</Heading>
             <Badge>{job.status}</Badge>
        </div>
        <Button type="submit" form="job-form" color="indigo">Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Job Details */}
        <div className="lg:col-span-2 space-y-8">
            <form id="job-form" onSubmit={handleJobSave} className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <Heading level={2}>Job Details</Heading>
                <Fieldset>
                    <Field>
                        <Label>Job Title</Label>
                        <Input 
                            value={jobForm.title || ''} 
                            onChange={e => setJobForm({...jobForm, title: e.target.value})} 
                        />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field>
                            <Label>Location</Label>
                            <Input 
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
                            rows={10}
                            value={jobForm.description || ''} 
                            onChange={e => setJobForm({...jobForm, description: e.target.value})} 
                        />
                    </Field>
                </Fieldset>
            </form>
        </div>

        {/* Distribution / Postings */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <Heading level={2} className="mb-4">Distribution</Heading>
                <div className="space-y-4">
                    {CHANNELS.map(channel => {
                        const posting = postings[channel.id];
                        const status = posting?.status || 'not_configured';

                        return (
                            <div key={channel.id} className="p-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
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
                                    <div className="text-xs text-zinc-500 mb-3">
                                        Updated: {new Date(posting.lastUpdatedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {status === 'failed' && posting.error && (
                                     <div className="text-xs text-red-600 mb-3 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                        Error: {posting.error}
                                     </div>
                                )}

                                <div className="flex gap-2 mt-2">
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

      {editorState.isOpen && editorState.channelId && job && (
        <PostingEditor
          isOpen={editorState.isOpen}
          onClose={() => setEditorState({ isOpen: false })}
          job={job}
          channelId={editorState.channelId}
          existingPosting={postings[editorState.channelId]}
          onSave={handleEditorSave}
          onPublish={handleEditorPublish}
        />
      )}
    </div>
  );
}
