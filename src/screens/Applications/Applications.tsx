import { SplitTwoLayout } from '../../components/split-two-layout';
import { ApplicationChat } from './ApplicationChat';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
import { Badge } from '../../components/badge';
import { Avatar } from '../../components/avatar';
import { Application } from '../../types/application';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getBadgeColor } from '../../utils/states';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView } from '../../store/slices/viewsSlice';
import { RootState } from '../../store';
import { getDatabaseService, QueryOptions } from '../../services/databaseService';

type ApplicationDoc = Application & { data: Record<string, unknown> };
type RawApplicationDoc = { subject?: string; data?: { subject?: string } } | null;

const getBadgeText = (status: string) => {
  // Get the first letter of the status
  return status.charAt(0).toUpperCase()
}

const fields: Field<ApplicationDoc>[] = [
  { 
    key: 'subject',
    label: 'Role',
    render: (item: ApplicationDoc) => (
      <div className="flex items-start gap-3">
        <Badge color={getBadgeColor(item.status)}>
          {getBadgeText(item.status)}
        </Badge>
        <div className="flex flex-col">
          <span className="font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{item.subject}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] capitalize">
            {item.candidate.name || item.candidate.email}
          </span>
        </div>
      </div>
    )
  },
  { key: 'appliedAt', label: 'Applied', type: 'date', sortable: true },
  { key: 'actions', label: '', type: 'actions' },
];

