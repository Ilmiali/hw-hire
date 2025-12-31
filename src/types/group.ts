import { Entity } from '../database-components/EntitiesTable';

export interface Group extends Entity {
  name: string;
  description?: string;
  organizationId: string;
  totalNumApplications: number;
  members: string[];
  createdAt: string;
  updatedAt: string;
} 