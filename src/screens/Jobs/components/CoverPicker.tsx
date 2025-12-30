import { Button } from '../../../components/button';
import { useState } from 'react';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=2069',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2074',
];

interface CoverPickerProps {
  currentCover?: string;
  onSelect: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function CoverPicker({ currentCover, onSelect, onRemove, onClose }: CoverPickerProps) {
  const [customUrl, setCustomUrl] = useState('');

  return (
    <div className="absolute top-12 left-0 z-50 w-80 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl p-4 animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Pick a cover</h3>
        <Button plain onClick={onClose} className="!p-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESET_COVERS.map((url) => (
          <button
            key={url}
            onClick={() => {
              onSelect(url);
              onClose();
            }}
            className={`h-16 rounded-md overflow-hidden border-2 transition-all ${
              currentCover === url ? 'border-indigo-500' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <img src={url} alt="Cover preset" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Custom URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste an image link..."
              className="flex-1 text-sm bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <Button
              disabled={!customUrl}
              onClick={() => {
                onSelect(customUrl);
                onClose();
              }}
              className="text-xs py-1 px-2"
            >
              Set
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            plain
            className="w-full text-left !justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            Remove cover
          </Button>
        </div>
      </div>
    </div>
  );
}
