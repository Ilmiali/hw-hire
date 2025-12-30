// Removed unused useState import
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipelineStage } from '../../../types/pipeline';
import { Button } from '../../../components/button';
import { Input } from '../../../components/input';
import { Text } from '../../../components/text';
import { Bars3Icon, TrashIcon, PlusIcon } from '@heroicons/react/16/solid';
import { Switch } from '../../../components/switch';
import { Field, Label } from '../../../components/fieldset';

interface Props {
  stages: PipelineStage[];
  onChange: (stages: PipelineStage[]) => void;
}

interface SortableItemProps {
  id: string;
  stage: PipelineStage;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PipelineStage>) => void;
}

function SortableItem({ id, stage, onDelete, onUpdate }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-2">
      <div {...attributes} {...listeners} className="cursor-move text-zinc-400 hover:text-zinc-600">
        <Bars3Icon className="size-5" />
      </div>
      
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4">
          <Input 
            value={stage.name} 
            onChange={(e) => onUpdate(id, { name: e.target.value })}
            placeholder="Stage Name"
          />
        </div>
        
        <div className="col-span-3 flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-zinc-200 cursor-pointer"
            style={{ backgroundColor: stage.color }}
            title="Pick Color (Randomized for now)"
            // Simple color randomizer for demo
            onClick={() => onUpdate(id, { color: '#' + Math.floor(Math.random()*16777215).toString(16) })}
          />
          <Text className="text-xs text-zinc-500">{stage.color}</Text>
        </div>

        <div className="col-span-4 flex items-center gap-2">
          <Field className="flex items-center gap-2">
            <Label className="text-xs">Terminal?</Label>
            <Switch
              checked={stage.type === 'terminal'}
              onChange={(checked: boolean) => onUpdate(id, { type: checked ? 'terminal' : 'normal' })}
              color="indigo"
            />
          </Field>
        </div>

        <div className="col-span-1 flex justify-end">
           <Button plain onClick={() => onDelete(id)} aria-label="Delete Stage">
            <TrashIcon className="size-4 text-zinc-500 hover:text-red-500" />
           </Button>
        </div>
      </div>
    </div>
  );
}

export default function StageListEditor({ stages, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex((s) => s.id === active.id);
      const newIndex = stages.findIndex((s) => s.id === over.id);
      
      const newStages = arrayMove(stages, oldIndex, newIndex).map((stage, index) => ({
        ...stage,
        order: index
      }));
      onChange(newStages);
    }
  };

  const handleAddStage = () => {
    const newStage: PipelineStage = {
      id: crypto.randomUUID(),
      name: 'New Stage',
      order: stages.length,
      type: 'normal',
      color: '#cbd5e1'
    };
    onChange([...stages, newStage]);
  };

  const handleUpdateStage = (id: string, updates: Partial<PipelineStage>) => {
    const newStages = stages.map(s => s.id === id ? { ...s, ...updates } : s);
    onChange(newStages);
  };

  const handleDeleteStage = (id: string) => {
    if (stages.length <= 1) {
      alert("Pipeline must have at least one stage.");
      return;
    }
    if(!confirm("Delete this stage?")) return;
    
    const newStages = stages.filter(s => s.id !== id);
    // Reorder
    const reordered = newStages.map((s, idx) => ({ ...s, order: idx }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Stages</h3>
        <Button onClick={handleAddStage}>
          <PlusIcon className="size-4 mr-2" />
          Add Stage
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col">
            {stages.map((stage) => (
              <SortableItem 
                key={stage.id} 
                id={stage.id} 
                stage={stage} 
                onDelete={handleDeleteStage}
                onUpdate={handleUpdateStage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
