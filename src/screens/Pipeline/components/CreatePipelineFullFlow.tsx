import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../../store';
import { createResource } from '../../../store/slices/resourceSlice';
import { Button } from '../../../components/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../../components/dialog';
import { Input } from '../../../components/input';
import { Field as FormField, Label } from '../../../components/fieldset';
import { DEFAULT_STAGES } from '../../../types/pipeline';
import NProgress from 'nprogress';
import { PipelineTemplateSelector } from './PipelineTemplateSelector';
import { PipelineTemplate } from '../templates/types';

interface CreatePipelineFullFlowProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePipelineFullFlow({ orgId, isOpen, onClose }: CreatePipelineFullFlowProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(isOpen);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PipelineTemplate | null>(null);

  const handleTemplateSelect = (template: PipelineTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateSelectorOpen(false);
    setIsCreateDialogOpen(true);
    setNewPipelineName(template.name === 'Standard Recruitment' ? '' : template.name);
  };

  const handleCreate = async () => {
    if (!newPipelineName.trim() || !orgId) return;
    
    setIsCreating(true);
    NProgress.start();

    try {
        const initialDraftGenerator = (id: string) => ({
            id,
            stages: selectedTemplate ? selectedTemplate.stages : DEFAULT_STAGES
        });

        const result = await dispatch(createResource({
            orgId,
            moduleId: 'hire',
            resourceType: 'pipelines',
            data: {
                name: newPipelineName,
                description: selectedTemplate?.description || 'Recruitment pipeline'
            },
            initialDraftData: initialDraftGenerator
        })).unwrap();

        if (result.resource.id) {
            navigate(`/orgs/${orgId}/pipelines/${result.resource.id}`);
        }
    } catch (error) {
        console.error("Failed to create pipeline", error);
    } finally {
        setIsCreating(false);
        setIsCreateDialogOpen(false);
        setNewPipelineName('');
        setSelectedTemplate(null);
        NProgress.done();
        onClose();
    }
  };

  const handleCancelAll = () => {
      setIsTemplateSelectorOpen(false);
      setIsCreateDialogOpen(false);
      onClose();
  };

  return (
    <>
      <PipelineTemplateSelector 
        open={isTemplateSelectorOpen}
        onSelect={handleTemplateSelect}
        onCancel={handleCancelAll}
      />

      <Dialog open={isCreateDialogOpen} onClose={() => {
          setIsCreateDialogOpen(false);
          onClose();
      }}>
        <DialogTitle>Create New Pipeline</DialogTitle>
        <DialogDescription>
          Give your new pipeline a name.
        </DialogDescription>
        <DialogBody>
          <FormField>
            <Label>Pipeline Name</Label>
            <Input 
              value={newPipelineName}
              onChange={(e) => setNewPipelineName(e.target.value)}
              placeholder="e.g. Engineering Hiring"
              autoFocus
            />
          </FormField>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={handleCancelAll}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newPipelineName.trim() || isCreating}>
             {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
