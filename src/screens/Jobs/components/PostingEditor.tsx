
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
import { Switch, SwitchField } from '../../../components/switch';
import { Alert, AlertActions, AlertDescription, AlertTitle } from '../../../components/alert';

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
    const [isSaving, setIsSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCloseAlertOpen, setIsCloseAlertOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
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
        setIsClosing(true);
        try {
            await postingService.closePosting(orgId, posting);
            toast.success("Posting closed");
            setIsCloseAlertOpen(false);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to close posting");
        } finally {
            setIsClosing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await postingService.updatePosting(orgId, posting.id, { 
                contentOverrides: overrides 
            });
            toast.success("Changes saved");
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await postingService.deletePosting(orgId, posting);
            toast.success("Posting deleted");
            setIsDeleteAlertOpen(false);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete posting");
        } finally {
            setIsDeleting(false);
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
                        <span className="text-zinc-900 dark:text-white">
                            {channel === 'direct' ? 'Direct Link' : CHANNELS.find(c => c.id === channel)?.name || channel}
                        </span>
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
                             onClick={() => setIsCloseAlertOpen(true)}
                             loading={isClosing}
                         >
                             Close Posting
                         </Button>
                      </div>
                 )}

                 {!isPublished && (
                     <Button 
                        outline 
                        className="text-xs !text-red-600 hover:!bg-red-50" 
                        onClick={() => setIsDeleteAlertOpen(true)}
                        loading={isDeleting}
                    >
                        Delete Posting
                    </Button>
                 )}
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="space-y-6">
                    <Fieldset>
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
                    <Button outline onClick={handleSave} loading={isSaving}>
                        Save Changes
                    </Button>
                    <Button color="indigo" onClick={handlePublish} loading={isSubmitting}>
                        {isPublished ? 'Update & Republish' : 'Publish Live'}
                    </Button>
                </div>

                <Alert open={isCloseAlertOpen} onClose={setIsCloseAlertOpen}>
                    <AlertTitle>Close Posting?</AlertTitle>
                    <AlertDescription>
                        Are you sure you want to close this posting? It will no longer be accessible to candidates, and any active links will stop working.
                    </AlertDescription>
                    <AlertActions>
                        <Button plain onClick={() => setIsCloseAlertOpen(false)}>Cancel</Button>
                        <Button color="red" onClick={handleClose} loading={isClosing}>Close Posting</Button>
                    </AlertActions>
                </Alert>

                <Alert open={isDeleteAlertOpen} onClose={setIsDeleteAlertOpen}>
                    <AlertTitle>Delete Posting?</AlertTitle>
                    <AlertDescription>
                        Are you sure you want to delete this posting? This action is permanent and cannot be undone. All associated public data will be removed.
                    </AlertDescription>
                    <AlertActions>
                        <Button plain onClick={() => setIsDeleteAlertOpen(false)}>Cancel</Button>
                        <Button color="red" onClick={handleDelete} loading={isDeleting}>Delete Posting</Button>
                    </AlertActions>
                </Alert>
            </div>
        </div>
    );
}
