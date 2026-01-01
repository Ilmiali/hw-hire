import { toast } from 'react-toastify';
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
import { 
    Bars3Icon, 
    PlusIcon,
    ArrowRightCircleIcon
} from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  stages: PipelineStage[];
  onChange: (stages: PipelineStage[]) => void;
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
}

interface SortableItemProps {
  id: string;
  stage: PipelineStage;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function SortableItem({ id, stage, isSelected, onSelect }: SortableItemProps) {
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
    <div 
        ref={setNodeRef} 
        style={style} 
        onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
        }}
        className={cn(
            "group flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border transition-all duration-200 cursor-pointer mb-3 shadow-sm",
            isSelected 
                ? "border-blue-500 ring-1 ring-blue-500/20" 
                : "border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
        )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors"
      >
        <Bars3Icon className="w-5 h-5" />
      </div>
      
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
        style={{ backgroundColor: stage.color || '#F1F5F9' }}
      >
        <div className="w-3 h-3 rounded-full bg-white/40 border border-white/20" />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {stage.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                stage.type === 'terminal' 
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" 
                    : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
            )}>
                {stage.type}
            </span>
            <span className="text-[10px] text-zinc-400">Order: {stage.order + 1}</span>
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRightCircleIcon className="w-5 h-5 text-zinc-300" />
      </div>
    </div>
  );
}

export default function StageListEditor({ stages, onChange, selectedStageId, onSelectStage }: Props) {
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
      color: '#3B82F6'
    };
    onChange([...stages, newStage]);
    onSelectStage(newStage.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
        <div className="space-y-1 text-left">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Workflow Stages</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Drag to reorder stages in your recruitment process.</p>
        </div>
        <Button 
            onClick={handleAddStage}
            className="rounded-xl shadow-lg shadow-blue-500/20"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
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
          <div className="flex flex-col max-w-2xl">
            {stages.map((stage) => (
              <SortableItem 
                key={stage.id} 
                id={stage.id} 
                stage={stage} 
                isSelected={selectedStageId === stage.id}
                onSelect={onSelectStage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
