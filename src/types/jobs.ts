export type JobStatus = "draft" | "open" | "closed";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Temporary";

export type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  status: JobStatus;
  coverImage?: string;
  pipelineId?: string;
  pipelineVersionId?: string;
  formId?: string;
  formVersionId?: string;
  createdAt: string;
  updatedAt: string;
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
