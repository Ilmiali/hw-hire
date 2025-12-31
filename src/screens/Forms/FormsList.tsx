import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { useState, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/16/solid';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/badge';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createForm } from '../../store/slices/formsSlice';
import NProgress from 'nprogress';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
import { Form } from '../../types/forms';

type FormDoc = Omit<Form, 'createdAt' | 'updatedAt'> & { 
  createdAt?: Date;
  updatedAt?: Date;
  data: Record<string, unknown>;
};

const fields: Field<FormDoc>[] = [
  { key: 'name', label: 'Name', sortable: true },
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
          collection={`orgs/${orgId}/modules/hire/forms`}
          fields={fields}
          pageSize={15}
          selectable={false}
          sticky
          isLink
          actions={['edit']}
          queryOptions={queryOptions}
          defaultSortField="updatedAt"
          defaultSortOrder="desc"
          onAction={(action, item) => {
            if (action === 'edit' || action === 'view') {
              navigate(`/orgs/${orgId}/forms/${item.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
