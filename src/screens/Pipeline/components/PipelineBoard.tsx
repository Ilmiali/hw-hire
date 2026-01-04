import { useState } from 'react';
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipelineStage } from '../../../types/pipeline';
import { Button } from '../../../components/button';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';
import { toast } from 'react-toastify';
import { Avatar } from '../../../components/avatar';
import { Badge } from '../../../components/badge';

// Types for the board
export interface BoardApplication {
  id: string;
  headline: string; // fallback if candidateSummary missing
  subtitle: string; // fallback if candidateSummary missing
  stageId: string;
  source?: string;
  createdAt: string;
  candidateSummary?: {
    fullname: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  avatar?: { type: 'text' | 'image'; value: string };
  additionalFields?: { id: string; label: string; value: string }[];
  // Legacy support until full migration
  name?: string; 
  role?: string; 
}




// -- Draggable Application Card --
function ApplicationCard({ app, isOverlay }: { app: BoardApplication; isOverlay?: boolean }) {

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

  // Resolve values prioritizing candidateSummary
  const headline = app.candidateSummary?.fullname || app.headline || app.name || 'Unknown';
  const subtitle = app.candidateSummary?.email || app.candidateSummary?.phone || app.subtitle || app.role || '';
  
  // Resolve Avatar
  const avatarUrl = app.candidateSummary?.avatarUrl;
  const avatarInitials = app.candidateSummary?.fullname 
    ? app.candidateSummary.fullname.charAt(0).toUpperCase() 
    : (app.headline || app.name || '?').charAt(0).toUpperCase();

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
         {avatarUrl ? (
             <img src={avatarUrl} alt="" className="size-8 rounded-full object-cover bg-zinc-100 dark:bg-zinc-700" />
         ) : app.avatar?.type === 'image' && app.avatar.value ? (
             <img src={app.avatar.value} alt="" className="size-8 rounded-full object-cover bg-zinc-100" />
         ) : app.avatar?.type === 'text' ? (
             <Avatar initials={app.avatar.value} className="size-8" />
         ) : (
             <Avatar initials={avatarInitials} className="size-8" />
         )}

        <div className="min-w-0">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{headline}</h4>
          <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
        </div>
      </div>

       {app.additionalFields && app.additionalFields.length > 0 && (
          <div className="space-y-1.5 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-700/50">
              {app.additionalFields.map(field => (
                  <div key={field.id} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500/80">{field.label}</span>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium truncate">
                          {field.value}
                      </span>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}

// -- Column --
function StageColumn({ stage, applications, onAppClick }: { stage: PipelineStage; applications: BoardApplication[], onAppClick?: (appId: string) => void }) {
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
              <div key={app.id} onClick={() => onAppClick?.(app.id)}>
                 <ApplicationCard app={app} />
              </div>
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

interface PipelineBoardProps {
  stages: PipelineStage[];
  applications?: BoardApplication[]; // Controlled applications
  onApplicationMove?: (appId: string, newStageId: string) => void;
  onApplicationClick?: (appId: string) => void;
  name?: string;
  onBack?: () => void;
  readOnly?: boolean;
}

export default function PipelineBoard({ 
    stages, 
    applications = [], 
    onApplicationMove, 
    onApplicationClick,
    name, 
    onBack,
    readOnly = false 
}: PipelineBoardProps) {
  const [activeDragItem, setActiveDragItem] = useState<BoardApplication | null>(null);

  // We rely on parent to pass applications now


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Application') {
      setActiveDragItem(event.active.data.current.app as BoardApplication);
    }
  };

  const checkTransitionAllowed = (fromStageId: string, toStageId: string): boolean => {
    if (fromStageId === toStageId) return true;
    
    const fromStage = stages.find(s => s.id === fromStageId);
    if (!fromStage) return false;

    if (fromStage.type === 'terminal') return false; 
    
    if (fromStage.allowedTransitions === undefined) return true; 
    return fromStage.allowedTransitions.includes(toStageId);
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  const handleDragEnd = (event: DragEndEvent) => {
     setActiveDragItem(null);
     const { active, over } = event;

     if (!over) return;
     if (readOnly) return; 

     const activeId = active.id;
     const overId = over.id;

     const activeApp = applications.find(a => a.id === activeId);
     if (!activeApp) return;

     let overStageId: string | undefined;
     
     const overStage = stages.find(s => s.id === overId);
     if (overStage) {
       overStageId = overStage.id;
     } else {
       const overApp = applications.find(a => a.id === overId);
       if (overApp) {
         overStageId = overApp.stageId;
       }
     }

     if (!overStageId) return;

     // If dropped on same stage, do nothing (sorting not fully persisted in backend yet)
     if (activeApp.stageId === overStageId) {
         return;
     }

     if (!checkTransitionAllowed(activeApp.stageId, overStageId)) {
        toast.error(`Transition from "${stages.find(s => s.id === activeApp.stageId)?.name}" to "${stages.find(s => s.id === overStageId)?.name}" is not allowed.`);
        return;
     }

     // Optimistic update handled by parent or just call callback
     if (onApplicationMove) {
         onApplicationMove(activeApp.id, overStageId);
         
         // Optional: toast if moving to terminal
         const toStage = stages.find(s => s.id === overStageId);
         if (toStage?.type === 'terminal') {
             // Let parent handle messaging or keep it here
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
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      {(name || onBack) && (
        <div className="flex items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {onBack && (
            <Button plain onClick={onBack}>
              <ArrowLeftIcon className="size-4 mr-2" />
              Edit Pipeline
            </Button>
          )}
          {onBack && <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-4" />}
          {name && (
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {name}
            </h1>
          )}
        </div>
      )}

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
             {stages.map(stage => (
               <StageColumn 
                  key={stage.id} 
                  stage={stage} 
                  applications={applications.filter(a => a.stageId === stage.id)} 
                  onAppClick={onApplicationClick}
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
