import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createResource } from '../../store/slices/resourceSlice';
import { Button } from '../../components/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../components/dialog';
import { Input } from '../../components/input';
import { Field as FormField, Label } from '../../components/fieldset';
import NProgress from 'nprogress';
import { ResourceListView } from '../../database-components/resource-list-view';

export default function JobsListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newJobTitle.trim() || !orgId) return;
    
    setIsCreating(true);
    NProgress.start();

    try {
        const initialDraftGenerator = (id: string) => ({
            id,
            title: newJobTitle,
            location: '',
            employmentType: 'Full-time',
            description: '',
            postings: {}
        });

        const result = await dispatch(createResource({
            orgId,
            moduleId: 'hire',
            resourceType: 'jobs',
            data: {
                name: newJobTitle,
                description: 'Job posting'
            },
            initialDraftData: initialDraftGenerator
        })).unwrap();

        if (result.resource.id) {
            navigate(`/orgs/${orgId}/jobs/${result.resource.id}`);
        }
    } catch (error) {
        console.error("Failed to create job", error);
    } finally {
        setIsCreating(false);
        setIsCreateDialogOpen(false);
        setNewJobTitle('');
        NProgress.done();
    }
  };

  if (!orgId) return null;

  return (
    <ResourceListView
        title="Jobs"
        description="Manage your job postings and recruitment."
        orgId={orgId}
        moduleId="hire"
        resourceType="jobs"
        resourceName="Job"
        onCreate={() => setIsCreateDialogOpen(true)}
        onRowClick={(resource: any) => navigate(`/orgs/${orgId}/jobs/${resource.id}`)}
    >
      <Dialog open={isCreateDialogOpen} onClose={setIsCreateDialogOpen}>
        <DialogTitle>Create New Job</DialogTitle>
        <DialogDescription>
          Give your new job a title. You can configure the details and postings in the next step.
        </DialogDescription>
        <DialogBody>
          <FormField>
            <Label>Job Title</Label>
            <Input 
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              autoFocus
            />
          </FormField>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newJobTitle.trim() || isCreating}>
             {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </ResourceListView>
  );
}
