import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pipelineService } from '../../services/mockPipelineService';
import { Pipeline, PipelineStage } from '../../types/pipeline';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Field } from '../../components/fieldset';
import { ArrowLeftIcon, CheckIcon, EyeIcon } from '@heroicons/react/16/solid';
import StageListEditor from './components/StageListEditor';
import TransitionEditor from './components/TransitionEditor';
import { toast } from 'react-toastify';

type Tab = 'stages' | 'transitions';

export default function PipelineEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('stages');
  
  // Working state
  const [name, setName] = useState('');
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    if (id) {
      const p = pipelineService.getPipeline(id);
      if (p) {
        setPipeline(p);
        setName(p.name);
        // Load stages from active version
        const activeVersion = p.versions.find(v => v.id === p.activeVersionId);
        if (activeVersion) {
          setStages(activeVersion.stages);
        }
      } else {
        toast.error("Pipeline not found");
        navigate('/pipelines');
      }
      setLoading(false);
    }
  }, [id, navigate]);

  const handleSave = () => {
    if (!pipeline) return;

    // In a real app, we might create a new version here or draft.
    // For now, we update the existing active version in place or mock a "new version publish" behavior.
    const updatedPipeline = { ...pipeline };
    updatedPipeline.name = name;
    
    // Update the active version's stages
    updatedPipeline.versions = updatedPipeline.versions.map(v => {
      if (v.id === pipeline.activeVersionId) {
        return { ...v, stages };
      }
      return v;
    });

    pipelineService.updatePipeline(updatedPipeline);
    setPipeline(updatedPipeline);
    toast.success("Pipeline saved successfully");
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!pipeline) return null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <Button plain onClick={() => navigate('/pipelines')}>
            <ArrowLeftIcon className="size-4 mr-1" />
            Back
          </Button>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
          <Field className="w-64">
             <Input 
               value={name} 
               onChange={(e) => setName(e.target.value)} 
               placeholder="Pipeline Name"
               className="font-semibold text-lg border-0 focus:ring-0 px-0 shadow-none bg-transparent dark:text-white"
             />
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Button plain onClick={() => navigate(`/pipelines/${id}/preview`)}>
             <EyeIcon className="size-4 mr-2" />
             Preview
          </Button>
          <Button color="indigo" onClick={handleSave}>
            <CheckIcon className="size-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('stages')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'stages'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'}
            `}
          >
            Stages
          </button>
          <button
            onClick={() => setActiveTab('transitions')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'transitions'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'}
            `}
          >
            Transitions
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 w-full">
         <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[500px]">
           {activeTab === 'stages' && (
             <StageListEditor stages={stages} onChange={setStages} />
           )}
           {activeTab === 'transitions' && (
             <TransitionEditor stages={stages} onChange={setStages} />
           )}
         </div>
      </div>
    </div>
  );
}
