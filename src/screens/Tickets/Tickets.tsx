import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketChat } from './TicketChat';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
import { Badge } from '../../components/badge';
import { Avatar } from '../../components/avatar';
import { Ticket } from '../../types/ticket';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getBadgeColor } from '../../utils/states';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView } from '../../store/slices/viewsSlice';
import { RootState } from '../../store';

const getBadgeText = (status: string) => {
  // Get the first letter of the status
  return status.charAt(0).toUpperCase()
}

const fields: Field<Ticket>[] = [
  { 
    key: 'subject',
    label: 'Subject',
    render: (item: Ticket) => (
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
  const searchParams = new URLSearchParams(location.search);
  const [openTicketIds, setOpenTicketIds] = useState<string[]>([]);
  const pathname = location.pathname;
  const rootPath = pathname.split('/')[1];
  const currentView = useSelector((state: RootState) => state.views.currentView);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const queryOptions = useMemo(() => ({
    constraints: [{
      field: 'groupId',
      operator: 'in',
      value: currentView?.groups.map(group => group.id) || []
    }]
  }), [currentView?.groups]);

  useEffect(() => {
    const ticketIdFromQuery = searchParams.get('ticket');
    if (ticketIdFromQuery) {
      setTicketId(ticketIdFromQuery);
      setSelectedTicketId(ticketIdFromQuery);
      // Add to open tickets if not already present
      setOpenTicketIds(prev => {
        if (!prev.includes(ticketIdFromQuery)) {
          return [...prev, ticketIdFromQuery];
        }
        return prev;
      });
    }
    if(rootPath === 'views') {
      const viewId = pathname.split('/')[2];
      dispatch(setCurrentView(viewId));
    }
  }, [pathname, rootPath, dispatch, currentView, searchParams]);

  const handleSendMessage = (content: string) => {
    // TODO: Implement send message functionality with Redux
    console.log('Sending message:', content);
  };

  const handleClose = (closedTicketId: string) => {
    setOpenTicketIds(prev => {
      const remainingTickets = prev.filter(id => id !== closedTicketId);
      
      // If there are other open tickets, switch to the first one
      if (remainingTickets.length > 0) {
        const nextTicketId = remainingTickets[0];
        // Update all states before navigation
        navigate(`?ticket=${nextTicketId}`);

      } else {
        // Clear all states when no tickets remain
        navigate('.'); // Remove the ticket query parameter
        setTimeout(() => {
          setIsExpanded(false);
          setTicketId(null);
          setSelectedTicketId(null);
        }, 100);
      }
      
      return remainingTickets;
    });
  };

  const handleOpenTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setOpenTicketIds(prev => {
      if (!prev.includes(ticketId)) {
        return [...prev, ticketId];
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
        <div className="h-screen flex flex-col">
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
          <div className="flex-1 p-4 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto overflow-x-hidden">
            <DatabaseTable<Ticket>
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
                    handleOpenTicket(item.id);
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
              openTicketIds={openTicketIds}
              onExpandChange={setIsExpanded}
              onClose={handleClose}
            />
          )}
        </div>
      }
    />
  );
}