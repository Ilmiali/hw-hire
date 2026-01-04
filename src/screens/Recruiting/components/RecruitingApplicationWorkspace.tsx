import { ChevronRightIcon, ChevronLeftIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Badge } from '../../../components/badge';
import { RecruitingAssignSelector } from './RecruitingAssignSelector';
import { RecruitingApplication } from '../../../types/recruiting';
import { Avatar } from '../../../components/avatar';
import { UserIcon } from '@heroicons/react/24/solid';
import RecruitingApplicationDetail from '../RecruitingApplicationDetail';

interface Tab {
  id: string;
  name: string;
  subtitle?: string;
  avatar?: { type: 'text' | 'image'; value: string };
}

interface RecruitingApplicationWorkspaceProps {
  currentApplication: RecruitingApplication | null;
  openTabs: Tab[];
  activeTabId: string;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  onAssignChange: (params: { groupId: string; memberId?: string }) => void;
}

export function RecruitingApplicationWorkspace({
  currentApplication,
  openTabs,
  activeTabId,
  isExpanded,
  onExpandChange,
  onTabChange,
  onTabClose,
  onAssignChange
}: RecruitingApplicationWorkspaceProps) {

  const handleTabClick = (id: string) => {
    onTabChange(id);
  };

  const handleTabClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onTabClose(id);
  };

  if (!currentApplication) {
    return <div className="flex h-full items-center justify-center text-zinc-500">Select an application</div>;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const getBadgeColor = (stageId?: string): "blue" | "zinc" => {
      return 'blue';
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <div className="flex h-screen flex-col justify-between transition-all duration-300 w-full bg-white dark:bg-zinc-900">
      <div className="flex-1 overflow-y-auto h-screen flex flex-col">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="sticky top-0 z-20 backdrop-blur-md backdrop-filter bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex gap-1 px-2 py-1 overflow-x-auto">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  role="tab"
                  tabIndex={0}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap group cursor-pointer ${
                    tab.id === activeTabId
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate max-w-[150px]">
                    {tab.name}
                  </span>
                  <button
                    onClick={(e) => handleTabClose(e, tab.id)}
                    className={`p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                      tab.id === activeTabId
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                    aria-label="Close tab"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Header with blur effect */}
        <div className="sticky top-0 z-10 backdrop-blur-md backdrop-filter bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onExpandChange(!isExpanded)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                  aria-label={isExpanded ? "Collapse view" : "Expand view"}
                >
                  {isExpanded ? (
                    <ChevronRightIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  ) : (
                    <ChevronLeftIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  )}
                </button>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-3">
                    {(() => {
                        const activeTab = openTabs.find(t => t.id === activeTabId);
                        if (activeTab?.avatar?.type === 'image' && activeTab.avatar.value) {
                            return <img src={activeTab.avatar.value} alt="" className="size-10 rounded-full object-cover bg-zinc-100 shrink-0" />;
                        } else if (activeTab?.avatar?.type === 'image') {
                            return (
                                <div className="size-10 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                                    <UserIcon className="size-6 text-zinc-400" />
                                </div>
                            );
                        } else {
                            return <div className="flex items-baseline shrink-0"><Avatar initials={activeTab?.avatar?.value || activeTab?.name?.charAt(0) || '?'} className="size-10" /></div>;
                        }
                    })()}

                    <div className="min-w-0">
                      <h1 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">
                        {openTabs.find(t => t.id === activeTabId)?.name || 'Candidate'}
                      </h1>
                      {openTabs.find(t => t.id === activeTabId)?.subtitle && (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 -mt-1 truncate">
                            {openTabs.find(t => t.id === activeTabId)?.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge color={getBadgeColor(currentApplication.currentStageId)} className="text-sm">
                      {currentApplication.currentStageId || 'New'}
                    </Badge>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Applied {new Date(currentApplication.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <RecruitingAssignSelector
                currentApplication={currentApplication}
                onAssign={onAssignChange}
              />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
             <RecruitingApplicationDetail 
                applicationId={activeTabId} 
                embedded 
                onClose={() => {}} // Tab close handles closing
             />
        </div>
      </div>
    </div>
  );
}
