import { PipelineStage } from '../../../types/pipeline';

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  stages: PipelineStage[];
}
