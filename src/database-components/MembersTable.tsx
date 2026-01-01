import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Field } from '../data-components/dataTable';
import { useState } from 'react';
import { AddEntitiesDialog } from './AddEntitiesDialog';
import { EntitiesTable, Entity } from './EntitiesTable';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  ownerIds: string[];
  defineRole?: boolean;
  availableRoles?: string[];
  orgId?: string;
  moduleId?: string;
  currentUserId?: string;
  isOwner?: boolean;
}

export function MembersTable({ 
  members, 
  onMembersChange, 
  ownerIds,
  defineRole = false,
  availableRoles = ['viewer', 'editor', 'owner'],
  orgId,
  moduleId,
  currentUserId,
  isOwner = false,
}: MembersTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);


  const handleRoleChange = (memberId: string, newRole: string) => {
    onMembersChange(
      members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    );
  };

  const memberFields: Field<Member>[] = [
    { 
      key: 'name', 
      label: 'Name',
      render: (member: Member) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback className="text-[10px] bg-primary/10">
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-sm capitalize">{member.name}</span>
            <span className="text-[11px] text-muted-foreground">{member.email}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (member: Member) => (
        <Select 
          value={member.role} 
          onValueChange={(value) => handleRoleChange(member.id, value)}
          disabled={
            !isOwner ||
            (ownerIds.includes(member.id) && (
              (member.id !== currentUserId) || // Cannot change role of other DB owners
              (ownerIds.length === 1) // Cannot change own role if sole DB owner
            ))
          }
        >
          <SelectTrigger className="h-7 w-[100px] text-[11px] capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map(role => (
              <SelectItem key={role} value={role} className="text-[11px] capitalize">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    { key: 'actions', label: '', type: 'actions' }
  ];

  const handleAddMembers = (newMembers: Member[]) => {
    onMembersChange([...members, ...newMembers]);
  };

  const renderMember = (member: Member) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7">
        <AvatarImage src={member.avatarUrl} />
        <AvatarFallback className="text-[10px]">
          {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm capitalize">{member.name}</span>
          <Badge variant="secondary" className="text-[9px] px-1 h-3.5 border-0 font-normal">
            {member.role}
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground">{member.email}</span>
      </div>
    </div>
  );

  return (
    <>
      <EntitiesTable<Member>
        entities={members}
        fields={memberFields}
        title="Access List"
        showChips={false}
        addButtonText="Grant Access"
        onEntitiesChange={onMembersChange}
        onAdd={isOwner ? () => setIsAddDialogOpen(true) : undefined}
        dense
        actions={['delete']}
        isActionDisabled={(action, entity) => {
          if (!isOwner) return true; // Non-owners cannot take any action
          if (action === 'delete') {
            const member = entity as Member;
            if (ownerIds.includes(member.id)) {
              if (member.id !== currentUserId) return true; // Cannot remove other DB owners
              if (ownerIds.length <= 1) return true; // Cannot remove self if sole DB owner
            }
          }
          return false;
        }}
      />

      <AddEntitiesDialog<Member>
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMembers}
        collectionName="users"
        searchField="name"
        title="Add Team Members"
        renderItem={renderMember}
        defineRole={defineRole}
        availableRoles={availableRoles}
        ignoreList={[...members.map(m => m.id), ...ownerIds]}
        orgId={orgId}
        moduleId={moduleId}
      />
    </>
  );
} 