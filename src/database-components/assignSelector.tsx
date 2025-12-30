import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGroups, fetchGroupById } from '../store/slices/groupsSlice';
import { fetchUserById } from '../store/slices/usersSlice';
import { GroupSelector } from '../data-components/groupSelector';
import { Group } from '../types/group';
import { User } from '../store/slices/usersSlice';
import { useSelector } from 'react-redux';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { RootState } from '../store';
import { updateApplication } from '../store/slices/applicationsSlice';

interface AssignSelectorProps {
  currentApplication: {
    id: string;
    groupId?: string;
    assignedTo?: string | null;
  };
  onAssign?: (params: { groupId: string; memberId?: string }) => void;
}

export function AssignSelector({ currentApplication, onAssign }: AssignSelectorProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>();
  const [groupMembers, setGroupMembers] = useState<Record<string, User>>({});
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
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
    if (currentApplication?.groupId) {
      dispatch(fetchGroupById(currentApplication.groupId));
    }
  }, [dispatch, currentApplication?.groupId]);

  // Set the selected group ID and member ID from the current ticket
  useEffect(() => {
    if (currentApplication?.groupId) {
      setSelectedGroupId(currentApplication.groupId);
    }
    if (currentApplication?.assignedTo) {
      setSelectedMemberId(currentApplication.assignedTo);
    }
  }, [currentApplication?.groupId, currentApplication?.assignedTo]);

  // Fetch user data for group members
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (currentApplication?.groupId) {
        setIsLoadingMembers(true);
        const group = groups.find((g: Group) => g.id === currentApplication.groupId);
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
          } finally {
            setIsLoadingMembers(false);
          }
        }
      }
    };

    fetchGroupMembers();
  }, [dispatch, currentApplication?.groupId, groups]);

  const handleAssign = async ({ groupId, memberId }: { groupId: string; memberId?: string }) => {
    setSelectedGroupId(groupId);
    setSelectedMemberId(memberId);
    // Update the ticket with new group and assignee
    await dispatch(updateApplication({ 
      id: currentApplication.id, 
      data: { 
        groupId,
        assignedTo: memberId || null
      } 
    })).unwrap();
    
    // Call the onAssign callback if provided
    if (onAssign) {
      onAssign({ groupId, memberId });
    }
  };

  if (groupLoading || isLoadingMembers) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Assignee</label>
        <div className="w-72 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
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