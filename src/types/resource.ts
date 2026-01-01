
export type ResourceStatus = 'active' | 'draft' | 'archived';

export interface Resource {
  id: string;
  name: string;
  description: string;
  status: ResourceStatus;
  visibility: 'private' | 'public';
  ownerIds: string[];
  createdBy: string;
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceVersion {
  id: string;
  data: any; // Generic data payload
  createdAt: string;
  publishedAt?: string;
}
