import { DatabaseEntitiesTable } from '../../database-components/DatabaseEntitiesTable';
import { Field } from '../../data-components/dataTable';
import { Entity } from '../../database-components/entitiesTable';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectCurrentOrganization } from '../../store/slices/organizationSlice';
import { ActionDropdown } from '../../components/action-dropdown';
import { EyeIcon } from '@heroicons/react/16/solid';

interface View extends Entity {
  name: string;
  description: string;
  createdAt: string;
  isDefault: boolean;
  layout: {
    cover: {
      type: string,
      value: string,
    },
    icon: {
      type: string,
      value: string,
    },
  }
  organizationId: string;
  ownerId: string;
}

const handleViewAction = (action: 'view' | 'edit' | 'delete', view: View) => {
  // Handle view actions here
  console.log(`${action} view:`, view);
};

const viewFields: Field<View>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (view: View) => (
      <div className="flex items-center gap-3">
        <div 
          className="w-6 h-6 rounded-lg flex items-center justify-center text-lg"
          style={{ 
            background: view.layout.cover.type === 'gradient' 
              ? view.layout.cover.value 
              : view.layout.cover.value 
          }}
        >
          {view.layout.icon.value}
        </div>
        <span>{view.name}</span>
      </div>
    )
  },
  {
    key: 'createdAt',
    label: 'Created At',
    render: (view: View) => {
      const date = new Date(view.createdAt);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {formattedDate}
        </span>
      );
    }
  },
  {
    key: 'actions',
    label: '',
    render: (view: View) => (
      <div className="flex justify-end">
        <ActionDropdown
          onEdit={() => handleViewAction('edit', view)}
          onDelete={() => handleViewAction('delete', view)}
          customItems={[
            {
              label: 'View',
              icon: <EyeIcon className="h-4 w-4" />,
              onClick: () => handleViewAction('view', view)
            }
          ]}
        />
      </div>
    )
  }
];

export function ViewsSettings() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentOrganization = useSelector(selectCurrentOrganization);
  console.log(currentOrganization)
  console.log(currentUser)

  // Don't render the table if we don't have the required data
  if (!currentUser || !currentOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Views</h2>
          <p className="text-zinc-600 dark:text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Views</h2>
        <p className="text-zinc-600 dark:text-zinc-300">Manage your view preferences and custom views here.</p>
      </div>
      
      <DatabaseEntitiesTable<View>
        collection="views"
        fields={viewFields}
        title="Available Views"
        addButtonText="Add New View"
        onAction={handleViewAction}
        onAdd={() => console.log('Add new view')}
        queryOptions={{
          constraints: [
            { field: 'organizationId', operator: '==', value: currentOrganization.id },
            { field: 'owner', operator: '==', value: currentUser.uid }
          ]
        }}
      />
    </div>
  );
} 