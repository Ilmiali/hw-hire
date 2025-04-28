import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { BaseItem } from '../components/autosuggest';
import { DatabaseAutosuggest } from './databaseAutosuggest';
import { useState } from 'react';
import { DatabaseFactory } from '../services/factories/databaseFactory';
import { Avatar } from '../components/avatar';
interface Member extends BaseItem {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AddMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (members: Member[]) => void;
}

export function AddMembersDialog({ isOpen, onClose, onAdd }: AddMembersDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const database = DatabaseFactory.getInstance().getDatabase('firestore');

  const handleSelect = (member: Member) => {
    setSelectedMembers(prev => [...prev, member]);
  };

  const handleRemove = (id: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length > 0) {
      onAdd(selectedMembers);
      setSelectedMembers([]);
      onClose();
    }
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
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add Team Members</DialogTitle>
      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatabaseAutosuggest<Member>
            collectionName="users"
            database={database}
            selectedItems={selectedMembers}
            onSelect={handleSelect}
            onRemove={handleRemove}
            placeholder="Type a name or email..."
            searchField="name"
            queryOptions={{
              constraints: [
              
              ]
            }}
            renderItem={renderMember}
          />
          <DialogActions>
            <Button type="submit" disabled={selectedMembers.length === 0}>Add Members</Button>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
} 