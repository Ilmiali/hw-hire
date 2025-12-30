import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMessagesByApplicationId } from '../../store/slices/messagesSlice';
import { listenToApplicationChanges, unregisterApplicationListener } from '../../store/slices/applicationsSlice';
import { Avatar } from '../../components/avatar';
import { AssignSelector } from '../../database-components/assignSelector';
import type { Message } from '../../types/message';
import { formatTimeAgo } from '../../utils/time';
import { getBadgeColor } from '../../utils/states';
import { Badge } from '../../components/badge';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';
import ReplyComposer from '../../components/ReplyComposer';
import { motion, AnimatePresence } from 'framer-motion';

interface ApplicationChatProps {
  applicationId: string;
  isExpanded: boolean;
  openTabs: { id: string; subject?: string }[];
  onExpandChange: (expanded: boolean) => void;
  onClose: (applicationId: string) => void;
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

export function ApplicationChat({ applicationId, isExpanded, openTabs, onExpandChange, onClose }: ApplicationChatProps) {
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { messages, loading: messagesLoading, error: messagesError } = useAppSelector((state) => ({
    messages: state.messages.messages[applicationId] || [],
    loading: state.messages.loading,
    error: state.messages.error
  }));
  const { currentApplication, loading: applicationLoading, error: applicationError } = useAppSelector((state) => ({
    currentApplication: state.applications.currentApplication,
    loading: state.applications.loading,
    error: state.applications.error
  }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchMessagesByApplicationId(applicationId));
    dispatch(listenToApplicationChanges(applicationId));

    return () => {
      dispatch(unregisterApplicationListener(applicationId));
    };
  }, [dispatch, applicationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  

  const handleTabClick = (clickedApplicationId: string) => {
    navigate(`?application=${clickedApplicationId}`);
  };

  const handleTabClose = (e: React.MouseEvent, tabApplicationId: string) => {
    e.stopPropagation(); // Prevent tab click when clicking close
    onClose(tabApplicationId);
  };

  const handleSendReply = (content: string) => {
    // TODO: integrate with actual send action when available
    console.log('Send reply to application', applicationId, content);
  };

  if (messagesLoading || applicationLoading && !currentApplication) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  if (messagesError || applicationError) {
    return <div className="flex h-full items-center justify-center text-red-500">Error: {messagesError || applicationError}</div>;
  }

  if (!currentApplication) {
    return <div className="flex h-full items-center justify-center text-red-500">Application not found</div>;
  }

  return (
    <div className="flex h-screen flex-col justify-between transition-all duration-300 w-full">
      <div className="flex-1 overflow-y-auto h-screen">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="sticky top-0 z-20 backdrop-blur-md backdrop-filter bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-1 px-2 py-1 overflow-x-auto">
              {openTabs.map(({ id: openId, subject }) => (
                <div
                  key={openId}
                  onClick={() => handleTabClick(openId)}
                  role="tab"
                  tabIndex={0}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap group cursor-pointer ${
                    openId === applicationId
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate max-w-[150px]">
                    {openId === currentApplication.id ? currentApplication.subject : (subject || `Application ${openId}`)}
                  </span>
                  <button
                    onClick={(e) => handleTabClose(e, openId)}
                    className={`p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                      openId === applicationId
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
        <div className="sticky top-[41px] z-10 backdrop-blur-md backdrop-filter bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onExpandChange(!isExpanded)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label={isExpanded ? "Collapse view" : "Expand view"}
                >
                  {isExpanded ? (
                    <ChevronRightIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  ) : (
                    <ChevronLeftIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  )}
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-zinc-900 dark:text-white truncate text-ellipsis overflow-hidden whitespace-nowrap" style={{ maxWidth: '70%' }}>
                    {currentApplication.subject}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color={getBadgeColor(currentApplication.status)} className="text-sm capitalize">
                      {currentApplication.status}
                    </Badge>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Created {formatTimeAgo(currentApplication.appliedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <AssignSelector
                currentApplication={currentApplication}
              />
              {/* Space for other actions */}
            </div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {messages.map((message: Message, index: number) => (
            <div key={message.id} className="space-y-2">
              {index === messages.length - 1 && <div style={{ scrollMarginTop: '1500px' }} ref={messagesEndRef} />}
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
          {/* Spacer to ensure content not hidden behind floating button */}
          <div className="h-24" />
        </div>
      </div>
      {/* Contained action area with morph */}
      <div className="sticky bottom-0 z-20 px-4 pb-4 pt-2 bg-gradient-to-t from-white/80 to-transparent dark:from-zinc-900/80">
        <div className="mx-auto max-w-3xl">
          <AnimatePresence initial={false} mode="popLayout">
            {!isComposerOpen && (
              <motion.button
                key="reply-button"
                layoutId="replyCTA"
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                Reply
              </motion.button>
            )}
            {isComposerOpen && (
              <motion.div
                key="reply-composer"
                layoutId="replyCTA"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                className="rounded-2xl overflow-hidden"
              >
                <ReplyComposer
                  open={true}
                  onClose={() => setIsComposerOpen(false)}
                  onSend={handleSendReply}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}