import { Avatar } from '../components/avatar';
import { Field } from '../data-components/dataTable';
import { useState } from 'react';
import { AddEntitiesDialog } from './AddEntitiesDialog';
import { EntitiesTable, Entity } from './entitiesTable';

export interface Member extends Entity {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface MembersTableProps {
  members: Member[];
  onMembersChange: (members: Member[]) => void;
}

export function MembersTable({ members, onMembersChange }: MembersTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const memberFields: Field<Member>[] = [
    { 
      key: 'name', 
      label: 'Name',
      render: (member: Member) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={member.avatarUrl} 
            initials={member.name.split(' ').map(name => name[0]).join('').toUpperCase()} 
            variant="round" 
            className="size-8" 
          />
          <div className="flex flex-col">
            <span className="font-medium capitalize">{member.name}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</span>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: '', type: 'actions' }
  ];

  const handleAddMembers = (newMembers: Member[]) => {
    onMembersChange([...members, ...newMembers]);
  };

  const renderMember = (member: Member) => (
    <div className="flex items-center">
      <Avatar
        src={member.avatarUrl}
        initials={member.name.split(' ').map(name => name[0]).join('')}
        className="w-6 h-6 mr-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
      />
      <div>
        <div className="flex items-center">
          <div className="font-medium text-zinc-900 dark:text-zinc-100 capitalize mr-2">{member.name}</div>
          <div className="text-sm text-zinc-500">{member.role}</div>
        </div>
        <div className="text-sm text-zinc-500">{member.email}</div>
      </div>
    </div>
  );

  return (
    <>
      <EntitiesTable<Member>
        entities={members}
        fields={memberFields}
        title="Team Members"
        showChips={true}
        addButtonText="Add Members"
        onEntitiesChange={onMembersChange}
        onAdd={() => setIsAddDialogOpen(true)}
        dense
      />

      <AddEntitiesDialog<Member>
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMembers}
        collectionName="users"
        searchField="name"
        title="Add Team Members"
        defineRole={true}
        availableRoles={['Admin', 'Editor', 'Viewer']}
        renderItem={renderMember}
      />
    </>
  );
} 