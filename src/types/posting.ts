export type ChannelType = "direct" | "tyomarkkinatori" | "duunitori";
export type PostingStatus = "draft" | "published" | "closed";

export interface JobPosting {
  id: string; // The ID of this distribution record
  jobId: string;
  jobVersionId: string; // The specific immutable version being posted
  
  channel: ChannelType;
  status: PostingStatus;
  
  contentOverrides: {
    title?: string;
    description?: string;
    location?: string;
  };
  
  publicPostingId?: string; // ID of the public_postings document
  
  createdAt: string; // ISO Date
  publishedAt?: string; // ISO Date
  updatedAt?: string; // ISO Date
}

export interface PublicPosting {
  id: string; // UUID (public facing ID)
  orgId: string;
  moduleId: string; // "hire"
  
  jobId: string;
  jobPostingId: string;
  jobVersionId: string;
  
  status: "open" | "closed";
  
  source: {
    channel: ChannelType;
  };
  
  jobPublic: {
    title: string;
    location: string;
    description: string;
    employmentType: string;
  };
  
  form: {
    formId: string;
    formVersionId: string;
    schemaSnapshot: any; // Full JSON schema of the form at publish time
  };
  
  pipeline: {
    pipelineId: string;
    pipelineVersionId: string;
    firstStageId: string;
  };
  
  applyUrl: string;
  
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
}

export interface Application {
  id: string;
  orgId: string;
  moduleId: string; // "hire" ? or "recruiting"? check requirements. usage says "hire/applications"
  
  jobId: string;
  jobPostingId: string;
  publicPostingId: string;
  jobVersionId: string;
  
  source: ChannelType;
  
  // Form Data
  formId: string;
  formVersionId: string;
  answers: Record<string, any>; // fieldId -> value
  
  // Pipeline State
  pipelineId: string;
  pipelineVersionId: string;
  currentStageId: string;
  stageUpdatedAt: string;

  
  applicantName?: string; // Extracted helper for UI
  applicantEmail?: string; // Extracted helper for UI
  
  createdAt: string;
  updatedAt: string;
}
