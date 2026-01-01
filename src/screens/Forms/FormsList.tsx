import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { useState, useEffect, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/badge';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createForm, deleteForm } from '../../store/slices/formsSlice';
import { fetchResources } from '../../store/slices/resourceSlice';
import NProgress from 'nprogress';
import { DataTable, Field } from '../../data-components/dataTable';
import { Form } from '../../types/forms';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '../../components/dialog';

type FormDoc = Omit<Form, 'createdAt' | 'updatedAt'> & { 
  createdAt?: Date;
  updatedAt?: Date;
  data: Record<string, unknown>;
};

const fields: Field<FormDoc>[] = [
  { key: 'name', label: 'Name', sortable: true, isLink: true },
  { 
    key: 'status', 
    label: 'Status',
    render: (item: FormDoc) => (
      <Badge color={item.status === 'active' ? 'green' : 'zinc'}>
        {item.status}
      </Badge>
    )
  },
  { 
    key: 'publishedVersionId', 
    label: 'Published Version',
    render: (item: FormDoc) => item.publishedVersionId || 'None'
  },
  { key: 'updatedAt', label: 'Updated At', type: 'date', sortable: true },
  { key: 'actions', label: 'Actions', type: 'actions' },
];

export default function FormsList() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { resources, loading: isLoadingResources, error: resourceError } = useSelector((state: RootState) => state.resource);
  const formsRaw = resources['forms'] || [];

  const [isCreating, setIsCreating] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    console.log('[FormsList] Current state:', { orgId, formsCount: formsRaw.length, loading: isLoadingResources, error: resourceError });
    if (orgId) {
       dispatch(fetchResources({ orgId, moduleId: 'hire', resourceType: 'forms' }));
    }
  }, [orgId, dispatch]);

  const formsData = useMemo(() => {
    console.log('[FormsList] Mapping formsRaw:', formsRaw);
    return formsRaw.map(f => ({
        ...f,
        createdAt: f.createdAt ? new Date(f.createdAt) : undefined,
        updatedAt: f.updatedAt ? new Date(f.updatedAt) : undefined,
    })) as FormDoc[];
  }, [formsRaw]);

  const handleCreateForm = async () => {
    if (!orgId) return;
    
    setIsCreating(true);
    NProgress.start();
    
    try {
      const result = await dispatch(createForm({ 
        orgId, 
        name: 'New Form', 
        description: '' 
      })).unwrap();
      
      if (result.id) {
        navigate(`/orgs/${orgId}/forms/${result.id}`);
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
      await dispatch(deleteForm({ orgId, formId: formToDelete.id })).unwrap();
      // Refresh list
      dispatch(fetchResources({ orgId, moduleId: 'hire', resourceType: 'forms' }));
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
        <Button onClick={handleCreateForm} disabled={isCreating}>
          <PlusIcon />
          {isCreating ? 'Creating...' : 'Create Form'}
        </Button>
      </div>

      <div className="flex-1 min-h-0">
         {isLoadingResources && formsData.length === 0 ? (
             <div className="flex items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
             </div>
         ) : (
            <DataTable<FormDoc>
              data={formsData}
              fields={fields}
              selectable={false}
              sticky
              isLink={false}
              actions={['edit', 'delete']}
              onAction={async (action, item) => {
                if (action === 'edit' || action === 'view') {
                  navigate(`/orgs/${orgId}/forms/${item.id}`);
                } else if (action === 'delete') {
                  setFormToDelete(item);
                }
              }}
            />
         )}
      </div>

      <Dialog open={!!formToDelete} onClose={() => setFormToDelete(null)}>
        <DialogTitle>Delete Form</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete form "{formToDelete?.name}"? This action cannot be undone.
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setFormToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteConfirm} loading={isDeleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
