import { Group } from './group';

export interface View {
  id: string;
  name: string;
  organizationId: string;
  totalNumApplications: number;
  members: string[];
  owner: string;
  groups: Group[];
  layout: {
    cover: {
      id: string;
      type: string;
      value: string;
    };
    icon: {
      type: string;
      value: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseView {
  id: string;
  name: string;
  organizationId: string;
  totalNumApplications: number;
  members: string[];
  owner: string;
  groups: string[];
  layout: {
    cover: {
      id: string;
      type: string;
      value: string;
    };
    icon: {
      type: string;
      value: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
} 