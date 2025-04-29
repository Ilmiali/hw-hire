import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Avatar } from '../components/avatar';
import { useState } from 'react';
import { MembersTable, Member } from './MembersTable';
import { GroupsTable, Group } from './GroupsTable';

interface CreateViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, groups: Group[], members: Member[]) => void;
}

export function CreateViewDialog({ isOpen, onClose, onCreate }: CreateViewDialogProps) {
  const [name, setName] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), groups, members);
      setName('');
      setGroups([]);
      setMembers([]);
      onClose();
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
          style={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
          }}
          className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 transition-colors"
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

            <GroupsTable 
              groups={groups}
              onGroupsChange={setGroups}
            />

            <MembersTable 
              members={members}
              onMembersChange={setMembers}
            />

            <DialogActions>
              <Button type="submit" color="blue">Create view</Button>
            </DialogActions>
          </form>
        </DialogBody>
      </div>
    </Dialog>
  );
} 