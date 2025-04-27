import { useState, useRef, useEffect } from 'react';
import { Avatar } from './avatar';
import { ChevronUpDownIcon, ChevronLeftIcon, UserGroupIcon, UserCircleIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/20/solid';

interface Member {
  id: string;
  name: string;
}

interface Group {
  id: number;
  name: string;
  members: Member[];
}

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId?: number;
  selectedMemberId?: string;
  onAssign: (selection: { groupId: number; memberId?: string }) => void;
}

export function GroupSelector({ 
  groups = [], // Provide default empty array
  selectedGroupId,
  selectedMemberId,
  onAssign 
}: GroupSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showingMembers, setShowingMembers] = useState(false);
  const [viewedGroup, setViewedGroup] = useState<Group | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive selected group and member from props with safety checks
  const selectedGroup = selectedGroupId && groups?.length > 0 
    ? groups.find(g => g.id === selectedGroupId) ?? null 
    : null;
  
  const selectedMember = selectedGroup && selectedMemberId && selectedGroup.members?.length > 0
    ? selectedGroup.members.find(m => m.id === selectedMemberId) ?? null 
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGroupClick = (group: Group) => {
    if (!group) return;
    setViewedGroup(group);
    setShowingMembers(true);
  };

  const handleBackToGroups = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowingMembers(false);
    setViewedGroup(null);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && selectedGroup) {
      setViewedGroup(selectedGroup);
      setShowingMembers(true);
    }
  };

  const handleAssign = (member?: Member) => {
    if (!viewedGroup) return;
    
    if (member) {
      onAssign({ groupId: viewedGroup.id, memberId: member.id });
    } else {
      onAssign({ groupId: viewedGroup.id });
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedGroup) return "Assignee";
    if (selectedMember) return `${selectedGroup.name}/${selectedMember.name}`;
    return selectedGroup.name;
  };

  return (
    <div className="w-72" ref={containerRef}>
      <button
        onClick={toggleDropdown}
        className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-zinc-900 py-2 pl-3 pr-10 text-left border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-white"
      >
        <div className="flex items-center">
          <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="block truncate">
            {getDisplayText()}
          </span>
        </div>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 overflow-auto rounded-md bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none max-h-[85vh]">
          {showingMembers && viewedGroup ? (
            <div>
              {/* Header with back button */}
              <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-zinc-800">
                <button
                  onClick={handleBackToGroups}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  <span>Groups</span>
                </button>
              </div>
              
              {/* Group name */}
              <button
                onClick={() => handleAssign()}
                className="w-full flex items-center px-3 py-2 border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white relative"
              >
                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">Assign to {viewedGroup.name}</span>
                {selectedGroup?.id === viewedGroup.id && !selectedMember && (
                  <CheckIcon className="h-5 w-5 text-blue-500 absolute right-3" />
                )}
              </button>

              {/* Members list */}
              <div className="py-1">
                {viewedGroup.members?.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleAssign(member)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center text-gray-900 dark:text-white relative"
                  >
                    <Avatar
                      initials={member.name.split(' ').map(n => n[0]).join('')}
                      className="mr-2 h-5 w-5"
                    />
                    <span>{member.name}</span>
                    {selectedMember?.id === member.id && selectedGroup?.id === viewedGroup.id && (
                      <CheckIcon className="h-5 w-5 text-blue-500 absolute right-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="px-3 py-2 border-b border-gray-200 dark:border-zinc-800">
                <span className="font-medium text-gray-900 dark:text-white">Groups</span>
              </div>
              {groups?.map((group) => (
                <button
                  key={group.id}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white"
                  onClick={() => handleGroupClick(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{group.name}</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 