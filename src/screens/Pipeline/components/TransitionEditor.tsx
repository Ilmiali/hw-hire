import { PipelineStage } from '../../../types/pipeline';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ArrowLongRightIcon } from '@heroicons/react/20/solid';

interface Props {
  stages: PipelineStage[];
  onChange: (stages: PipelineStage[]) => void;
}

export default function TransitionEditor({ stages, onChange }: Props) {
  
  const handleToggleTransition = (fromStageId: string, toStageId: string, allowed: boolean) => {
    const newStages = stages.map(stage => {
      if (stage.id !== fromStageId) return stage;

      let currentAllowed = stage.allowedTransitions;
      if (currentAllowed === undefined) {
         currentAllowed = stages.filter(s => s.id !== fromStageId).map(s => s.id);
      }

      let newAllowed: string[];
      if (allowed) {
        newAllowed = [...currentAllowed, toStageId];
      } else {
        newAllowed = currentAllowed.filter(id => id !== toStageId);
      }

      return { ...stage, allowedTransitions: newAllowed };
    });

    onChange(newStages);
  };

  const isTransitionAllowed = (fromStage: PipelineStage, toStageId: string) => {
    if (fromStage.type === 'terminal') return false;
    if (fromStage.allowedTransitions === undefined) return true;
    return fromStage.allowedTransitions.includes(toStageId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Transition Rules</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Control the movement of applications. Enable or disable transitions between stages. 
          Note: Terminal stages cannot initiate transitions.
        </p>
      </div>

      <div className="space-y-6">
        {stages.map((fromStage) => (
          <div key={fromStage.id} className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5 overflow-hidden shadow-sm">
             <div className="px-6 py-4 bg-zinc-50/50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900" style={{ backgroundColor: fromStage.color || '#cbd5e1' }} />
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide text-xs">{fromStage.name}</span>
                </div>
                {fromStage.type === 'terminal' && (
                    <span className="text-[10px] font-bold uppercase bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                        End Stage
                    </span>
                )}
             </div>

             <div className="p-6">
                {fromStage.type === 'terminal' ? (
                   <div className="flex flex-col items-center justify-center py-4 text-center space-y-2 opacity-50">
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Applications stop here.</p>
                        <p className="text-[10px] text-zinc-500">No outgoing transitions allowed from terminal stages.</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     {stages.filter(s => s.id !== fromStage.id).map(toStage => {
                       const allowed = isTransitionAllowed(fromStage, toStage.id);
                       return (
                         <div 
                            key={toStage.id} 
                            className={cn(
                                "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                                allowed 
                                    ? "bg-blue-50/30 border-blue-100 dark:bg-blue-500/[0.02] dark:border-blue-500/10" 
                                    : "bg-zinc-50/50 border-transparent dark:bg-white/[0.01]"
                            )}
                         >
                            <div className="flex items-center gap-2 min-w-0">
                                <ArrowLongRightIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate tracking-tight">{toStage.name}</span>
                            </div>
                            <Switch
                               checked={allowed}
                               onCheckedChange={(checked) => handleToggleTransition(fromStage.id, toStage.id, checked)}
                            />
                         </div>
                       );
                     })}
                   </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
