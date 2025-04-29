import { Avatar } from '../components/avatar';
import { Field } from '../data-components/dataTable';
import { useState } from 'react';
import { AddEntitiesDialog } from './AddEntitiesDialog';
import { EntitiesTable, Entity } from './EntitiesTable';

export interface Group extends Entity {
  id: string;
  name: string;
  totalNumTickets: number;
  members: string[];
}

interface GroupsTableProps {
  groups: Group[];
  onGroupsChange: (groups: Group[]) => void;
}

export function GroupsTable({ groups, onGroupsChange }: GroupsTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const groupFields: Field<Group>[] = [
    { 
      key: 'name', 
      label: 'Name',
      render: (group: Group) => (
        <div className="flex items-center gap-3">
          <Avatar 
            initials={group.name.split(' ').map(name => name[0]).join('').toUpperCase()} 
            variant="round" 
            className="size-8" 
          />
          <div className="flex flex-col">
            <span className="font-medium capitalize">{group.name}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{group.members.length} members</span>
          </div>
        </div>
      )
    },
    { key: 'totalNumTickets', label: 'Tickets' },
    { key: 'actions', label: '', type: 'actions' }
  ];

  const handleAddGroups = (newGroups: Group[]) => {
    onGroupsChange([...groups, ...newGroups]);
  };

  const renderGroup = (group: Group) => (
    <div className="flex items-center">
      <Avatar
        initials={group.name.split(' ').map(name => name[0]).join('')}
        className="w-6 h-6 mr-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
      />
      <div>
        <div className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{group.name}</div>
        <div className="text-sm text-zinc-500">{group.members.length} members</div>
      </div>
    </div>
  );

  return (
    <>
      <EntitiesTable<Group>
        entities={groups}
        showChips={true}
        fields={groupFields}
        nameField="name"
        title="Groups"
        addButtonText="Add Groups"
        onEntitiesChange={onGroupsChange}
        onAdd={() => setIsAddDialogOpen(true)}
        dense
      />

      <AddEntitiesDialog<Group>
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddGroups}
        collectionName="groups"
        searchField="name"
        title="Add Groups"
        renderItem={renderGroup}
      />
    </>
  );
} 