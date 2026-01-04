export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';

export interface RecruitingApplication {
  id: string;
  jobId: string;
  jobPostingId?: string;
  publicPostingId?: string;
  jobVersionId?: string;
  source?: string;
  currentStageId?: string;
  groupId?: string;
  assignedTo?: string; // Member ID
  answers: Record<string, any>; // e.g. { fullName: "...", email: "..." }
  createdAt: string; // ISO timestamp
  updatedAt?: string;
}

export type JobStatus = 'draft' | 'open' | 'closed';

export interface RecruitingJob {
  id: string;
  title?: string;
  name?: string; // Fallback if title is missing
  location?: string;
  status: JobStatus;
  updatedAt: string;
  createdAt: string;
  
  // Client-side aggregated counts
  postingsCount?: number;
  applicantsCount?: number;
}

export interface JobStats {
  postingsCount: number;
  applicantsCount: number;
  updatedAt: string;
}
