import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentOrganization } from '../../store/slices/organizationSlice';
import { RootState } from '../../store';
import { DatabaseEntitiesTable } from '../../database-components/DatabaseEntitiesTable';
import { Field } from '../../data-components/dataTable';
import { Group } from '../../types/group';
import { CreateGroupDialog } from '../../database-components/createGroupDialog';

export function GroupsSettings() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentOrganization = useSelector(selectCurrentOrganization);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const handleGroupAction = async(action: 'view' | 'edit' | 'delete' | 'create', group: Group | null) => {
    if (action === 'edit') {
      setEditingGroupId(group?.id || null);
      setIsCreateDialogOpen(true);
    } else if (action === 'create') {
      setEditingGroupId(null);
      setIsCreateDialogOpen(true);
    }
  };

  const groupFields: Field<Group>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (group: Group) => (
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-lg bg-blue-100 dark:bg-blue-900">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <span>{group.name}</span>
        </div>
      )
    },
    {
      key: 'totalNumTickets',
      label: 'Tickets',
      render: (group: Group) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {group.totalNumApplications}
        </span>
      )
    },
    {
      key: 'members',
      label: 'Members',
      render: (group: Group) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {group.members.length}
        </span>
      )
    },
    { key: 'actions', label: '', type: 'actions' }
  ];

  // Don't render the table if we don't have the required data
  if (!currentUser || !currentOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Groups</h2>
          <p className="text-zinc-600 dark:text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Groups</h2>
        <p className="text-zinc-600 dark:text-zinc-300">Manage your groups and group settings here.</p>
      </div>
      <CreateGroupDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingGroupId(null);
        }}
        groupId={editingGroupId || undefined}
      />
      <DatabaseEntitiesTable<Group>
        collection="groups"
        fields={groupFields}
        title="Available Groups"
        actions={['delete', 'edit']}
        addButtonText="Add New Group"
        onAction={handleGroupAction}
        onAdd={() => handleGroupAction('create', null)}
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