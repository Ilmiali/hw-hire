
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pipelineService } from '../../services/mockPipelineService';
import { Pipeline, PipelineStage } from '../../types/pipeline';
import PipelineBoard, { BoardApplication } from './components/PipelineBoard';

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

  const mockApps = useMemo(() => generateMockApplications(activeVersionStages), [activeVersionStages]);

  if (!pipeline) return <div>Loading...</div>;

  return (
    <PipelineBoard 
      stages={activeVersionStages}
      applications={mockApps}
      name={`${pipeline.name} Preview`}
      onBack={() => navigate(`/pipelines/${id}`)}
    />
  );
}

// Helper to generate mock apps for preview
const generateMockApplications = (stages: PipelineStage[]): BoardApplication[] => {
  if (stages.length === 0) return [];
  const apps: BoardApplication[] = [];
  const roles = ['Frontend Engineer', 'Product Manager', 'Designer', 'Backend Dev'];
  const names = ['Alice Smith', 'Bob Jones', 'Charlie Day', 'Diana Prince', 'Evan Wright'];

  for (let i = 0; i < 10; i++) {
    const stageIndex = Math.floor(Math.random() * Math.min(stages.length, 3));
    apps.push({
      id: `app-${i}`,
      name: names[i % names.length],
      role: roles[i % roles.length],
      stageId: stages[stageIndex]?.id || stages[0].id,
      createdAt: new Date().toISOString()
    });
  }
  return apps;
};
