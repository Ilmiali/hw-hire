import { Button } from '@/components/ui/button';
import { Heading } from '../../components/heading';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createResource, deleteResource, fetchResources } from '../../store/slices/resourceSlice';
import NProgress from 'nprogress';
import { Form } from '../../types/forms';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '../../components/dialog';
import { ResourceTable } from '../../components/resource-table';

type FormDoc = Omit<Form, 'createdAt' | 'updatedAt'> & { 
  createdAt?: Date;
  updatedAt?: Date;
  data: Record<string, unknown>;
};

export default function FormsList() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateForm = async () => {
    if (!orgId) return;
    
    setIsCreating(true);
    NProgress.start();
    
    try {
      // Define initial draft generator
      const initialDraftGenerator = (id: string) => ({
          id,
          title: 'New Form',
          pages: [{ id: 'page-1', title: 'Page 1', sections: [] }],
          rules: []
      });

      const result = await dispatch(createResource({ 
        orgId, 
        moduleId: 'hire', 
        resourceType: 'forms',
        data: {
            name: 'New Form', 
            description: '' 
        },
        initialDraftData: initialDraftGenerator
      })).unwrap();
      
      if (result.resource.id) {
        navigate(`/orgs/${orgId}/forms/${result.resource.id}`);
      }
    } catch (error) {
       console.error("Failed to create form", error);
    } finally {
       setIsCreating(false);
       NProgress.done();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orgId || !formToDelete) return;
    
    setIsDeleting(true);
    NProgress.start();
    try {
      await dispatch(deleteResource({ orgId, moduleId: 'hire', resourceType: 'forms', resourceId: formToDelete.id })).unwrap();
      // Refresh list (resourceSlice handle update automatically but fetching ensures consistency if needed, though deleteResource reducer updates local state)
      // No need to fetchResources again if reducer works, but fetching is safer for shared resources lists sometimes.
      // Actually resourceSlice reducer filters it out.
    } catch (error) {
      console.error("Failed to delete form", error);
    } finally {
      NProgress.done();
      setIsDeleting(false);
      setFormToDelete(null);
    }
  };

  if (!orgId) return null;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <Heading>Forms</Heading>
        <Button 
          onClick={handleCreateForm} 
          disabled={isCreating}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-tight shadow-lg shadow-primary/10 rounded-xl px-5 transition-all duration-200"
        >
          {isCreating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
          ) : (
            <PlusIcon className="mr-2 h-4 w-4" />
          )}
          {isCreating ? 'Creating...' : 'Create Form'}
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-lg shadow-sm border border-border">
         <ResourceTable
            orgId={orgId}
            moduleId="hire"
            resourceType="forms"
            onRowClick={(resource: any) => navigate(`/orgs/${orgId}/forms/${resource.id}`)}
            onDelete={(resource: any) => setFormToDelete(resource as FormDoc)}
            onCreate={handleCreateForm}
         />
      </div>

      <Dialog open={!!formToDelete} onClose={() => setFormToDelete(null)}>
        <DialogTitle>Delete Form</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete form "{formToDelete?.name}"? This action cannot be undone.
        </DialogDescription>
        <DialogActions>
          <Button variant="ghost" onClick={() => setFormToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteConfirm} 
            disabled={isDeleting}
            className="rounded-lg shadow-sm font-medium"
          >
            {isDeleting && (
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent mr-2" />
            )}
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
