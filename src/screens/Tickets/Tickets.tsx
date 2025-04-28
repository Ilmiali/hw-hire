import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketChat } from './TicketChat';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
import { Badge } from '../../components/badge';
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
  const pathname = location.pathname;
  const rootPath = pathname.split('/')[1];
  const currentView = useSelector((state: RootState) => state.views.currentView);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

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

  return (
    <SplitTwoLayout
      leftColumnWidth="450px"
      leftColumn={
        <div className="h-screen flex flex-col">
          <div className="p-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-semibold">{currentView?.name || 'All Tickets'}</h2>
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
                    setSelectedTicketId(item.id);
                    navigate(`?ticket=${item.id}`);
                    break;
                  case 'delete':
                    // Handle delete
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
          {ticketId && <TicketChat ticketId={ticketId} onSendMessage={handleSendMessage} />}
        </div>
      }
    />
  );
}