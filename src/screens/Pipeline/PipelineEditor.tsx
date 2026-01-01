import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchResourceById, fetchResourceDraft, saveResourceDraft, publishResource, clearActiveResource } from '../../store/slices/resourceSlice';
import { Pipeline, PipelineStage } from '../../types/pipeline';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Field } from '../../components/fieldset';
import { ArrowLeftIcon, CheckIcon, EyeIcon } from '@heroicons/react/16/solid';
import StageListEditor from './components/StageListEditor';
import TransitionEditor from './components/TransitionEditor';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';

type Tab = 'stages' | 'transitions';

export default function PipelineEditor() {
  const { orgId, id } = useParams<{ orgId: string; id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeResource, activeDraft, loading } = useSelector((state: RootState) => state.resource);

  const [activeTab, setActiveTab] = useState<Tab>('stages');
  
  // Working state
  const [name, setName] = useState('');
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    if (orgId && id) {
        // Fetch resource and draft
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
            data: {
                id, // include ID in payload if needed
                stages
            },
            resourceUpdates: {
                name // update name on the parent resource
            }
        })).unwrap();
        toast.success("Pipeline draft saved successfully");
    } catch (error) {
        console.error("Failed to save pipeline", error);
        toast.error("Failed to save pipeline");
    } finally {
        NProgress.done();
    }
  };

  const handlePublish = async () => {
      if (!orgId || !id) return;
      if (window.confirm("Are you sure you want to publish this pipeline? This will make it live.")) {
          NProgress.start();
          try {
              // First save draft to ensure latest changes are captured
              await dispatch(saveResourceDraft({
                orgId,
                moduleId: 'hire',
                resourceType: 'pipelines',
                resourceId: id,
                data: { id, stages },
                resourceUpdates: { name }
              })).unwrap();

              await dispatch(publishResource({ orgId, moduleId: 'hire', resourceType: 'pipelines', resourceId: id })).unwrap();
              toast.success("Pipeline published successfully!");
          } catch (error) {
              console.error("Failed to publish", error);
              toast.error("Failed to publish pipeline");
          } finally {
              NProgress.done();
          }
      }
  };

  if (loading && !activeResource) return <div className="p-8">Loading...</div>;
  if (!activeResource && !loading) return null; // Or not found

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <Button plain onClick={() => navigate(`/orgs/${orgId}/pipelines`)}>
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
          {/* <Button plain onClick={() => navigate(`/orgs/${orgId}/pipelines/${id}/preview`)}>
             <EyeIcon className="size-4 mr-2" />
             Preview
          </Button> */}
          <Button onClick={handleSave} plain>
             Save Draft
          </Button>
          <Button color="indigo" onClick={handlePublish}>
            <CheckIcon className="size-4 mr-2" />
            Publish Changes
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
