import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketChat } from './TicketChat';
import { Message } from '../../types/message';
import { DatabaseTable } from '../../database-components/databaseTable';
import { Field } from '../../data-components/dataTable';
import { Badge } from '../../components/badge';
import { Document } from '../../services/databaseService';
import { useLocation } from 'react-router-dom';

type Ticket = Document & {
  subject: string;
  status: 'open' | 'closed';
  access: string;
  from: Array<{ name?: string; email: string }>;
  createdAt: Date;
}

const fields: Field<Ticket>[] = [
  { 
    key: 'subject', 
    label: 'Subject',
    render: (item: Ticket) => (
      <div className="flex items-start gap-3">
        <Badge color={item.status === 'open' ? 'lime' : 'zinc'}>
          {item.status}
        </Badge>
        <div className="flex flex-col">
          <span className="font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{item.subject}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] capitalize">
            {item.from[0].name || item.from[0].email}
          </span>
        </div>
      </div>
    )
  },
  { key: 'createdAt', label: 'Requested', type: 'date' },
  { key: 'actions', label: '', type: 'actions' },
];

export default function Tickets() {
  // Get current path from react router dom
  const pathname = useLocation().pathname;
  // Root path
  const rootPath = pathname.split('/')[1];
  const handleSendMessage = (content: string) => {
    // TODO: Implement send message functionality with Redux
    console.log('Sending message:', content);
  };

  // TODO: Implement messages state management with Redux
  const messages: Message[] = [];

  return (
    <SplitTwoLayout
      leftColumn={
        <div className="h-screen p-4 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto overflow-x-hidden">
          <DatabaseTable<Ticket>
            collection="tickets"
            fields={fields}
            rootPath={rootPath}
            pageSize={15}
            selectable
            sticky
            isLink
            actions={['view', 'delete']}
            defaultSortField="createdAt"
            defaultSortOrder="desc"
            onAction={(action, item) => {
              switch (action) {
                case 'view':
                  window.location.href = `/tickets/${item.id}`;
                  break;
                case 'delete':
                  // Handle delete
                  break;
              }
            }}
          />
        </div>
      }
      rightColumn={
        <div className="h-full">
          <TicketChat messages={messages} onSendMessage={handleSendMessage} />
        </div>
      }
    />
  );
}