export default function Applications() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [openTabs, setOpenTabs] = useState<{ id: string; subject?: string }[]>([]);
  const pathname = location.pathname;
  const rootPath = pathname.split('/')[1];
  const currentView = useSelector((state: RootState) => state.views.currentView);
  const currentApplication = useSelector((state: RootState) => state.applications.currentApplication);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const listScrollRef = useRef<HTMLDivElement>(null);

  const queryOptions: Omit<QueryOptions, 'limit' | 'startAfter'> = useMemo(() => ({
    constraints: [{
      field: 'groupId',
      operator: 'in',
      value: (currentView?.groups || []).map(group => group.id)
    }]
  }), [currentView?.groups]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const applicationIdFromQuery = searchParams.get('application');
    if (applicationIdFromQuery) {
      setApplicationId(applicationIdFromQuery);
      setSelectedApplicationId(applicationIdFromQuery);

      setOpenTabs(prev => {
        if (prev.some(t => t.id === applicationIdFromQuery)) return prev;
        return [...prev, { id: applicationIdFromQuery }];
      });

      // Fetch subject for the tab if not already known
      (async () => {
        try {
          const db = getDatabaseService();
          const doc = await db.getDocument<RawApplicationDoc>('applications', applicationIdFromQuery);
          const subject: string | undefined = doc?.subject ?? doc?.data?.subject;
          if (subject) setOpenTabs(prev => prev.map(t => t.id === applicationIdFromQuery ? { ...t, subject } : t));
        } catch {
          // ignore
        }
      })();
    }
    if(rootPath === 'views') {
      const viewId = pathname.split('/')[2];
      dispatch(setCurrentView(viewId));
    }
  }, [location.search, pathname, rootPath, dispatch, currentView]);

  // Ensure subject is cached for the currently loaded application
  useEffect(() => {
    if (!currentApplication?.id || !currentApplication.subject) return;
    setOpenTabs(prev => prev.map(t => t.id === currentApplication.id ? { ...t, subject: t.subject || currentApplication.subject } : t));
  }, [currentApplication?.id, currentApplication?.subject]);

  
  // Ensure the left list resets to top on selection/navigation
  useEffect(() => {
    if (listScrollRef.current) {
      listScrollRef.current.scrollTop = 0;
    }
  }, [selectedApplicationId, applicationId]);

  const handleClose = (closedApplicationId: string) => {
    setOpenTabs(prev => {
      const remaining = prev.filter(t => t.id !== closedApplicationId);

      if (remaining.length > 0) {
        const nextApplicationId = remaining[0].id;
        navigate(`?application=${nextApplicationId}`);
      } else {
        navigate('.');
        setTimeout(() => {
          setIsExpanded(false);
          setApplicationId(null);
          setSelectedApplicationId(null);
        }, 100);
      }

      return remaining;
    });
  };

  const handleOpenApplication = (applicationId: string, subject?: string) => {
    setSelectedApplicationId(applicationId);
    setOpenTabs(prev => {
      const exists = prev.some(t => t.id === applicationId);
      if (!exists) {
        return [...prev, { id: applicationId, subject }];
      }
      // Update subject if newly provided
      if (subject) {
        return prev.map(t => t.id === applicationId ? { ...t, subject: t.subject || subject } : t);
      }
      return prev;
    });
    navigate(`?application=${applicationId}`);
  };

  const renderGroups = () => {
    if (!currentView?.groups || currentView.groups.length === 0) return null;
    
    const visibleGroups = currentView.groups.slice(0, 2);
    const remainingGroups = currentView.groups.slice(2);
    
    return (
      <div className="flex flex-wrap gap-2">
        {visibleGroups.map((group) => (
          <div
            key={group.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-full backdrop-blur-sm shadow-sm ${
              currentView?.layout?.cover
                ? 'bg-black/20 text-white shadow-black/10'
                : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-zinc-900/5 dark:shadow-zinc-100/5'
            }`}
          >
            <Avatar
              initials={group.name.split(' ').map(name => name[0]).join('').toUpperCase()}
              variant="round"
              className="size-5"
              light={!currentView?.layout?.cover}
            />
            <span className="text-sm font-medium capitalize">{group.name}</span>
          </div>
        ))}
        {remainingGroups.length > 0 && (
          <div className="relative group">
            <div
              className={`flex items-center gap-2 px-2 py-1 rounded-full backdrop-blur-sm shadow-sm cursor-pointer ${
                currentView?.layout?.cover
                  ? 'bg-black/20 text-white shadow-black/10'
                  : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-zinc-900/5 dark:shadow-zinc-100/5'
              }`}
            >
              <span className="text-sm font-medium">+{remainingGroups.length}</span>
            </div>
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-100">
              <div className={`p-2 rounded-lg shadow-lg min-w-[200px] bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700`}>
                {remainingGroups.map((group) => (
                  <div key={group.id} className="flex items-center gap-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 rounded-md px-2">
                    <Avatar
                      initials={group.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                      variant="round"
                      className="size-5"
                      light={!currentView?.layout?.cover}
                    />
                    <span className="text-sm font-medium capitalize">{group.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <SplitTwoLayout
      leftColumnWidth="450px"
      hideColumn={!applicationId ? 'right' : isExpanded ? 'left' : 'none'}
      leftColumn={
        <div className="h-full flex flex-col">
          <div 
            className="p-4"
            style={{ 
              background: currentView?.layout?.cover ? currentView.layout.cover.value : 'transparent',
              backgroundImage: currentView?.layout?.cover?.type === 'gradient' 
                ? `linear-gradient(${currentView.layout.cover.value})` 
                : undefined
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {currentView?.layout?.icon && currentView.layout.icon.type === 'emoji' ? (
                  <span className={`text-2xl ${!currentView?.layout?.cover ? 'text-zinc-900 dark:text-zinc-100' : 'text-white'}`}>
                    {currentView.layout.icon.value}
                  </span>
                ) : (
                  <span className="text-2xl"></span>
                )}
                <h2 className={`text-xl font-semibold ${!currentView?.layout?.cover ? 'text-zinc-900 dark:text-zinc-100' : 'text-white'}`}>
                  {currentView?.name || 'All Applications'}
                </h2>
              </div>
              {renderGroups()}
            </div>
          </div>
          <div ref={listScrollRef} className="flex-1 p-4 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto overflow-x-hidden" style={{ overflowAnchor: 'none' }}>
            <DatabaseTable<ApplicationDoc>
              collection="applications"
              fields={fields}
              pageSize={15}
              selectable={false}
              sticky
              isLink
              actions={['view', 'delete']}
              defaultSortField="createdAt"
              defaultSortOrder="desc"
              queryOptions={queryOptions}
              onAction={(action, item) => {
                switch (action) {
                  case 'view':
                    handleOpenApplication(item.id, (item as ApplicationDoc).subject);
                    break;
                }
              }}
              selectedId={selectedApplicationId}
            />
          </div>
        </div>
      }
      rightColumn={
        <div className="h-full">
          {applicationId && (
            <ApplicationChat 
              applicationId={applicationId} 
              isExpanded={isExpanded}
              openTabs={openTabs}
              onExpandChange={setIsExpanded}
              onClose={handleClose}
            />
          )}
        </div>
      }
    />
  );
}