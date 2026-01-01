import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createResource } from '../../store/slices/resourceSlice';
import { Button } from '../../components/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../components/dialog';
import { Input } from '../../components/input';
import { Field as FormField, Label } from '../../components/fieldset';
import { DEFAULT_STAGES } from '../../types/pipeline';
import NProgress from 'nprogress';
import { ResourceListView } from '../../components/resource-list-view';

export default function PipelineListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newPipelineName.trim() || !orgId) return;
    
    setIsCreating(true);
    NProgress.start();

    try {
        const initialDraftGenerator = (id: string) => ({
            id,
            stages: DEFAULT_STAGES
        });

        const result = await dispatch(createResource({
            orgId,
            moduleId: 'hire',
            resourceType: 'pipelines',
            data: {
                name: newPipelineName,
                description: 'Recruitment pipeline'
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
        NProgress.done();
    }
  };

  if (!orgId) return null;

  return (
    <ResourceListView
        title="Pipelines"
        description="Manage your recruitment workflows."
        orgId={orgId}
        moduleId="hire"
        resourceType="pipelines"
        resourceName="Pipeline"
        onCreate={() => setIsCreateDialogOpen(true)}
        onRowClick={(resource: any) => navigate(`/orgs/${orgId}/pipelines/${resource.id}`)}
    >
      <Dialog open={isCreateDialogOpen} onClose={setIsCreateDialogOpen}>
        <DialogTitle>Create New Pipeline</DialogTitle>
        <DialogDescription>
          Give your new pipeline a name. You can configure stages in the next step.
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
          <Button plain onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newPipelineName.trim() || isCreating}>
             {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </ResourceListView>
  );
}
