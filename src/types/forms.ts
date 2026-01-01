import { FormSchema } from './form-builder';

import { Resource, ResourceStatus } from './resource';

export type FormStatus = ResourceStatus;

export interface Form extends Resource {
  // Form specific fields can go here if any.
  // Currently Form matches Resource exactly, but we keep the interface for type safety/extension.
}

export interface FormVersion {
  id: string;
  data: FormSchema;
  createdAt: string;
}
