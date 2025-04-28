import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Avatar } from '../components/avatar';
import { useState, useRef } from 'react';

interface Member {
  id: string;
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
  const [query, setQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Filter out already selected members
  const filteredMembers = mockMembers.filter(
    m =>
      !selectedMembers.some(sel => sel.id === m.id) &&
      (m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (member: Member) => {
    setSelectedMembers(prev => [...prev, member]);
    setQuery('');
    setDropdownOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemove = (id: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleInputFocus = () => {
    setDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing dropdown to allow click
    setTimeout(() => setDropdownOpen(false), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length > 0) {
      onAdd(selectedMembers);
      setSelectedMembers([]);
      setQuery('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add Team Members</DialogTitle>
      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedMembers.map(member => (
                <span key={member.id} className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm">
                  <Avatar src={member.avatarUrl} initials={member.name[0]} className="w-5 h-5 mr-2" />
                  {member.name}
                  <button
                    type="button"
                    className="ml-2 text-zinc-500 hover:text-red-500 focus:outline-none"
                    onClick={() => handleRemove(member.id)}
                    aria-label={`Remove ${member.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Input
                ref={inputRef}
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Type a name or email..."
                className="w-full"
                autoComplete="off"
              />
              {dropdownOpen && filteredMembers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredMembers.map(member => (
                    <button
                      type="button"
                      key={member.id}
                      className="flex items-center w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                      onMouseDown={() => handleSelect(member)}
                    >
                      <Avatar src={member.avatarUrl} initials={member.name[0]} className="w-6 h-6 mr-2" />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-zinc-500">{member.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogActions>
            <Button type="submit" disabled={selectedMembers.length === 0}>Add Members</Button>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
} 