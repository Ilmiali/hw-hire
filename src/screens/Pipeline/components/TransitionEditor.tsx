import { PipelineStage } from '../../../types/pipeline';
import { Switch } from '@headlessui/react';
import { Field, Label } from '../../../components/fieldset';

interface Props {
  stages: PipelineStage[];
  onChange: (stages: PipelineStage[]) => void;
}

export default function TransitionEditor({ stages, onChange }: Props) {
  
  const handleToggleTransition = (fromStageId: string, toStageId: string, allowed: boolean) => {
    const newStages = stages.map(stage => {
      if (stage.id !== fromStageId) return stage;

      let currentAllowed = stage.allowedTransitions;
      
      // If active, it means we are currently restricting. If undefined, it allows all (except self usually, but here we define logic).
      // Let's assume undefined means "ALL allowed".
      // If we uncheck one, we must convert "undefined" into "all except one".
      
      if (currentAllowed === undefined) {
         // Initialize with all other stages
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
    // Terminal stages cannot transition out
    if (fromStage.type === 'terminal') return false;
    
    if (fromStage.allowedTransitions === undefined) return true;
    return fromStage.allowedTransitions.includes(toStageId);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Transition Rules</h3>
      <p className="text-sm text-zinc-500">
        Define which stages applications can move to from a given stage. 
        Terminal stages (e.g. Hired, Rejected) cannot initiate transitions.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {stages.map((fromStage) => (
          <div key={fromStage.id} className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fromStage.color }} />
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{fromStage.name}</span>
                {fromStage.type === 'terminal' && <span className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-500">Terminal</span>}
             </div>

             {fromStage.type === 'terminal' ? (
               <p className="text-sm text-zinc-400 italic">Terminal stages cannot transition to other stages.</p>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {stages.filter(s => s.id !== fromStage.id).map(toStage => {
                   const allowed = isTransitionAllowed(fromStage, toStage.id);
                   return (
                     <Field key={toStage.id} className="flex items-center gap-2">
                        <Switch
                          checked={allowed}
                          onChange={(checked: boolean) => handleToggleTransition(fromStage.id, toStage.id, checked)}
                          className="group relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-200 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-indigo-600 dark:bg-zinc-700"
                        >
                          <span
                            aria-hidden="true"
                            className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[checked]:translate-x-4"
                          />
                        </Switch>
                        <Label className="text-sm cursor-pointer" onClick={() => handleToggleTransition(fromStage.id, toStage.id, !allowed)}>
                          to {toStage.name}
                        </Label>
                      </Field>
                   );
                 })}
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}
