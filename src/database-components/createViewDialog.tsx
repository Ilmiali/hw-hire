import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Avatar } from '../components/avatar';
import { useState } from 'react';
import { DataTable, Field } from '../data-components/dataTable';
import { AddMembersDialog } from './addMembersDialog';

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



export function CreateViewDialog({ isOpen, onClose, onCreate }: CreateViewDialogProps) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
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
        <DialogTitle>Create a new view</DialogTitle>
        <div className="text-zinc-500 text-sm mb-4">Views allow you to organize tickets and filter them by group</div>
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
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="text-zinc-400 dark:text-zinc-500 mb-2">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No members added yet</p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Click "Add Member" to invite team members</p>
                </div>
              ) : (
                <DataTable
                  data={members}
                  fields={memberFields}
                  onAction={handleMemberAction}
                  dense
                />
              )}
            </div>

            <DialogActions>
              <Button type="submit">Create view</Button>
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