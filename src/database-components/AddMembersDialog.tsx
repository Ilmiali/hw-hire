import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Autosuggest, BaseItem } from '../components/autosuggest';
import { useState } from 'react';

interface Member extends BaseItem {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

// Mock data for possible members
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    avatarUrl: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Viewer',
    avatarUrl: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '4',
    name: 'Elmi',
    email: 'elmi@example.com',
    role: 'Member',
    avatarUrl: ''
  }
];

interface AddMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (members: Member[]) => void;
}

export function AddMembersDialog({ isOpen, onClose, onAdd }: AddMembersDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

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

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add Team Members</DialogTitle>
      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Autosuggest<Member>
            items={mockMembers}
            selectedItems={selectedMembers}
            onSelect={handleSelect}
            onRemove={handleRemove}
            placeholder="Type a name or email..."
            filterItem={(member, query) =>
              member.name.toLowerCase().includes(query.toLowerCase()) ||
              member.email.toLowerCase().includes(query.toLowerCase())
            }
          />
          <DialogActions>
            <Button type="submit" disabled={selectedMembers.length === 0}>Add Members</Button>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
} 