import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketChat } from './TicketChat';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
import { Badge } from '../../components/badge';
import { Avatar } from '../../components/avatar';
import { Ticket } from '../../types/ticket';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getBadgeColor } from '../../utils/states';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView } from '../../store/slices/viewsSlice';
import { RootState } from '../../store';
import { getDatabaseService, QueryOptions } from '../../services/databaseService';

type TicketDoc = Ticket & { data: Record<string, unknown> };
type RawTicketDoc = { subject?: string; data?: { subject?: string } } | null;

const getBadgeText = (status: string) => {
  // Get the first letter of the status
  return status.charAt(0).toUpperCase()
}

const fields: Field<TicketDoc>[] = [
  { 
    key: 'subject',
    label: 'Subject',
    render: (item: TicketDoc) => (
      <div className="flex items-start gap-3">
        <Badge color={getBadgeColor(item.status)}>
          {getBadgeText(item.status)}
        </Badge>
        <div className="flex flex-col">
          <span className="font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{item.subject}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] capitalize">
            {item.requestedBy.name || item.requestedBy.email}
          </span>
        </div>
      </div>
    )
  },
  { key: 'createdAt', label: 'Requested', type: 'date', sortable: true },
  { key: 'actions', label: '', type: 'actions' },
];

export default function Tickets() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [openTabs, setOpenTabs] = useState<{ id: string; subject?: string }[]>([]);
  const pathname = location.pathname;
  const rootPath = pathname.split('/')[1];
  const currentView = useSelector((state: RootState) => state.views.currentView);
  const currentTicket = useSelector((state: RootState) => state.tickets.currentTicket);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
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
    const ticketIdFromQuery = searchParams.get('ticket');
    if (ticketIdFromQuery) {
      setTicketId(ticketIdFromQuery);
      setSelectedTicketId(ticketIdFromQuery);

      setOpenTabs(prev => {
        if (prev.some(t => t.id === ticketIdFromQuery)) return prev;
        return [...prev, { id: ticketIdFromQuery }];
      });

      // Fetch subject for the tab if not already known
      (async () => {
        try {
          const db = getDatabaseService();
          const doc = await db.getDocument<RawTicketDoc>('tickets', ticketIdFromQuery);
          const subject: string | undefined = doc?.subject ?? doc?.data?.subject;
          if (subject) setOpenTabs(prev => prev.map(t => t.id === ticketIdFromQuery ? { ...t, subject } : t));
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

  // Ensure subject is cached for the currently loaded ticket
  useEffect(() => {
    if (!currentTicket?.id || !currentTicket.subject) return;
    setOpenTabs(prev => prev.map(t => t.id === currentTicket.id ? { ...t, subject: t.subject || currentTicket.subject } : t));
  }, [currentTicket?.id, currentTicket?.subject]);

  
  // Ensure the left list resets to top on selection/navigation
  useEffect(() => {
    if (listScrollRef.current) {
      listScrollRef.current.scrollTop = 0;
    }
  }, [selectedTicketId, ticketId]);

  const handleClose = (closedTicketId: string) => {
    setOpenTabs(prev => {
      const remaining = prev.filter(t => t.id !== closedTicketId);

      if (remaining.length > 0) {
        const nextTicketId = remaining[0].id;
        navigate(`?ticket=${nextTicketId}`);
      } else {
        navigate('.');
        setTimeout(() => {
          setIsExpanded(false);
          setTicketId(null);
          setSelectedTicketId(null);
        }, 100);
      }

      return remaining;
    });
  };

  const handleOpenTicket = (ticketId: string, subject?: string) => {
    setSelectedTicketId(ticketId);
    setOpenTabs(prev => {
      const exists = prev.some(t => t.id === ticketId);
      if (!exists) {
        return [...prev, { id: ticketId, subject }];
      }
      // Update subject if newly provided
      if (subject) {
        return prev.map(t => t.id === ticketId ? { ...t, subject: t.subject || subject } : t);
      }
      return prev;
    });
    navigate(`?ticket=${ticketId}`);
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
      hideColumn={!ticketId ? 'right' : isExpanded ? 'left' : 'none'}
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
                  {currentView?.name || 'All Tickets'}
                </h2>
              </div>
              {renderGroups()}
            </div>
          </div>
          <div ref={listScrollRef} className="flex-1 p-4 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto overflow-x-hidden" style={{ overflowAnchor: 'none' }}>
            <DatabaseTable<TicketDoc>
              collection="tickets"
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
                    handleOpenTicket(item.id, (item as TicketDoc).subject);
                    break;
                }
              }}
              selectedId={selectedTicketId}
            />
          </div>
        </div>
      }
      rightColumn={
        <div className="h-full">
          {ticketId && (
            <TicketChat 
              ticketId={ticketId} 
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