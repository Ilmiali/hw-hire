import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchResourceById, fetchResourceDraft, saveResourceDraft, publishResource, clearActiveResource } from '../../store/slices/resourceSlice';
import { PipelineStage } from '../../types/pipeline';
import { Button } from '@/components/ui/button';
import { 
    ChevronLeftIcon, 
    RocketLaunchIcon,
    UsersIcon,
    ArrowDownOnSquareIcon
} from '@heroicons/react/20/solid';
import StageListEditor from './components/StageListEditor';
import TransitionEditor from './components/TransitionEditor';
import { PipelineLeftSidebar } from './components/PipelineLeftSidebar';
import { PipelinePropertiesPanel } from './components/PipelinePropertiesPanel';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import FormSettingsDialog from '../FormBuilder/components/FormSettingsDialog';

type Tab = 'stages' | 'transitions';

export default function PipelineEditor() {
  const { orgId, id } = useParams<{ orgId: string; id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeResource, activeDraft, loading } = useSelector((state: RootState) => state.resource);

  const [activeTab, setActiveTab] = useState<Tab>('stages');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Working state
  const [name, setName] = useState('');
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    if (orgId && id) {
        dispatch(fetchResourceById({ orgId, moduleId: 'hire', resourceType: 'pipelines', resourceId: id }));
        dispatch(fetchResourceDraft({ orgId, moduleId: 'hire', resourceType: 'pipelines', resourceId: id }));
    }
    return () => {
        dispatch(clearActiveResource());
    };
  }, [dispatch, orgId, id]);

  useEffect(() => {
    if (activeResource) {
        setName(activeResource.name);
    }
    if (activeDraft) {
        const draftStages = (activeDraft.data as any).stages;
        if (draftStages) {
            setStages(draftStages);
        }
    }
  }, [activeResource, activeDraft]);

  const handleSave = async () => {
    if (!orgId || !id) return;
    NProgress.start();
    try {
        await dispatch(saveResourceDraft({
            orgId,
            moduleId: 'hire',
            resourceType: 'pipelines',
            resourceId: id,
            data: { id, stages },
            resourceUpdates: { name }
        })).unwrap();
        toast.success("Pipeline draft saved!");
    } catch (error) {
        toast.error("Failed to save pipeline");
    } finally {
        NProgress.done();
    }
  };

  const handlePublish = async () => {
      if (!orgId || !id) return;
      NProgress.start();
      try {
          await dispatch(saveResourceDraft({
            orgId,
            moduleId: 'hire',
            resourceType: 'pipelines',
            resourceId: id,
            data: { id, stages },
            resourceUpdates: { name }
          })).unwrap();

          await dispatch(publishResource({ orgId, moduleId: 'hire', resourceType: 'pipelines', resourceId: id })).unwrap();
          toast.success("Pipeline published!");
      } catch (error) {
          toast.error("Failed to publish pipeline");
      } finally {
          NProgress.done();
      }
  };

  const selectedStage = stages.find(s => s.id === selectedStageId) || null;

  const handleUpdateStage = (updates: Partial<PipelineStage>) => {
      if (!selectedStageId) return;
      setStages(prev => prev.map(s => s.id === selectedStageId ? { ...s, ...updates } : s));
  };

  const handleAddStage = () => {
    const newStage: PipelineStage = {
        id: crypto.randomUUID(),
        name: 'New Stage',
        order: stages.length,
        type: 'normal',
        color: '#64748b'
    };
    const newStages = [...stages, newStage];
    setStages(newStages);
    setSelectedStageId(newStage.id);
    setActiveTab('stages');
  };

  const handleDeleteStage = (stageId: string) => {
      if (stages.length <= 1) {
          toast.warning("Pipeline must have at least one stage.");
          return;
      }
      if (!confirm("Are you sure you want to delete this stage?")) return;
      
      setStages(prev => {
          const filtered = prev.filter(s => s.id !== stageId);
          return filtered.map((s, idx) => ({ ...s, order: idx }));
      });
      if (selectedStageId === stageId) setSelectedStageId(null);
  };

  if (loading && !activeResource) return <div className="p-8">Loading...</div>;
  if (!activeResource && !loading) return null;

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-4 py-2 border-b border-zinc-200 dark:border-white/10 shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => navigate(`/orgs/${orgId}/pipelines`)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Pipeline Name"
                className="text-lg font-semibold bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-white p-0 ml-2"
            />
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
                <UsersIcon className="w-4 h-4" />
            </Button>
            <Button 
                variant="secondary"
                onClick={handleSave}
                className="h-9 px-4 text-sm font-medium bg-secondary/50 hover:bg-secondary/80 border border-border/40 rounded-lg transition-all"
            >
                <ArrowDownOnSquareIcon className="mr-2 h-4 w-4 opacity-70" />
                Save Draft
            </Button>
            <Button 
                onClick={handlePublish}
                className="h-9 px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 rounded-lg transition-all"
            >
                <RocketLaunchIcon className="mr-2 h-4 w-4" />
                Publish
            </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <PipelineLeftSidebar 
            stages={stages}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSelectStage={setSelectedStageId}
            selectedStageId={selectedStageId}
            onAddStage={handleAddStage}
        />

        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-8 overflow-y-auto" onClick={() => setSelectedStageId(null)}>
            <div className="max-w-4xl mx-auto space-y-6">
                {activeTab === 'stages' && (
                    <StageListEditor 
                        stages={stages} 
                        onChange={setStages} 
                        selectedStageId={selectedStageId}
                        onSelectStage={setSelectedStageId}
                    />
                )}
                {activeTab === 'transitions' && (
                    <TransitionEditor stages={stages} onChange={setStages} />
                )}
            </div>
        </div>

        {selectedStageId && (
            <PipelinePropertiesPanel 
                stage={selectedStage}
                onUpdate={handleUpdateStage}
                onDelete={() => handleDeleteStage(selectedStageId)}
                onClose={() => setSelectedStageId(null)}
            />
        )}
      </div>

      <FormSettingsDialog 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          orgId={orgId!} 
          formId={id!} 
      />
    </div>
  );
}
