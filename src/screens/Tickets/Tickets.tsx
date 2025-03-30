import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketsList } from './TicketsList';
import { TicketChat } from './TicketChat';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTickets } from '../../store/slices/ticketsSlice';
import { Message } from '../../types/message';

export default function Tickets() {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading, error } = useSelector((state: RootState) => state.tickets);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleSendMessage = (content: string) => {
    // TODO: Implement send message functionality with Redux
    console.log('Sending message:', content);
  };

  // Transform tickets into the format expected by TicketsList
  const ticketsList = tickets.map(ticket => ({
    id: ticket.id,
    subject: ticket.subject,
    email: ticket.createdBy,
    access: ticket.status,
    status: ticket.status,
    url: `/tickets/${ticket.id}`,
  }));

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // TODO: Implement messages state management with Redux
  const messages: Message[] = [];

  return (
    <SplitTwoLayout
      leftColumn={
        <div className="h-screen p-4 border-r border-zinc-200 dark:border-zinc-700">
          <TicketsList tickets={ticketsList} />
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