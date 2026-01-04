
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { fetchResourceById, fetchResourceVersionById } from '../../../store/slices/resourceSlice';
import PipelineBoard, { BoardApplication } from '../../Pipeline/components/PipelineBoard';
import { PipelineStage } from '../../../types/pipeline';
import { Spinner } from '../../../components/ui/spinner';

interface PipelinePreviewProps {
    orgId: string;
    pipelineId: string;
    versionId?: string;
}

export const PipelinePreview = ({ orgId, pipelineId, versionId }: PipelinePreviewProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const loadPipeline = async () => {
            if (!orgId || !pipelineId) return;
            setLoading(true);
            try {
                let resourceData: any;
                
                if (versionId) {
                    const res = await dispatch(fetchResourceVersionById({ 
                        orgId, 
                        moduleId: 'hire', 
                        resourceType: 'pipelines', 
                        resourceId: pipelineId,
                        versionId
                    })).unwrap();
                    resourceData = res.data;
                } else {
                    const res = await dispatch(fetchResourceById({ 
                        orgId, 
                        moduleId: 'hire', 
                        resourceType: 'pipelines', 
                        resourceId: pipelineId 
                    })).unwrap();
                    resourceData = res;
                }

                if (resourceData.stages) {
                    setStages(resourceData.stages);
                } else if (resourceData.data?.stages) {
                     setStages(resourceData.data.stages);
                } else if (resourceData.stages) { // In case it's the raw data object from version
                    setStages(resourceData.stages);
                }
            } catch (error) {
                console.error("Failed to load pipeline preview", error);
            } finally {
                setLoading(false);
            }
        };

        loadPipeline();
    }, [dispatch, orgId, pipelineId, versionId]);

    if (loading) return <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800"><Spinner /></div>;
    if (!pipelineId) return <div className="h-64 flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-sm italic">Select a pipeline to see preview</div>;
    if (stages.length === 0) return <div className="h-64 flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-sm">No stages found for this pipeline</div>;

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pipeline Preview</span>
                <span className="text-[10px] text-zinc-400 italic">Read-only view</span>
            </div>
            <div className="p-4 overflow-x-auto">
                <div className="min-w-max h-[400px]">
                    <PipelineBoard stages={stages} readOnly applications={generateMockApplications(stages)} />
                </div>
            </div>
        </div>
    );
};
export const generateMockApplications = (stages: PipelineStage[]): BoardApplication[] => {
  if (stages.length === 0) return [];
  const apps: BoardApplication[] = [];
  const roles = ['Frontend Engineer', 'Product Manager', 'Designer', 'Backend Dev'];
  const names = ['Alice Smith', 'Bob Jones', 'Charlie Day', 'Diana Prince', 'Evan Wright'];

  for (let i = 0; i < 5; i++) {
    const stageIndex = Math.floor(Math.random() * Math.min(stages.length, 3));
    const name = names[i % names.length];
    apps.push({
      id: `app-${i}`,
      headline: name,
      subtitle: roles[i % roles.length],
      name: name, // legacy compat
      role: roles[i % roles.length], // legacy compat
      stageId: stages[stageIndex]?.id || stages[0].id,
      createdAt: new Date().toISOString(),
      avatar: { type: 'text', value: name.charAt(0) }
    });
  }
  return apps;
};
