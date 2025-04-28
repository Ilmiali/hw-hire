import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Avatar } from '../components/avatar';
import { useState } from 'react';
import { DataTable, Field } from '../data-components/dataTable';
import { AddMembersDialog } from './AddMembersDialog';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface CreateViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, members: Member[]) => void;
}

// Mock data for testing
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
  }
];

export function CreateViewDialog({ isOpen, onClose, onCreate }: CreateViewDialogProps) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const memberFields: Field<Member>[] = [
    { 
      key: 'name', 
      label: 'Name',
      render: (member: Member) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={member.avatarUrl} 
            initials={member.name[0].toUpperCase()} 
            variant="round" 
            className="size-8" 
          />
          <div className="flex flex-col">
            <span className="font-medium">{member.name}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</span>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: '', type: 'actions' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), members);
      setName('');
      setMembers([]);
      onClose();
    }
  };

  const handleAddMember = () => {
    setIsAddDialogOpen(true);
  };

  const handleAddMembers = (newMembers: Member[]) => {
    setMembers((prev) => [...prev, ...newMembers]);
  };

  const handleMemberAction = (action: 'view' | 'edit' | 'delete', member: Member) => {
    if (action === 'delete') {
      setMembers(members.filter(m => m.id !== member.id));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="relative">
        {/* Close (X) button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <DialogTitle>Create a new teamspace</DialogTitle>
        <div className="text-zinc-500 text-sm mb-4">Teamspaces are where your team organizes pages, permissions, and members</div>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Icon & Name */}
            <div className="flex items-center gap-3">
              <Avatar initials={name ? name[0].toUpperCase() : 'T'} variant="round" className="size-10" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Labs"
                required
                className="flex-1"
              />
            </div>

            {/* Members Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Team Members</h3>
                <Button onClick={handleAddMember} type="button">
                  Add Member
                </Button>
              </div>
              <DataTable
                data={members}
                fields={memberFields}
                onAction={handleMemberAction}
                dense
              />
            </div>

            <DialogActions>
              <Button type="submit">Create teamspace</Button>
            </DialogActions>
          </form>
        </DialogBody>
        <AddMembersDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={handleAddMembers}
        />
      </div>
    </Dialog>
  );
} 