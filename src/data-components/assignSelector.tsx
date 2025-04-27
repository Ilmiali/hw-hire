import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGroups, fetchGroupById } from '../store/slices/groupsSlice';
import { fetchUserById } from '../store/slices/usersSlice';
import { GroupSelector } from '../components/group-selector';
import { Group } from '../types/group';
import { User } from '../store/slices/usersSlice';
import { useSelector } from 'react-redux';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { RootState } from '../store';

interface AssignSelectorProps {
  currentTicket: {
    groupId?: string;
  };
  onAssign: (params: { groupId: number; memberId?: string }) => void;
}

export function AssignSelector({ currentTicket, onAssign }: AssignSelectorProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>();
  const [groupMembers, setGroupMembers] = useState<Record<string, User>>({});
  const currentOrganization = useSelector(selectCurrentOrganization);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  
  const dispatch = useAppDispatch();
  const { groups, loading: groupLoading, error: groupError } = useAppSelector((state) => ({
    groups: state.groups.groups,
    loading: state.groups.loading,
    error: state.groups.error
  }));

  // Fetch all groups where user is a member
  useEffect(() => {
    const organizationId = currentOrganization?.id;
    if (organizationId && userId) {
      dispatch(fetchGroups({ organizationId, userId }));
    }
  }, [dispatch, currentOrganization?.id, userId]);

  // Fetch current group when ticket is loaded
  useEffect(() => {
    if (currentTicket?.groupId) {
      dispatch(fetchGroupById(currentTicket.groupId));
    }
  }, [dispatch, currentTicket?.groupId]);

  // Set the selected group ID from the current ticket
  useEffect(() => {
    if (currentTicket?.groupId) {
      setSelectedGroupId(parseInt(currentTicket.groupId));
    }
  }, [currentTicket?.groupId]);

  // Fetch user data for group members
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (currentTicket?.groupId) {
        const group = groups.find((g: Group) => g.id === currentTicket.groupId);
        if (group) {
          const memberPromises = group.members.map((memberId: string) => 
            dispatch(fetchUserById(memberId)).unwrap()
          );
          
          try {
            const members = await Promise.all(memberPromises);
            const membersMap = members.reduce((acc: Record<string, User>, user: User) => {
              acc[user.id] = user;
              return acc;
            }, {} as Record<string, User>);
            setGroupMembers(membersMap);
          } catch (error) {
            console.error('Failed to fetch group members:', error);
          }
        }
      }
    };

    fetchGroupMembers();
  }, [dispatch, currentTicket?.groupId, groups]);

  const handleAssign = ({ groupId, memberId }: { groupId: number; memberId?: string }) => {
    setSelectedGroupId(groupId);
    setSelectedMemberId(memberId);
    onAssign({ groupId, memberId });
  };

  if (groupLoading) {
    return <div>Loading...</div>;
  }

  if (groupError) {
    return <div className="text-red-500">Error: {groupError}</div>;
  }

  // Transform groups into the format expected by GroupSelector
  const transformedGroups = groups.map((group: Group) => ({
    id: group.id,
    name: group.name,
    members: group.members.map((memberId: string) => {
      const member = groupMembers[memberId];
      return {
        id: memberId,
        name: member?.name || memberId,
        email: member?.email || '',
        role: member?.role || ''
      };
    })
  }));

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Assignee</label>
      <GroupSelector
        groups={transformedGroups}
        selectedGroupId={selectedGroupId}
        selectedMemberId={selectedMemberId}
        onAssign={handleAssign}
      />
    </div>
  );
} 