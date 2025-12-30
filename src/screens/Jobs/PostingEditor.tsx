import { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '../../components/dialog';
import { Button } from '../../components/button';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Switch, SwitchField } from '../../components/switch';
import { Badge } from '../../components/badge';
import { Job, JobPosting } from '../../types/jobs';
import { getChannelConfig } from '../../config/channels';

interface PostingEditorProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  channelId: string;
  existingPosting?: JobPosting;
  onSave: (posting: JobPosting) => void;
  onPublish: (posting: JobPosting) => void;
}

export function PostingEditor({ isOpen, onClose, job, channelId, existingPosting, onSave, onPublish }: PostingEditorProps) {
  const channel = getChannelConfig(channelId);
  const defaultApplyUrl = `https://example.com/apply/${job.id}?source=${channelId}`;

  const [overrides, setOverrides] = useState<{
    title?: string;
    description?: string;
    location?: string;
    applyUrl?: string;
  }>({});

  const [useOverrides, setUseOverrides] = useState({
    title: false,
    description: false,
    location: false,
    applyUrl: false,
  });

  const [simulateFailure, setSimulateFailure] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingPosting) {
        setOverrides(existingPosting.overrides || {});
        setUseOverrides({
          title: !!existingPosting.overrides.title,
          description: !!existingPosting.overrides.description,
          location: !!existingPosting.overrides.location,
          applyUrl: !!existingPosting.overrides.applyUrl,
        });
        setSimulateFailure(existingPosting.simulateFailure || false);
      } else {
        setOverrides({});
        setUseOverrides({
          title: false,
          description: false,
          location: false,
          applyUrl: false,
        });
        setSimulateFailure(false);
      }
    }
  }, [isOpen, existingPosting]);

  const getEffectiveValue = (field: 'title' | 'description' | 'location' | 'applyUrl') => {
    if (field === 'applyUrl') {
        return useOverrides.applyUrl ? (overrides.applyUrl || '') : defaultApplyUrl;
    }
    return useOverrides[field] ? (overrides[field] || '') : (job[field as keyof Job] as string);
  };

  const handleSave = () => {
    const posting: JobPosting = {
      channelId,
      status: existingPosting?.status || 'draft',
      content: {
        title: getEffectiveValue('title'),
        description: getEffectiveValue('description'),
        location: getEffectiveValue('location'),
        applyUrl: getEffectiveValue('applyUrl'),
      },
      overrides: {
        title: useOverrides.title ? overrides.title : undefined,
        description: useOverrides.description ? overrides.description : undefined,
        location: useOverrides.location ? overrides.location : undefined,
        applyUrl: useOverrides.applyUrl ? overrides.applyUrl : undefined,
      },
      lastUpdatedAt: new Date().toISOString(),
      simulateFailure,
    };
    onSave(posting);
    onClose();
  };

  const handlePublish = () => {
    const posting: JobPosting = {
      channelId,
      status: 'published', // Will be overridden by simulateFailure check in parent or here
      content: {
        title: getEffectiveValue('title'),
        description: getEffectiveValue('description'),
        location: getEffectiveValue('location'),
        applyUrl: getEffectiveValue('applyUrl'),
      },
      overrides: {
        title: useOverrides.title ? overrides.title : undefined,
        description: useOverrides.description ? overrides.description : undefined,
        location: useOverrides.location ? overrides.location : undefined,
        applyUrl: useOverrides.applyUrl ? overrides.applyUrl : undefined,
      },
      lastUpdatedAt: new Date().toISOString(),
      simulateFailure,
    };
    onPublish(posting);
    onClose();
  };

  const validate = () => {
    if (!channel) return false;
    // Check required fields
    const missing = channel.requiredFields.filter(field => {
        const val = getEffectiveValue(field as any);
        return !val || val.trim() === '';
    });
    return missing.length === 0;
  };

  const isValid = validate();

  return (
    <Dialog open={isOpen} onClose={onClose} size="4xl">
      <DialogTitle>Post to {channel?.name}</DialogTitle>
      <DialogBody>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="space-y-6">
            <Fieldset>
              <Field>
                <div className="flex justify-between items-center mb-1">
                  <Label>Title</Label>
                  <SwitchField>
                    <Label className="text-xs text-zinc-500 mr-2">Override</Label>
                    <Switch 
                      checked={useOverrides.title} 
                      onChange={(checked) => setUseOverrides(prev => ({ ...prev, title: checked }))} 
                    />
                  </SwitchField>
                </div>
                <Input 
                  value={useOverrides.title ? (overrides.title || '') : job.title}
                  readOnly={!useOverrides.title}
                  onChange={e => setOverrides(prev => ({ ...prev, title: e.target.value }))}
                  className={!useOverrides.title ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : ""}
                />
              </Field>

              <Field>
                <div className="flex justify-between items-center mb-1">
                  <Label>Location</Label>
                  <SwitchField>
                    <Label className="text-xs text-zinc-500 mr-2">Override</Label>
                    <Switch 
                      checked={useOverrides.location} 
                      onChange={(checked) => setUseOverrides(prev => ({ ...prev, location: checked }))} 
                    />
                  </SwitchField>
                </div>
                <Input 
                  value={useOverrides.location ? (overrides.location || '') : job.location}
                  readOnly={!useOverrides.location}
                  onChange={e => setOverrides(prev => ({ ...prev, location: e.target.value }))}
                  className={!useOverrides.location ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : ""}
                />
              </Field>

              <Field>
                <div className="flex justify-between items-center mb-1">
                  <Label>Application URL</Label>
                  <SwitchField>
                    <Label className="text-xs text-zinc-500 mr-2">Override</Label>
                    <Switch 
                      checked={useOverrides.applyUrl} 
                      onChange={(checked) => setUseOverrides(prev => ({ ...prev, applyUrl: checked }))} 
                    />
                  </SwitchField>
                </div>
                <Input 
                  value={useOverrides.applyUrl ? (overrides.applyUrl || '') : defaultApplyUrl}
                  readOnly={!useOverrides.applyUrl}
                  onChange={e => setOverrides(prev => ({ ...prev, applyUrl: e.target.value }))}
                  className={!useOverrides.applyUrl ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : ""}
                />
              </Field>

              <Field>
                <div className="flex justify-between items-center mb-1">
                  <Label>Description</Label>
                  <SwitchField>
                    <Label className="text-xs text-zinc-500 mr-2">Override</Label>
                    <Switch 
                      checked={useOverrides.description} 
                      onChange={(checked) => setUseOverrides(prev => ({ ...prev, description: checked }))} 
                    />
                  </SwitchField>
                </div>
                <Textarea 
                  rows={8}
                  value={useOverrides.description ? (overrides.description || '') : job.description}
                  readOnly={!useOverrides.description}
                  onChange={e => setOverrides(prev => ({ ...prev, description: e.target.value }))}
                  className={!useOverrides.description ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : ""}
                />
              </Field>
            </Fieldset>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
               <SwitchField>
                  <Label>Simulate Publish Failure (Demo)</Label>
                  <Switch 
                    checked={simulateFailure} 
                    onChange={setSimulateFailure} 
                    color="red"
                  />
                </SwitchField>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
             <div className="flex items-center gap-2 mb-4">
                <Badge color="blue">Preview</Badge>
                <span className="text-sm text-zinc-500">How it looks on {channel?.name}</span>
             </div>
             
             <div className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{getEffectiveValue('title')}</h2>
                <div className="flex gap-4 text-sm text-zinc-500">
                    <span>📍 {getEffectiveValue('location')}</span>
                    <span>🔗 <a href="#" className="text-blue-500 hover:underline">Apply Link</a></span>
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                    {getEffectiveValue('description')}
                </div>
             </div>
          </div>
        </div>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Draft</Button>
        <Button color="indigo" onClick={handlePublish} disabled={!isValid}>
            Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
