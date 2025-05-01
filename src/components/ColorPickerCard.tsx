import { useState, useEffect } from 'react';
import { ColorPickerDialog, ColorOption } from './ColorPickerDialog';

interface ColorPickerCardProps {
  label: string;
  initialColor?: ColorOption;
  onColorChange?: (color: ColorOption) => void;
  className?: string;
}

export function ColorPickerCard({ 
  label, 
  initialColor = { id: 'white', type: 'solid', value: '#FFFFFF' },
  onColorChange,
  className = ''
}: ColorPickerCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(initialColor);

  useEffect(() => {
    setSelectedColor(initialColor);
  }, [initialColor]);

  const handleColorSelect = (color: ColorOption) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className={`w-full rounded-lg p-6 text-left transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        style={{
          background: selectedColor.value,
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <h3 className="font-medium text-lg">{label}</h3>
      </button>

      <ColorPickerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onColorSelect={handleColorSelect}
        selectedColor={selectedColor}
      />
    </>
  );
} 