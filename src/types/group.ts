import { Entity } from '../database-components/entitiesTable';

export interface Group extends Entity {
  name: string;
  organizationId: string;
  totalNumTickets: number;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
} 