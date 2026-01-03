export type JobStatus = "draft" | "open" | "closed";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Temporary";

export type Job = {
  id: string;
  name?: string; // Internal name
  status: JobStatus;
  
  // Metadata for listing
  createdAt: string;
  updatedAt: string;
  publishedVersionId?: string; // Last published version
};

export type JobDraft = {
  title: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  coverImage?: string;
  
  formId?: string;
  formVersionId?: string;
  
  pipelineId?: string;
  pipelineVersionId?: string;
  
  updatedAt: string;
  updatedBy?: string;
};

export type JobVersion = {
  id: string; // v_timestamp
  versionNumber?: number;
  
  jobSnapshot: {
    title: string;
    location: string;
    employmentType: EmploymentType;
    description: string;
    coverImage?: string;
  };
  
  formId?: string;
  formVersionId?: string;
  
  pipelineId?: string;
  pipelineVersionId?: string;
  
  createdAt: string;
  createdBy?: string;
};

export type PostingStatus = "not_configured" | "draft" | "published" | "failed" | "paused";

export type JobPosting = {
  channelId: string;
  status: PostingStatus;
  content: {
    title: string;
    description: string;
    location: string;
    applyUrl: string;
  };
  overrides: {
    title?: string;
    description?: string;
    location?: string;
    applyUrl?: string;
  };
  lastUpdatedAt: string;
  error?: string;
  simulateFailure?: boolean;
};

export interface ChannelDefinition {
    id: string;
    name: string;
    requiredFields: string[];
    supportsOverrides: boolean;
}
