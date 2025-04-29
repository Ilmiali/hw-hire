import { Dialog, DialogTitle, DialogBody } from './dialog';

export interface ColorOption {
  id: string;
  type: 'solid' | 'gradient';
  value: string;
}

const predefinedColors: ColorOption[] = [
  { id: 'red', type: 'solid', value: '#E57373' },
  { id: 'yellow', type: 'solid', value: '#FFD54F' },
  { id: 'blue', type: 'solid', value: '#64B5F6' },
  { id: 'white', type: 'solid', value: '#FFFFFF' },
  { id: 'mint-gradient', type: 'gradient', value: 'linear-gradient(135deg, #96FBC4 10%, #F9F586 100%)' },
  { id: 'pink-gradient', type: 'gradient', value: 'linear-gradient(135deg, #FF9A9E 10%, #FAD0C4 100%)' },
  { id: 'sunset-gradient', type: 'gradient', value: 'linear-gradient(135deg, #FF512F 10%, #F09819 100%)' },
  { id: 'sky-gradient', type: 'gradient', value: 'linear-gradient(135deg, #1FA2FF 10%, #12D8FA 50%, #A6FFCB 100%)' },
  { id: 'purple-gradient', type: 'gradient', value: 'linear-gradient(135deg, #764BA2 10%, #667EEA 100%)' },
  { id: 'ocean-gradient', type: 'gradient', value: 'linear-gradient(135deg, #2E3192 10%, #1BFFFF 100%)' },
  { id: 'dusk-gradient', type: 'gradient', value: 'linear-gradient(135deg, #2C3E50 10%, #3498DB 100%)' }
];

interface ColorPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: ColorOption) => void;
  selectedColor?: ColorOption;
}

export function ColorPickerDialog({ isOpen, onClose, onColorSelect, selectedColor }: ColorPickerDialogProps) {
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
        
        <DialogTitle>Choose Cover Color</DialogTitle>
        <DialogBody>
          <div className="grid grid-cols-4 gap-3 p-4">
            {predefinedColors.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  onColorSelect(color);
                  onClose();
                }}
                className={`w-full h-20 rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedColor?.id === color.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  background: color.value,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
                aria-label={`Select ${color.id} color`}
              />
            ))}
          </div>
        </DialogBody>
      </div>
    </Dialog>
  );
} 