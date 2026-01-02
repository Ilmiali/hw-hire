import { PipelineStage } from '../../../types/pipeline';
import { cn } from '@/lib/utils';
import { 
    QueueListIcon, 
    ArrowsRightLeftIcon,
    PlusIcon,
    EyeIcon
} from '@heroicons/react/20/solid';

interface Props {
    stages: PipelineStage[];
    activeTab: 'stages' | 'transitions' | 'preview';
    onTabChange: (tab: 'stages' | 'transitions' | 'preview') => void;
    onSelectStage: (id: string) => void;
    selectedStageId: string | null;
    onAddStage: () => void;
}

export function PipelineLeftSidebar({ 
    stages, 
    activeTab, 
    onTabChange, 
    onSelectStage, 
    selectedStageId,
    onAddStage 
}: Props) {
    return (
        <div className="w-64 h-full border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex flex-col shrink-0">
            {/* Navigation Tabs */}
            <div className="p-4 space-y-1 border-b border-zinc-200 dark:border-white/5">
                <button
                    onClick={() => onTabChange('stages')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'stages' 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" 
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                    )}
                >
                    <QueueListIcon className="w-4 h-4" />
                    Stages
                </button>
                <button
                    onClick={() => onTabChange('transitions')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'transitions' 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" 
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                    )}
                >
                    <ArrowsRightLeftIcon className="w-4 h-4" />
                    Transitions
                </button>
                <button
                    onClick={() => onTabChange('preview')}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'preview' 
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" 
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                    )}
                >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                </button>
            </div>

            {/* Stages List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Pipeline Stages
                    </h3>
                    <button 
                        onClick={onAddStage}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
                
                <div className="space-y-1">
                    {stages.map((stage) => (
                        <button
                            key={stage.id}
                            onClick={() => onSelectStage(stage.id)}
                            className={cn(
                                "group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left",
                                selectedStageId === stage.id
                                    ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white"
                                    : "text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
                            )}
                        >
                            <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: stage.color || '#cbd5e1' }} 
                            />
                            <span className="truncate flex-1 font-medium">{stage.name}</span>
                            {stage.type === 'terminal' && (
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                    End
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
