import { useState } from 'react';
import { ChevronUpDownIcon, ChevronLeftIcon, UserGroupIcon, UserCircleIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

// Mock data for groups
const groups = [
  { id: 1, name: 'Asiakas phone', members: ['John Doe', 'Jane Smith'] },
  { id: 2, name: 'Hoiwa Health', members: ['Alice Johnson', 'Bob Wilson'] },
  { id: 3, name: 'Hoiwa Health Rekry', members: ['Carol Brown', 'David Miller'] },
  { id: 4, name: 'HR', members: ['Eva Davis', 'Frank White'] },
  { id: 5, name: 'HR Phone', members: ['Grace Lee', 'Henry Clark'] },
  { id: 6, name: 'IT Tuki', members: ['Ilmi Ali', 'Lari Juva'] },
  { id: 7, name: 'Liitteet', members: ['Kelly Chen', 'Larry Moore'] },
  { id: 8, name: 'Oiwa HR', members: ['Mary Wilson', 'Nick Davis'] },
  { id: 9, name: 'Oiwa Rekry', members: ['Oliver Brown', 'Pam White'] },
  { id: 10, name: 'Palautteet', members: ['Quinn Lee', 'Rachel Kim'] },
  { id: 11, name: 'Palkka&Laskut', members: ['Sam Johnson', 'Tina Chen'] },
  { id: 12, name: 'Peruutukset', members: ['Uma Patel', 'Victor Garcia'] },
  { id: 13, name: 'Rekry', members: ['Walter Scott', 'Xena Liu'] },
];

export function GroupSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showingMembers, setShowingMembers] = useState(false);

  const handleGroupClick = (group: typeof groups[0]) => {
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
      setShowingMembers(false);
    }
  };

  const handleAssign = (member?: string) => {
    if (member) {
      setSelectedMember(member);
      console.log(`Assigning to member: ${member}`);
    } else {
      setSelectedMember(null);
      console.log(`Assigning to group: ${selectedGroup?.name}`);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!selectedGroup) return "Assignee";
    if (selectedMember) return `${selectedGroup.name}/${selectedMember}`;
    return selectedGroup.name;
  };

  return (
    <div className="w-72">
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
                className="w-full flex items-center px-3 py-2 border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-white"
              >
                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">Assign to {selectedGroup.name}</span>
              </button>

              {/* Members list */}
              <div className="py-1">
                {selectedGroup.members.map((member, index) => (
                  <button
                    key={index}
                    onClick={() => handleAssign(member)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center text-gray-900 dark:text-white"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    {member}
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