import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createResource, deleteResource } from '../../store/slices/resourceSlice';
import { Button } from '../../components/button';
import { PlusIcon } from '@heroicons/react/16/solid';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../components/dialog';
import { Input } from '../../components/input';
import { Field as FormField, Label } from '../../components/fieldset';
import { ResourceTable } from '../../components/resource-table';
import { DEFAULT_STAGES } from '../../types/pipeline';
import NProgress from 'nprogress';

export default function PipelineListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');

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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (!orgId) return null;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Pipelines</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your recruitment workflows.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="size-4 mr-2" />
          Create Pipeline
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-lg shadow-sm border border-border">
        <ResourceTable
            orgId={orgId}
            moduleId="hire"
            resourceType="pipelines"
            onRowClick={(resource: any) => navigate(`/orgs/${orgId}/pipelines/${resource.id}`)}
            onDelete={async (resource: any) => {
                if (window.confirm('Are you sure you want to delete this pipeline?')) {
                    await dispatch(deleteResource({ orgId, moduleId: 'hire', resourceType: 'pipelines', resourceId: resource.id })).unwrap();
                }
            }}
            onCreate={() => setIsCreateDialogOpen(true)}
        />
      </div>

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
    </div>
  );
}
