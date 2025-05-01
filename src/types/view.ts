import { Group } from './group';

export interface View {
  id: string;
  name: string;
  organizationId: string;
  totalNumTickets: number;
  members: string[];
  groups: Group[];
  layout: {
    cover: string;
    coverType: string;
    iconType: string;
    icon: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseView {
  id: string;
  name: string;
  organizationId: string;
  totalNumTickets: number;
  members: string[];
  groups: string[];
  layout: {
    cover: string;
    coverType: string;
    iconType: string;
    icon: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 