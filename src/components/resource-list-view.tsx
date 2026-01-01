import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { createResource, deleteResource } from '../store/slices/resourceSlice';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/16/solid';
import { Heading } from './heading';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from './dialog';
import { ResourceTable } from './resource-table';
import NProgress from 'nprogress';

interface ResourceListViewProps {
  title: string;
  description?: string;
  orgId: string;
  moduleId: string;
  resourceType: string;
  resourceName: string; // e.g., "Form" or "Pipeline"
  createButtonText?: string;
  onCreate?: () => void; // Optional override for custom creation flow
  initialDraftGenerator?: (id: string) => any;
  onRowClick: (resource: any) => void;
  createData?: Record<string, any>;
  children?: React.ReactNode;
}

export function ResourceListView({
  title,
  description,
  orgId,
  moduleId,
  resourceType,
  resourceName,
  createButtonText,
  onCreate,
  initialDraftGenerator,
  onRowClick,
  createData = { name: `New ${resourceName}`, description: '' },
  children
}: ResourceListViewProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isCreating, setIsCreating] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDefaultCreate = async () => {
    if (!orgId) return;
    
    setIsCreating(true);
    NProgress.start();
    
    try {
      const result = await dispatch(createResource({ 
        orgId, 
        moduleId, 
        resourceType,
        data: createData,
        initialDraftData: initialDraftGenerator
      })).unwrap();
      
      if (result.resource.id) {
        navigate(`/orgs/${orgId}/${resourceType}/${result.resource.id}`);
      }
    } catch (error) {
       console.error(`Failed to create ${resourceName.toLowerCase()}`, error);
    } finally {
       setIsCreating(false);
       NProgress.done();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orgId || !resourceToDelete) return;
    
    setIsDeleting(true);
    NProgress.start();
    try {
      await dispatch(deleteResource({ 
        orgId, 
        moduleId, 
        resourceType, 
        resourceId: resourceToDelete.id 
      })).unwrap();
    } catch (error) {
      console.error(`Failed to delete ${resourceName.toLowerCase()}`, error);
    } finally {
      NProgress.done();
      setIsDeleting(false);
      setResourceToDelete(null);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6 flex-shrink-0">
        <div>
          <Heading>{title}</Heading>
          {description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        <Button 
          onClick={onCreate || handleDefaultCreate} 
          disabled={isCreating}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-tight shadow-lg shadow-primary/10 rounded-xl px-5 transition-all duration-200"
        >
          {isCreating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
          ) : (
            <PlusIcon className="mr-2 h-4 w-4" />
          )}
          {isCreating ? 'Creating...' : (createButtonText || `Create ${resourceName}`)}
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-lg shadow-sm border border-border">
         <ResourceTable
            orgId={orgId}
            moduleId={moduleId}
            resourceType={resourceType}
            onRowClick={onRowClick}
            onDelete={(resource: any) => setResourceToDelete(resource)}
            onCreate={onCreate || handleDefaultCreate}
         />
      </div>

      <Dialog open={!!resourceToDelete} onClose={() => setResourceToDelete(null)}>
        <DialogTitle>Delete {resourceName}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {resourceName.toLowerCase()} "{resourceToDelete?.name}"? This action cannot be undone.
        </DialogDescription>
        <DialogActions>
          <Button variant="ghost" onClick={() => setResourceToDelete(null)} disabled={isDeleting}>
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

      {children}
    </div>
  );
}
