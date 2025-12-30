import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { DataTable, Field } from '../../data-components/dataTable';
import { pipelineService } from '../../services/mockPipelineService';
import { Pipeline } from '../../types/pipeline';
import { PlusIcon } from '@heroicons/react/16/solid';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../components/dialog';
import { Input } from '../../components/input';
import { Field as FormField, Label } from '../../components/fieldset';

export default function PipelineListPage() {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = () => {
    setPipelines(pipelineService.getPipelines());
  };

  const handleCreate = () => {
    if (!newPipelineName.trim()) return;
    const newPipeline = pipelineService.createPipeline(newPipelineName);
    setPipelines([...pipelines, newPipeline]);
    setIsCreateDialogOpen(false);
    setNewPipelineName('');
    navigate(`/pipelines/${newPipeline.id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pipeline?')) {
      pipelineService.deletePipeline(id);
      loadPipelines();
    }
  };

  const fields: Field<Pipeline>[] = [
    { key: 'name', label: 'Name', sortable: true, type: 'text' },
    { 
      key: 'stages', 
      label: 'Stages', 
      render: (pipeline) => {
        const activeVersion = pipeline.versions.find(v => v.id === pipeline.activeVersionId);
        return <span className="text-zinc-500">{activeVersion?.stages.length || 0} stages</span>;
      }
    },
    { key: 'updatedAt', label: 'Last Updated', type: 'date', sortable: true },
    { key: 'actions', label: '', type: 'actions' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
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

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 min-h-[500px]">
        <DataTable
          data={pipelines}
          fields={fields}
          actions={['edit', 'delete']}
          onAction={(action, item) => {
            if (action === 'edit') navigate(`/pipelines/${item.id}`);
            if (action === 'delete') handleDelete(item.id);
          }}
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
          <Button onClick={handleCreate} disabled={!newPipelineName.trim()}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
