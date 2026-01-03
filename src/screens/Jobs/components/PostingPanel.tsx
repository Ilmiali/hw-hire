
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/button';
import { Badge } from '../../../components/badge';
import { JobPosting, ChannelType } from '../../../types/posting';
import { postingService } from '../../../services/postingService';
import { CHANNELS } from '../../../config/channels';
import { 
    GlobeAltIcon, 
    ClipboardDocumentCheckIcon, 
    ClipboardIcon,
    PlusIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/20/solid';
import { Fieldset, Legend, Field, Label } from '../../../components/fieldset'; 
import { Input } from '../../../components/input';
import { Textarea } from '../../../components/textarea';
import { Select } from '../../../components/select';
import { Switch, SwitchField } from '../../../components/switch';
// import clsx from 'clsx';

// Minimal ID generator for "optimistic" or temp usage if needed, mostly we use service.
// const generateId = () => Math.random().toString(36).substr(2, 9);

interface PostingPanelProps {
    orgId: string;
    jobId: string;
    jobTitle: string;
    jobLocation: string;
    jobDescription: string;
    formId?: string;
    pipelineId?: string;
}

export function PostingPanel({ orgId, jobId, jobTitle, jobLocation, jobDescription, formId, pipelineId }: PostingPanelProps) {
    const [postings, setPostings] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadPostings = async () => {
        setLoading(true);
        try {
            const data = await postingService.getPostingsForJob(orgId, jobId);
            setPostings(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load postings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPostings();
    }, [orgId, jobId]);

    const handlePublishSuccess = (_id: string) => {
        toast.success("Posting published!");
        setIsCreateModalOpen(false);
        loadPostings();
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                        <GlobeAltIcon className="w-5 h-5 text-indigo-500" />
                        Job Distributions
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">Manage where this job is published.</p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    color="indigo"
                    disabled={!formId || !pipelineId}
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Posting
                </Button>
            </div>

            {(!formId || !pipelineId) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl flex items-start gap-3">
                    <div className="text-amber-600 dark:text-amber-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Configuration Required</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            You must select an <span className="font-bold">Application Form</span> and <span className="font-bold">Recruitment Workflow</span> before you can create postings.
                            Please save your changes in the respective tabs first.
                        </ p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)}
                </div>
            ) : postings.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <GlobeAltIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white">No active postings</h4>
                    <p className="text-xs text-zinc-500 mb-4">Get your job in front of candidates by creating a posting.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)} outline>Create Posting</Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {postings.map(posting => (
                        <PostingCard key={posting.id} orgId={orgId} posting={posting} onUpdate={loadPostings} />
                    ))}
                </div>
            )}

            <CreatePostingModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                orgId={orgId}
                jobId={jobId}
                defaults={{ title: jobTitle, location: jobLocation, description: jobDescription }}
                onSuccess={handlePublishSuccess}
            />
        </div>
    );
}

