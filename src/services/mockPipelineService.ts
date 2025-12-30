import { Pipeline, PipelineStage, DEFAULT_STAGES } from '../types/pipeline';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'hw-hire-mock-pipelines';

const generateDefaultPipeline = (): Pipeline => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: 'Default Pipeline',
    createdAt: now,
    updatedAt: now,
    organizationId: 'org-1',
    activeVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        stages: [...DEFAULT_STAGES],
        createdAt: now,
        publishedAt: now,
      }
    ]
  };
};

class MockPipelineService {
  private pipelines: Pipeline[] = [];

  constructor() {
    this.load();
    if (this.pipelines.length === 0) {
      this.pipelines.push(generateDefaultPipeline());
      this.save();
    }
  }

  private load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        this.pipelines = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse pipelines', e);
        this.pipelines = [];
      }
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pipelines));
  }

  getPipelines(): Pipeline[] {
    return [...this.pipelines];
  }

  getPipeline(id: string): Pipeline | undefined {
    return this.pipelines.find(p => p.id === id);
  }

  createPipeline(name: string): Pipeline {
    const now = new Date().toISOString();
    const newPipeline: Pipeline = {
      id: uuidv4(),
      name,
      createdAt: now,
      updatedAt: now,
      organizationId: 'org-1',
      activeVersionId: 'v1',
      versions: [
        {
          id: 'v1',
          versionNumber: 1,
          stages: [...DEFAULT_STAGES],
          createdAt: now
        }
      ]
    };
    this.pipelines.push(newPipeline);
    this.save();
    return newPipeline;
  }

  updatePipeline(updatedPipeline: Pipeline): void {
    const index = this.pipelines.findIndex(p => p.id === updatedPipeline.id);
    if (index !== -1) {
      this.pipelines[index] = { ...updatedPipeline, updatedAt: new Date().toISOString() };
      this.save();
    }
  }

  deletePipeline(id: string): void {
    this.pipelines = this.pipelines.filter(p => p.id !== id);
    this.save();
  }
}

export const pipelineService = new MockPipelineService();
