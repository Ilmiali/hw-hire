import { Dialog, DialogTitle, DialogBody } from './dialog';
import { Input } from './input';
import { useState, useCallback } from 'react';

// Emoji categories and their emojis
const emojiCategories = {
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍',
    '🥰', '😘', '😗', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
  ],
  'Objects & Symbols': [
    '⭐', '🌟', '✨', '💫', '🌙', '☀️', '⚡', '🔥', '🎯', '🎨', '🎭', '🎪', '🎢', '🎡',
    '🎠', '🎪', '🎭', '🎨', '🚀', '🛸', '✈️', '🚁', '🚂', '🚃', '🚄', '🚅', '🚇', '🚉',
  ],
  'Animals & Nature': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
    '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
  ],
};

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleEmojiClick = useCallback((emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  }, [onEmojiSelect, onClose]);

  const filteredCategories = Object.entries(emojiCategories).map(([category, emojis]) => ({
    category,
    emojis: emojis.filter(emoji => 
      !searchQuery || emoji.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <DialogTitle>Choose Emoji</DialogTitle>

        <DialogBody>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search emoji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            <div className="space-y-6 max-h-[400px] overflow-y-auto">
              {filteredCategories.map(({ category, emojis }) => 
                emojis.length > 0 && (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      {category}
                    </h3>
                    <div className="grid grid-cols-8 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-2xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </DialogBody>
      </div>
    </Dialog>
  );
} 