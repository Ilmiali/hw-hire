import { PipelineStage } from '../../../types/pipeline';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
    XMarkIcon,
    TrashIcon
} from '@heroicons/react/20/solid';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Props {
    stage: PipelineStage | null;
    onUpdate: (updates: Partial<PipelineStage>) => void;
    onDelete: () => void;
    onClose: () => void;
}

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#94A3B8', // Slate
];

export function PipelinePropertiesPanel({ stage, onUpdate, onDelete, onClose }: Props) {
    if (!stage) return null;

    return (
        <div className="w-80 h-full border-l border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/5">
                <h3 className="text-sm font-semibold">Stage Properties</h3>
                <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-white/5 rounded transition-colors">
                    <XMarkIcon className="w-4 h-4 text-zinc-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stage-name" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Name</Label>
                        <Input 
                            id="stage-name"
                            value={stage.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="h-9 focus-visible:ring-1"
                        />
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Terminal Stage</Label>
                            <p className="text-[10px] text-zinc-500 italic">No transitions allowed from this stage</p>
                        </div>
                        <Switch 
                            checked={stage.type === 'terminal'}
                            onCheckedChange={(checked) => onUpdate({ type: checked ? 'terminal' : 'normal' })}
                        />
                    </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Color Tag</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => onUpdate({ color })}
                                className={cn(
                                    "w-full aspect-square rounded-md border border-white/10 transition-all hover:scale-110",
                                    stage.color === color && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950"
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Transitions Info */}
                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-4 border border-zinc-200 dark:border-white/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Transitions</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                        Configure allowed transitions for this stage in the <strong className="text-zinc-600 dark:text-zinc-300 tracking-tighter">Transitions</strong> tab.
                    </p>
                </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-white/5">
                <Button 
                    variant="ghost" 
                    className="w-full h-9 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                    onClick={onDelete}
                >
                    <TrashIcon className="w-3.5 h-3.5 mr-2" />
                    Delete Stage
                </Button>
            </div>
        </div>
    );
}
