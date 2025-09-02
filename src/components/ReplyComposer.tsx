import { useEffect, useRef, useState } from 'react';

interface ReplyComposerProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

export function ReplyComposer({ open, onClose, onSend }: ReplyComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      const timeoutId = window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => window.clearTimeout(timeoutId);
    }
  }, [open]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage('');
    onClose();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    const isEnter = e.key === 'Enter';
    const withModifier = e.shiftKey || e.ctrlKey || e.metaKey || e.altKey;
    if (isEnter && !withModifier) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/10">
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Write a reply..."
          className="w-full resize-y rounded-xl border border-zinc-300/60 dark:border-zinc-700/60 bg-white/50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:focus:ring-blue-400/60 backdrop-blur-md"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Enter to send • Shift+Enter for new line • Esc to close</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim()}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReplyComposer;


