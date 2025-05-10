import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { createGroup, updateGroup, fetchGroups } from '../store/slices/groupsSlice';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { useState, useEffect } from 'react';
import { AppDispatch, RootState } from '../store';
import { Group } from '../types/group';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (groupId) {
      // TODO: Fetch group details if editing
    }
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !currentUser) return;

    setIsSubmitting(true);
    try {
      const groupData = {
        name,
        organizationId: currentOrganization.id,
        totalNumTickets: 0,
        members: [currentUser.uid],
        createdAt: new Date(),
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