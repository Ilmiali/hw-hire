import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { createView, fetchOrganizationViews } from '../store/slices/viewsSlice';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { useState } from 'react';
import { MembersTable, Member } from './MembersTable';
import { GroupsTable, Group } from './GroupsTable';
import { ColorPickerCard } from '../components/ColorPickerCard';
import { ColorOption } from '../components/ColorPickerDialog';
import { EmojiPicker } from '../components/EmojiPicker';
import { AppDispatch, RootState } from '../store';

interface CreateViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateViewDialog({ isOpen, onClose }: CreateViewDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>({ id: 'blue', type: 'solid', value: '#64B5F6' });
  const [selectedEmoji, setSelectedEmoji] = useState('📋');
  const currentOrganization = useSelector(selectCurrentOrganization);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleCreate = () => {
    if (name.trim() && currentOrganization) {
      const groupIds = groups.map(group => group.id);
      const memberIds = members.map(member => member.id);
      
      dispatch(createView({
        name: name.trim(),
        organizationId: currentOrganization.id,
        members: memberIds,
        groups: groupIds,
        layout: {
          cover: selectedColor.value,
          coverType: selectedColor.type === 'gradient' ? 'gradient' : 'flat',
          iconType: 'emoji',
          icon: selectedEmoji
        }
      }));

      dispatch(fetchOrganizationViews({ organizationId: currentOrganization.id, userId: user.uid }));

      setName('');
      setGroups([]);
      setMembers([]);
      onClose();
    }
  };

  const isCreateDisabled = !name.trim() || groups.length === 0;

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
          <div className="space-y-6">
            {/* Cover Color */}
            <ColorPickerCard
              label="View Cover"
              initialColor={selectedColor}
              onColorChange={setSelectedColor}
              className="mb-6"
            />

            {/* Emoji & Name */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen(true)}
                className="relative group h-10 w-10 flex items-center justify-center rounded-lg text-2xl"
                style={{ background: selectedColor.value }}
              >
                <span className="transform group-hover:scale-110 transition-transform">
                  {selectedEmoji}
                </span>
                <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-blue-500 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Change</span>
                </div>
              </button>
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
              <Button 
                type="button" 
                onClick={handleCreate} 
                color="blue"
                disabled={isCreateDisabled}
              >
                Create view
              </Button>
            </DialogActions>
          </div>
        </DialogBody>
      </div>

      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={setSelectedEmoji}
      />
    </Dialog>
  );
} 