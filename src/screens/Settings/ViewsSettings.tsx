import { DatabaseEntitiesTable } from '../../database-components/DatabaseEntitiesTable';
import { Field } from '../../data-components/dataTable';
import { Entity } from '../../database-components/entitiesTable';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectCurrentOrganization } from '../../store/slices/organizationSlice';

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

const viewFields: Field<View>[] = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'isDefault', label: 'Default', type: 'checkbox' },
];

export function ViewsSettings() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentOrganization = useSelector(selectCurrentOrganization);
  console.log(currentOrganization)
  console.log(currentUser)
  const handleViewAction = (action: 'view' | 'edit' | 'delete', view: View) => {
    // Handle view actions here
    console.log(`${action} view:`, view);
  };

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