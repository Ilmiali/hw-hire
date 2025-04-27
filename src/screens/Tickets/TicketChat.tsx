import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMessagesByTicketId } from '../../store/slices/messagesSlice';
import { fetchTicketById } from '../../store/slices/ticketsSlice';
import { getDatabaseService } from '../../services/databaseService';
import { Avatar } from '../../components/avatar';
import { AssignSelector } from '../../data-components/assignSelector';
import type { Message } from '../../types/message';
import { formatTimeAgo } from '../../utils/time';
import { getBadgeColor } from '../../utils/states';
import { Badge } from '../../components/badge';

interface TicketChatProps {
  ticketId: string;
}

const getInitials = (name?: string, email?: string): string => {
  if (name) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.slice(0, 2).toUpperCase() || '??';
};

export function TicketChat({ ticketId }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const dispatch = useAppDispatch();
  const { messages, loading: messagesLoading, error: messagesError } = useAppSelector((state) => ({
    messages: state.messages.messages[ticketId] || [],
    loading: state.messages.loading,
    error: state.messages.error
  }));
  const { currentTicket, loading: ticketLoading, error: ticketError } = useAppSelector((state) => ({
    currentTicket: state.tickets.currentTicket,
    loading: state.tickets.loading,
    error: state.tickets.error
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchTicketById(ticketId));
    dispatch(fetchMessagesByTicketId(ticketId));
  }, [dispatch, ticketId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const db = getDatabaseService();
      const message: Omit<Message, 'id'> = {
        content: newMessage.trim(),
        from: { email: 'user@example.com', name: 'Current User' },
        to: [{ email: 'support@example.com', name: 'Support Team' }],
        cc: [],
        bcc: [],
        sentAt: new Date(),
        ticketId
      };
      
      await db.addDocument('messages', message);
      setNewMessage('');
      dispatch(fetchMessagesByTicketId(ticketId));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAssign = ({ groupId, memberId }: { groupId: number; memberId?: string }) => {
    // Here you would typically make an API call to update the assignment
    console.log('Assigned to:', { groupId, memberId });
  };

  if (messagesLoading || ticketLoading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  if (messagesError || ticketError) {
    return <div className="flex h-full items-center justify-center text-red-500">Error: {messagesError || ticketError}</div>;
  }

  if (!currentTicket) {
    return <div className="flex h-full items-center justify-center text-red-500">Ticket not found</div>;
  }

  return (
    <div className="flex h-screen flex-col justify-between">
      <div className="flex-1 overflow-y-auto h-screen">
        {/* Header with blur effect */}
        <div className="sticky top-0 z-10 backdrop-blur-md backdrop-filter bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-white truncate text-ellipsis overflow-hidden whitespace-nowrap" style={{ maxWidth: '70%' }}>
                  {currentTicket.subject}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={getBadgeColor(currentTicket.status)} className="text-sm capitalize">
                    {currentTicket.status}
                  </Badge>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Created {formatTimeAgo(currentTicket.requestedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <AssignSelector
                currentTicket={currentTicket}
                onAssign={handleAssign}
              />
              {/* Space for other actions */}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {messages.map((message: Message, index: number) => (
            <div key={message.id} className="space-y-2">
              {index === messages.length - 1 && <div style={{ scrollMarginTop: '100px' }} ref={messagesEndRef} />}
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={message.from.avatar}
                    initials={getInitials(message.from.name, message.from.email)}
                    alt={message.from.name || message.from.email}
                    className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 size-8"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {message.from.name || message.from.email}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatTimeAgo(message.sentAt as Date)}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    To: {message.to.map(to => to.name || to.email).join(', ')}
                    {message.cc.length > 0 && (
                      <>
                        <br />
                        CC: {message.cc.map(cc => cc.name || cc.email).join(', ')}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="pl-[52px]">
                <div className="inline-block max-w-[85%] rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100">
                  <div
                    className="prose prose-sm dark:prose-invert prose-p:leading-normal prose-p:my-0 overflow-hidden [&_*]:break-words [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_img]:max-w-full [&_table]:max-w-full [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block dark:[&_*]:!bg-transparent dark:[&_*]:!text-white/90 dark:[&_code]:!text-white/90 dark:[&_pre]:!text-white/90 dark:[&_a]:!text-blue-300 dark:[&_strong]:!text-white dark:[&_em]:!text-white/90 dark:[&_ul]:!text-white/90 dark:[&_ol]:!text-white/90 dark:[&_li]:!text-white/90 dark:[&_blockquote]:!text-white/80 dark:[&_h1]:!text-white dark:[&_h2]:!text-white dark:[&_h3]:!text-white dark:[&_h4]:!text-white dark:[&_h5]:!text-white dark:[&_h6]:!text-white dark:[&_td]:!text-white/90 dark:[&_th]:!text-white dark:[&_tr]:!border-zinc-700 dark:[&_td]:!border-zinc-700 dark:[&_th]:!border-zinc-700"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(message.content, {
                        ALLOWED_TAGS: ['div', 'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'img', 'pre', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'thead', 'tbody', 'tr', 'td', 'th', 'table'],
                        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'align', 'style', 'valign', 'width', 'height', 'border', 'cellpadding', 'cellspacing', 'text', 'face', 'dir', 'lang', 'xml:lang'],
                        ADD_ATTR: ['target'],
                        FORBID_ATTR: ['style'],
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        <form onSubmit={handleSubmit} className="sticky bottom-5 z-10">
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full min-h-[60px] pr-32 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/85 dark:bg-zinc-900/85 px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none backdrop-blur-md backdrop-filter"
            rows={8}
          />
          <button
            type="submit"
            className="absolute right-4 bottom-4 inline-flex items-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
} 