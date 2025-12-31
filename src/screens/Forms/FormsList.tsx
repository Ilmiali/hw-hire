import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { useState, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/badge';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createForm, deleteForm } from '../../store/slices/formsSlice';
import NProgress from 'nprogress';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
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
  const [isCreating, setIsCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formToDelete, setFormToDelete] = useState<FormDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoize queryOptions to prevent infinite re-fetching in DatabaseTable
  const queryOptions = useMemo(() => ({}), []);

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
      setRefreshKey(prev => prev + 1);
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
         <DatabaseTable<FormDoc>
          key={refreshKey}
          collection={`orgs/${orgId}/modules/hire/forms`}
          fields={fields}
          pageSize={15}
          selectable={false}
          sticky
          isLink={false}
          actions={['edit', 'delete']}
          queryOptions={queryOptions}
          defaultSortField="updatedAt"
          defaultSortOrder="desc"
          onAction={async (action, item) => {
            if (action === 'edit' || action === 'view') {
              navigate(`/orgs/${orgId}/forms/${item.id}`);
            } else if (action === 'delete') {
              setFormToDelete(item);
            }
          }}
        />
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
