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
  ownerId?: string;
  defineRole?: boolean;
  availableRoles?: string[];
  orgId?: string;
  moduleId?: string;
  currentUserId?: string;
}

export function MembersTable({ 
  members, 
  onMembersChange, 
  ownerId,
  defineRole = false,
  availableRoles = ['viewer', 'editor', 'owner'],
  orgId,
  moduleId,
  currentUserId,
}: MembersTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const ownerCount = members.filter(m => m.role === 'owner').length;
  const currentUserRole = members.find(m => m.id === currentUserId)?.role;

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
            member.id === ownerId || 
            (member.role === 'owner' && ownerCount === 1) ||
            (member.role === 'owner' && member.id !== currentUserId) ||
            (currentUserRole !== 'owner' && member.id !== currentUserId)
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
        onAdd={() => setIsAddDialogOpen(true)}
        dense
        actions={['delete']}
        isActionDisabled={(action, entity) => {
          if (action === 'delete') {
            const member = entity as Member;
            // 1. Only owners can remove themselves or others? 
            // The requirement: "only owner themselves can remove themselves"
            // And "cannot remove another owner"
            
            if (member.role === 'owner') {
              // Cannot remove another owner
              if (member.id !== currentUserId) return true;
              // Cannot remove if sole owner
              if (ownerCount <= 1) return true;
            } else {
              // Non-owners can be removed if user is an owner or editor
              if (currentUserRole !== 'owner' && currentUserRole !== 'editor') return true;
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
        ignoreList={[...members.map(m => m.id), ...(ownerId ? [ownerId] : [])]}
        orgId={orgId}
        moduleId={moduleId}
      />
    </>
  );
} 