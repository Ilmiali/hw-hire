import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { createGroup, updateGroup, fetchGroups, selectGroupById } from '../store/slices/groupsSlice';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Textarea } from '../components/textarea';
import { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '../store';

import { MembersTable, Member } from './MembersTable';
import { fetchUsers } from '../store/slices/usersSlice';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
}

export function CreateGroupDialog({ isOpen, onClose, groupId }: CreateGroupDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currentOrganization = useSelector(selectCurrentOrganization);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const existingGroup = useSelector((state: RootState) => groupId ? selectGroupById(state, groupId) : null);

  useEffect(() => {
    console.log('groupId', groupId);
    console.log('existingGroup', existingGroup);
    if (existingGroup && currentOrganization) {
      setName(existingGroup.name);
      setDescription(existingGroup.description || '');
      
      // Fetch member details
      if (existingGroup.members) {
        dispatch(fetchUsers(currentOrganization.id))
          .unwrap()
          .then(users => {
            const memberDetails = existingGroup.members.map(memberId => {
              const user = users.find(u => u.id === memberId);
              return {
                id: memberId,
                name: user?.name || '',
                email: user?.email || '',
                role: user?.role || 'member'
              };
            });
            setMembers(memberDetails);
          });
      }
    } else {
      setName('');
      setDescription('');
      setMembers([]);
    }
  }, [existingGroup, currentOrganization, groupId, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !currentUser) return;

    setIsSubmitting(true);
    try {
      const groupData = {
        name,
        description,
        organizationId: currentOrganization.id,
        totalNumApplications: existingGroup?.totalNumApplications || 0,
        members: [...members.map(m => m.id), currentUser.uid],
        createdAt: existingGroup?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (groupId) {
        await dispatch(updateGroup({ id: groupId, ...groupData })).unwrap();
      } else {
        await dispatch(createGroup(groupData)).unwrap();
      }

      // Refresh groups list
      await dispatch(fetchGroups({ 
        organizationId: currentOrganization.id,
        userId: currentUser.uid
      })).unwrap();

      onClose();
    } catch (error) {
      console.error('Failed to save group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {groupId ? 'Edit Group' : 'Create New Group'}
        </DialogTitle>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter group description"
                rows={4}
              />
            </div>
            <MembersTable 
              members={members}
              onMembersChange={setMembers}
              ownerId={currentUser?.uid}
              currentUserId={currentUser?.uid}
            />
          </div>
        </DialogBody>
        <DialogActions>
          <Button type="button" onClick={onClose} color="dark/zinc">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : groupId ? 'Save Changes' : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 