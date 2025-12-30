import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { pipelineService } from '../../services/mockPipelineService';
import { Pipeline, PipelineStage } from '../../types/pipeline';
import { Button } from '../../components/button';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';
import { toast } from 'react-toastify';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';

// Types for the board
interface MockApplication {
  id: string;
  name: string;
  role: string;
  stageId: string;
}

// Generate some mock applications
const generateMockApplications = (stages: PipelineStage[]): MockApplication[] => {
  if (stages.length === 0) return [];
  const apps: MockApplication[] = [];
  const roles = ['Frontend Engineer', 'Product Manager', 'Designer', 'Backend Dev'];
  const names = ['Alice Smith', 'Bob Jones', 'Charlie Day', 'Diana Prince', 'Evan Wright'];

  for (let i = 0; i < 10; i++) {
    // Distribute randomly, mostly in earlier stages
    const stageIndex = Math.floor(Math.random() * Math.min(stages.length, 3));
    apps.push({
      id: `app-${i}`,
      name: names[i % names.length],
      role: roles[i % roles.length],
      stageId: stages[stageIndex]?.id || stages[0].id
    });
  }
  return apps;
};

// -- Draggable Application Card --
function ApplicationCard({ app, isOverlay }: { app: MockApplication; isOverlay?: boolean }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: app.id,
    data: {
      type: 'Application',
      app,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="opacity-30 bg-zinc-100 dark:bg-zinc-800 p-3 rounded shadow-sm border border-zinc-200 h-[80px]" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700
        cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow
        ${isOverlay ? 'shadow-xl rotate-2 scale-105 cursor-grabbing z-50' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <Avatar initials={app.name.charAt(0)} className="size-8" />
        <div>
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{app.name}</h4>
          <p className="text-xs text-zinc-500">{app.role}</p>
        </div>
      </div>
    </div>
  );
}

// -- Column --
function StageColumn({ stage, applications }: { stage: PipelineStage; applications: MockApplication[] }) {
  const { setNodeRef } = useSortable({
    id: stage.id,
    data: {
      type: 'Stage',
      stage,
    },
  });

  return (
    <div ref={setNodeRef} className="flex flex-col w-[280px] shrink-0 h-full max-h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color || '#ccc' }} />
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm uppercase tracking-wide">
          {stage.name}
        </h3>
        <Badge className="ml-auto">{applications.length}</Badge>
      </div>

      <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl p-2 border border-dashed border-zinc-200 dark:border-zinc-800 overflow-y-auto">
        <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[100px]">
            {applications.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// -- Main Board --
export default function JobPipelineBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [activeVersionStages, setActiveVersionStages] = useState<PipelineStage[]>([]);
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<MockApplication | null>(null);

  // Load Pipeline
  useEffect(() => {
    if (id) {
      const p = pipelineService.getPipeline(id);
      if (p) {
         setPipeline(p);
         const activeVersion = p.versions.find(v => v.id === p.activeVersionId);
         if (activeVersion) {
            setActiveVersionStages(activeVersion.stages);
            // Init mock apps
            setApplications(generateMockApplications(activeVersion.stages));
         }
      }
    }
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Application') {
      setActiveDragItem(event.active.data.current.app as MockApplication);
    }
  };

  // Logic for allowing drops
  const checkTransitionAllowed = (fromStageId: string, toStageId: string): boolean => {
    if (fromStageId === toStageId) return true;
    
    const fromStage = activeVersionStages.find(s => s.id === fromStageId);
    if (!fromStage) return false;

    // Terminal logic
    if (fromStage.type === 'terminal') return false; 
    
    // Explicit allowed transitions
    if (fromStage.allowedTransitions === undefined) return true; // Allow all if undefined
    return fromStage.allowedTransitions.includes(toStageId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Just visual updates, handled by dnd-kit mostly
  };

  const handleDragEnd = (event: DragEndEvent) => {
     setActiveDragItem(null);
     const { active, over } = event;

     if (!over) return;

     const activeId = active.id;
     const overId = over.id;

     // Find the application being dragged
     const activeApp = applications.find(a => a.id === activeId);
     if (!activeApp) return;

     // Identification of drop target
     // It could be another application (Sortable) OR the column container (if empty or dropping on header)
     let overStageId: string | undefined;
     
     // 1. Check if dropped on a Stage Column directly
     const overStage = activeVersionStages.find(s => s.id === overId);
     if (overStage) {
       overStageId = overStage.id;
     } else {
       // 2. Check if dropped on another Application
       const overApp = applications.find(a => a.id === overId);
       if (overApp) {
         overStageId = overApp.stageId;
       }
     }

     if (!overStageId) return;

     // Check transition rules
     if (!checkTransitionAllowed(activeApp.stageId, overStageId)) {
        toast.error(`Transition from "${activeVersionStages.find(s => s.id === activeApp.stageId)?.name}" to "${activeVersionStages.find(s => s.id === overStageId)?.name}" is not allowed.`);
        return;
     }

     // If transitioning to a new stage
     if (activeApp.stageId !== overStageId) {
        setApplications(apps => apps.map(a => {
           if (a.id === activeApp.id) return { ...a, stageId: overStageId! };
           return a;
        }));
        
        const toStage = activeVersionStages.find(s => s.id === overStageId);
        if (toStage?.type === 'terminal') {
          toast.success(`Application moved to ${toStage.name}`);
        }
     } else {
       // Reordering within same stage
       if (activeId !== overId) {
          // Reorder logic: extract items in this stage, reorder, then merge back??
          // For this simplifiction, we just reorder the whole list if we want, 
          // but since `applications` is flat, we just need arrayMove on the filtered list?
          // Actually simplest is just to ignore visual reordering persistence for the "Mock" demo
          // unless explicitly required. The prompt asked for "Drag & drop between columns".
          
          // Let's implement visual reorder just for polish, although not strict "Kanban" requirement usually.
          const oldIndex = applications.findIndex(a => a.id === activeId);
          const newIndex = applications.findIndex(a => a.id === overId);
          setApplications(arrayMove(applications, oldIndex, newIndex));
       }
     }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };
  
  if (!pipeline) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Button plain onClick={() => navigate(`/pipelines/${id}`)}>
          <ArrowLeftIcon className="size-4 mr-2" />
          Edit Pipeline
        </Button>
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-4" />
        <h1 className="text-lg font-semibold">{pipeline.name} <span className="text-zinc-400 font-normal ml-2">Preview</span></h1>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
         <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
         >
           <div className="flex h-full gap-6">
             {activeVersionStages.map(stage => (
               <StageColumn 
                  key={stage.id} 
                  stage={stage} 
                  applications={applications.filter(a => a.stageId === stage.id)} 
               />
             ))}
           </div>

           <DragOverlay dropAnimation={dropAnimation}>
              {activeDragItem ? <ApplicationCard app={activeDragItem} isOverlay /> : null}
           </DragOverlay>
         </DndContext>
      </div>
    </div>
  );
}
