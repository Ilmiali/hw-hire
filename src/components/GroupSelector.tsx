import { useState, useRef, useEffect } from 'react';
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

// Mock data for groups
const groups: Group[] = [
  { id: 1, name: 'Asiakas phone', members: [
    { id: '1-1', name: 'John Doe' },
    { id: '1-2', name: 'Jane Smith' }
  ]},
  { id: 2, name: 'Hoiwa Health', members: [
    { id: '2-1', name: 'Alice Johnson' },
    { id: '2-2', name: 'Bob Wilson' }
  ]},
  { id: 3, name: 'Hoiwa Health Rekry', members: [
    { id: '3-1', name: 'Carol Brown' },
    { id: '3-2', name: 'David Miller' }
  ]},
  { id: 4, name: 'HR', members: [
    { id: '4-1', name: 'Eva Davis' },
    { id: '4-2', name: 'Frank White' }
  ]},
  { id: 5, name: 'HR Phone', members: [
    { id: '5-1', name: 'Grace Lee' },
    { id: '5-2', name: 'Henry Clark' }
  ]},
  { id: 6, name: 'IT Tuki', members: [
    { id: '6-1', name: 'Ilmi Ali' },
    { id: '6-2', name: 'Lari Juva' }
  ]},
  { id: 7, name: 'Liitteet', members: [
    { id: '7-1', name: 'Kelly Chen' },
    { id: '7-2', name: 'Larry Moore' }
  ]},
  { id: 8, name: 'Oiwa HR', members: [
    { id: '8-1', name: 'Mary Wilson' },
    { id: '8-2', name: 'Nick Davis' }
  ]},
  { id: 9, name: 'Oiwa Rekry', members: [
    { id: '9-1', name: 'Oliver Brown' },
    { id: '9-2', name: 'Pam White' }
  ]},
  { id: 10, name: 'Palautteet', members: [
    { id: '10-1', name: 'Quinn Lee' },
    { id: '10-2', name: 'Rachel Kim' }
  ]},
  { id: 11, name: 'Palkka&Laskut', members: [
    { id: '11-1', name: 'Sam Johnson' },
    { id: '11-2', name: 'Tina Chen' }
  ]},
  { id: 12, name: 'Peruutukset', members: [
    { id: '12-1', name: 'Uma Patel' },
    { id: '12-2', name: 'Victor Garcia' }
  ]},
  { id: 13, name: 'Rekry', members: [
    { id: '13-1', name: 'Walter Scott' },
    { id: '13-2', name: 'Xena Liu' }
  ]},
];

interface GroupSelectorProps {
  onAssign?: (selection: { groupId: number; memberId?: string }) => void;
}

export function GroupSelector({ onAssign }: GroupSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showingMembers, setShowingMembers] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setSelectedGroup(group);
    setShowingMembers(true);
  };

  const handleBackToGroups = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowingMembers(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // If we have a selected group, open directly to its members
      setShowingMembers(!!selectedGroup);
    }
  };

  const handleAssign = (member?: Member) => {
    if (member && selectedGroup) {
      setSelectedMember(member);
      onAssign?.({ groupId: selectedGroup.id, memberId: member.id });
    } else if (selectedGroup) {
      setSelectedMember(null);
      onAssign?.({ groupId: selectedGroup.id });
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
        <div className="absolute z-10 mt-1 w-[280px] -ml-[4px] overflow-auto rounded-md bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none max-h-[85vh]">
          {showingMembers && selectedGroup ? (
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
                <span className="font-medium">Assign to {selectedGroup.name}</span>
                {selectedGroup && !selectedMember && (
                  <CheckIcon className="h-5 w-5 text-blue-500 absolute right-3" />
                )}
              </button>

              {/* Members list */}
              <div className="py-1">
                {selectedGroup.members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleAssign(member)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center text-gray-900 dark:text-white relative"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>{member.name}</span>
                    {selectedMember?.id === member.id && (
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
              {groups.map((group) => (
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