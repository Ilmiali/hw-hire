import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pipelineService } from '../../services/mockPipelineService';
import { Pipeline, PipelineStage } from '../../types/pipeline';
import PipelineBoard from './components/PipelineBoard';

export default function JobPipelineBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [activeVersionStages, setActiveVersionStages] = useState<PipelineStage[]>([]);

  // Load Pipeline
  useEffect(() => {
    if (id) {
      const p = pipelineService.getPipeline(id);
      if (p) {
         setPipeline(p);
         const activeVersion = (p as any).versions.find((v: any) => v.id === p.activeVersionId);
         if (activeVersion) {
            setActiveVersionStages(activeVersion.stages);
         }
      }
    }
  }, [id]);

  if (!pipeline) return <div>Loading...</div>;

  return (
    <PipelineBoard 
      stages={activeVersionStages}
      name={`${pipeline.name} Preview`}
      onBack={() => navigate(`/pipelines/${id}`)}
    />
  );
}
