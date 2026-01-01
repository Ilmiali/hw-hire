export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  type: 'normal' | 'terminal';
  color?: string; // Hex code
  allowedTransitions?: string[]; // Array of stage IDs allowed to transition to. If undefined/empty, allow all (except respecting terminal rules)
}

export interface PipelineVersion {
  id: string; // e.g. "v1", "v2" or UUID
  versionNumber: number;
  stages: PipelineStage[];
  createdAt: string; // ISO Date
  publishedAt?: string; // ISO Date
}

import { Resource } from './resource';

export interface Pipeline extends Resource {
  activeVersionId: string;
  versions: PipelineVersion[]; // History of versions
  organizationId: string;
  members: { uid: string; role: string }[];
}

export interface StageMoveEvent {
  applicationId: string;
  fromStageId: string;
  toStageId: string;
  timestamp: string;
  triggeredByUserId: string;
}

// Default initial stages for a new pipeline
export const DEFAULT_STAGES: PipelineStage[] = [
  { id: '1', name: 'Applied', order: 0, type: 'normal', color: '#3B82F6' },
  { id: '2', name: 'Screening', order: 1, type: 'normal', color: '#8B5CF6' },
  { id: '3', name: 'Interview', order: 2, type: 'normal', color: '#F59E0B' },
  { id: '4', name: 'Offer', order: 3, type: 'normal', color: '#10B981' },
  { id: '5', name: 'Hired', order: 4, type: 'terminal', color: '#059669' },
  { id: '6', name: 'Rejected', order: 5, type: 'terminal', color: '#EF4444' },
];
