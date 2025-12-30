import { useState } from 'react';
import { ColorOption, ColorPickerDialog } from '../../../components/ColorPickerDialog';


interface PageHeaderProps {
    title: string;
    description?: string;
    cover?: ColorOption;
    setCover?: (cover: ColorOption | null) => void;
    setTitle?: (title: string) => void;
    setDescription?: (description: string) => void;
    readOnly?: boolean;
}
export const PageHeader = ({
    title,
    description,
    cover,
    setTitle,
    setDescription,
    setCover,
    readOnly = false
}: PageHeaderProps) => {
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const defaultCover: ColorOption = { id: 'blue', type: 'solid', value: '#64B5F6' };
    const currentCover = cover || defaultCover;

    return (
        <div className="relative mb-8 group">
            {/* Cover Area */}
            {cover ? (
                <div 
                    className="relative h-48 w-full rounded-t-2xl overflow-hidden transition-all shadow-inner"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ background: cover.value }}
                >
                    {/* Overlay for actions */}
                    <div className={`absolute inset-0 bg-black/5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                    
                    {!readOnly && (
                        <div className={`absolute top-4 right-4 flex gap-2 transition-all transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-[-4px] opacity-0'}`}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsColorPickerOpen(true);
                                }}
                                className="px-3 py-1.5 bg-black/20 hover:bg-black/40 text-white text-xs font-medium rounded-md backdrop-blur-md border border-white/10 transition-all"
                            >
                                Change Cover
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCover?.(null);
                                }}
                                className="px-3 py-1.5 bg-black/20 hover:bg-red-500/40 text-white text-xs font-medium rounded-md backdrop-blur-md border border-white/10 transition-all"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            ) : !readOnly ? (
                <div 
                    className="h-12 w-full transition-all group-hover:h-24 flex items-center justify-end px-10"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        onClick={() => setIsColorPickerOpen(true)}
                        className={`px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-medium rounded-md border border-white/5 transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                        Add Cover
                    </button>
                </div>
            ) : null}

            {/* Title & Description Area */}
            <div className={`px-10 relative z-10 space-y-2 ${cover ? '-mt-10' : 'mt-4'}`}>
               <div className="space-y-1">
                   {readOnly ? (
                       <h1 className="text-5xl font-extrabold text-white p-0 drop-shadow-md">{title}</h1>
                   ) : (
                       <input
                            value={title}
                            onChange={(e) => setTitle?.(e.target.value)}
                            placeholder="Page Title"
                            className="w-full bg-transparent border-none text-5xl font-extrabold text-white placeholder-zinc-500 focus:ring-0 p-0 drop-shadow-md"
                       />
                   )}
                   {readOnly ? (
                       description && <p className="text-zinc-400 text-lg whitespace-pre-wrap">{description}</p>
                   ) : (
                       <textarea 
                            value={description || ''}
                            onChange={(e) => setDescription?.(e.target.value)}
                            placeholder="Add a description..."
                            rows={1}
                            className="w-full bg-transparent border-none text-zinc-400 placeholder-zinc-600 focus:ring-0 p-0 resize-none text-lg overflow-hidden"
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                       />
                   )}
               </div>
            </div>

            {!readOnly && (
                <ColorPickerDialog
                    isOpen={isColorPickerOpen}
                    onClose={() => setIsColorPickerOpen(false)}
                    onColorSelect={(c) => setCover?.(c)}
                    selectedColor={currentCover}
                />
            )}
        </div>
    );
};
