
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/button';
import { Badge } from '../../../components/badge';
import { JobPosting, ChannelType } from '../../../types/posting';
import { postingService } from '../../../services/postingService';
import { CHANNELS } from '../../../config/channels';
import { 
    ClipboardDocumentCheckIcon, 
    ClipboardIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/20/solid';
import { Fieldset, Legend, Field, Label } from '../../../components/fieldset'; 
import { Input } from '../../../components/input';
import { Textarea } from '../../../components/textarea';
import { Select } from '../../../components/select';
import { Switch, SwitchField } from '../../../components/switch';

interface PostingEditorProps {
    orgId: string;
    jobId: string;
    posting: JobPosting;
    defaults: { title: string; location: string; description: string };
    onUpdate: () => void;
}

export function PostingEditor({ orgId, jobId, posting, defaults, onUpdate }: PostingEditorProps) {
    const [channel, setChannel] = useState<ChannelType>(posting.channel || 'direct');
    const [overrides, setOverrides] = useState<{ title?: string; location?: string; description?: string }>(posting.contentOverrides || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Sync state if posting changes (e.g. switching between postings in sidebar)
    useEffect(() => {
        setChannel(posting.channel || 'direct');
        setOverrides(posting.contentOverrides || {});
    }, [posting]);

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            await postingService.publishDraft(orgId, jobId, posting.id, channel, overrides);
            toast.success("Posting published!");
            onUpdate();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to publish");
        } finally {
            setIsSubmitting(false);
        }
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

    const isPublished = posting.status === 'published';

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">
             <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-zinc-900 dark:text-white">Posting Editor</span>
                        <Badge color={posting.status === 'published' ? 'green' : posting.status === 'draft' ? 'yellow' : 'zinc'}>
                            {posting.status}
                        </Badge>
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">ID: {posting.id}</p>
                </div>
                
                {isPublished && (
                     <div className="flex items-center gap-2">
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
                         <Button 
                            outline 
                            className="text-xs !text-red-600 hover:!bg-red-50 ml-2" 
                            onClick={handleClose}
                            loading={isClosing}
                        >
                            Close Posting
                        </Button>
                     </div>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="space-y-6">
                    <Field>
                        <Label>Distribution Channel</Label>
                        <Select value={channel} onChange={e => setChannel(e.target.value as ChannelType)} disabled>
                            <option value="direct">Direct Link</option>
                            {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Select>
                        <p className="text-xs text-zinc-500 mt-2 italic">
                            The distribution channel cannot be changed after creation.
                        </p>
                    </Field>

                    <Fieldset className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                        <Legend className="mb-4 block text-base font-semibold">Content Customization</Legend>
                        
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
                    <Button color="indigo" onClick={handlePublish} loading={isSubmitting}>
                        {isPublished ? 'Update & Republish' : 'Publish Live'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
