import { FormSchema } from './form-builder';

export type FormStatus = 'active' | 'draft' | 'archived';

export interface Form {
  id: string;
  name: string;
  description: string;
  status: FormStatus;
  publishedVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormVersion {
  id: string;
  data: FormSchema;
  createdAt: string;
}