function PostingCard({ orgId, posting, onUpdate }: { orgId: string; posting: JobPosting, onUpdate: () => void }) {
    const channel = posting.channel === 'direct' 
        ? { id: 'direct', name: 'Direct Link', logo: null }
        : CHANNELS.find(c => c.id === posting.channel) || { id: posting.channel, name: posting.channel || 'Unknown', logo: null };
    const [copied, setCopied] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const applyUrl = posting.publicPostingId 
        ? `${window.location.origin}/apply/${posting.publicPostingId}`
        : "";

    const handleCopy = () => {
        if (!applyUrl) return;
        navigator.clipboard.writeText(applyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Apply link copied");
    };

    const handleClose = async () => {
        if (!confirm("Are you sure you want to close this posting? It will no longer be accessible to candidates.")) return;
        setIsClosing(true);
        try {
            await postingService.closePosting(orgId, posting);
            toast.success("Posting closed");
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to close posting");
        } finally {
            setIsClosing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {(channel.name || "?")[0]}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-zinc-900 dark:text-white">{channel.name}</h4>
                        <Badge color={posting.status === 'published' ? 'green' : 'zinc'}>{posting.status}</Badge>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 flex flex-col gap-1">
                        <span>Published: {new Date(posting.createdAt).toLocaleDateString()}</span>
                        {posting.contentOverrides?.title && <span className="text-indigo-500">+ Title Override: {posting.contentOverrides.title}</span>}
                        {posting.contentOverrides?.location && <span className="text-indigo-500">+ Location Override: {posting.contentOverrides.location}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
                 {applyUrl && (
                    <>
                        <Button 
                            plain 
                            onClick={handleCopy}
                            className="text-zinc-500 hover:text-indigo-600"
                            title="Copy Apply Link"
                        >
                            {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
                        </Button>
                        <Button 
                            plain 
                            href={applyUrl}
                            target="_blank"
                            className="text-zinc-500 hover:text-indigo-600"
                            title="Open Public Page"
                        >
                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </Button>
                    </>
                 )}
                  {posting.status === 'published' && (
                    <Button 
                        outline 
                        className="text-xs !text-red-600 hover:!bg-red-50" 
                        onClick={handleClose}
                        loading={isClosing}
                    >
                        Close
                    </Button>
                  )}
            </div>
        </div>
    );
}

function CreatePostingModal({ isOpen, onClose, orgId, jobId, defaults, onSuccess }: { 
    isOpen: boolean; 
    onClose: () => void; 
    orgId: string; 
    jobId: string;
    defaults: { title: string; location: string; description: string };
    onSuccess: (id: string) => void;
}) {
    const [channel, setChannel] = useState<ChannelType>('direct');
    const [overrides, setOverrides] = useState<{ title?: string; location?: string; description?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setOverrides({});
            setIsSubmitting(false);
            setChannel('direct');
        }
    }, [isOpen]);

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            const id = await postingService.publishJob(orgId, jobId, channel, overrides);
            onSuccess(id);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to publish");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
             <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold mb-6">Create New Posting</h2>
                
                <div className="space-y-6">
                    <Field>
                        <Label>Distribution Channel</Label>
                        <Select value={channel} onChange={e => setChannel(e.target.value as ChannelType)}>
                            <option value="direct">Direct Link</option>
                            {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                    </Field>

                    <Fieldset className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                        <Legend className="mb-4 block text-base">Content Customization</Legend>
                        
                        <Field className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <Label>Title Override</Label>
                                <SwitchField>
                                    <Label className="text-[10px] text-zinc-500 mr-2">Override</Label>
                                    <Switch 
                                        checked={!!overrides.title} 
                                        onChange={checked => setOverrides(prev => ({ ...prev, title: checked ? defaults.title : undefined }))}
                                    />
                                </SwitchField>
                            </div>
                            {overrides.title !== undefined && (
                                <Input 
                                    value={overrides.title} 
                                    onChange={e => setOverrides(prev => ({ ...prev, title: e.target.value }))} 
                                />
                            )}
                        </Field>

                         <Field className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <Label>Location Override</Label>
                                <SwitchField>
                                    <Label className="text-[10px] text-zinc-500 mr-2">Override</Label>
                                    <Switch 
                                        checked={!!overrides.location} 
                                        onChange={checked => setOverrides(prev => ({ ...prev, location: checked ? defaults.location : undefined }))}
                                    />
                                </SwitchField>
                            </div>
                            {overrides.location !== undefined && (
                                <Input 
                                    value={overrides.location} 
                                    onChange={e => setOverrides(prev => ({ ...prev, location: e.target.value }))} 
                                />
                            )}
                        </Field>

                         <Field>
                            <div className="flex justify-between items-center mb-1">
                                <Label>Description Override</Label>
                                <SwitchField>
                                    <Label className="text-[10px] text-zinc-500 mr-2">Override</Label>
                                    <Switch 
                                        checked={!!overrides.description} 
                                        onChange={checked => setOverrides(prev => ({ ...prev, description: checked ? defaults.description : undefined }))}
                                    />
                                </SwitchField>
                            </div>
                            {overrides.description !== undefined && (
                                <Textarea 
                                    rows={6}
                                    value={overrides.description} 
                                    onChange={e => setOverrides(prev => ({ ...prev, description: e.target.value }))} 
                                />
                            )}
                        </Field>
                    </Fieldset>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <Button plain onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button color="indigo" onClick={handlePublish} loading={isSubmitting}>
                        Publish Live
                    </Button>
                </div>
             </div>
        </div>
    );
}
