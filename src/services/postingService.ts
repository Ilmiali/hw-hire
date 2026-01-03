
import { getDatabaseService } from './databaseService';
import { JobPosting, PublicPosting, ChannelType } from '../types/posting';
import { JobDraft, JobVersion } from '../types/jobs';
import { FormSchema } from '../types/form-builder';
import { PipelineVersion } from '../types/pipeline';

class PostingService {
  private static instance: PostingService;
  
  public static getInstance(): PostingService {
    if (!PostingService.instance) {
      PostingService.instance = new PostingService();
    }
    return PostingService.instance;
  }


  private getJobDraftPath(orgId: string, jobId: string) {
    return `orgs/${orgId}/modules/hire/jobs/${jobId}/draft`;
  }

  private getJobVersionsPath(orgId: string, jobId: string) {
    return `orgs/${orgId}/modules/hire/jobs/${jobId}/versions`;
  }

  private getJobPostingsPath(orgId: string) {
    return `orgs/${orgId}/modules/hire/jobPostings`;
  }

  private getPublicPostingsPath() {
    return `public_postings`;
  }

  // Helper to fetch resource versions since they might be in different modules or shared paths
  // For now assuming same org/module structure as the job for simplicity, 
  // but in reality might need to look up where the form lives if it's shared.
  // We'll rely on the IDs stored in the draft.
  private getFormVersionPath(orgId: string, formId: string) {
     return `orgs/${orgId}/modules/hire/forms/${formId}/versions`; 
  }

  private getPipelineVersionPath(orgId: string, pipelineId: string) {
      return `orgs/${orgId}/modules/hire/pipelines/${pipelineId}/versions`;
  }


  public async publishJob(
    orgId: string, 
    jobId: string, 
    channel: ChannelType, 
    overrides: { title?: string; description?: string; location?: string }
  ): Promise<string> {
    const db = getDatabaseService();
    
    // Helper for robust unwrapping of 'data' properties from common resourceSlice patterns
    const unwrap = (doc: any) => {
        let current = doc;
        // Keep digging as long as there is a 'data' property and we haven't found our target properties
        // FormSchema has 'pages', PipelineVersion has 'stages', JobDraft has 'title'
        while (current && current.data && !current.stages && !current.pages && !current.title) {
            current = current.data;
        }
        return current;
    };

    // 1. Fetch Draft
    const draftDoc = await db.getDocument(this.getJobDraftPath(orgId, jobId), 'current');
    if (!draftDoc) throw new Error("Job draft not found");
    const draftData = unwrap(draftDoc) as JobDraft;
    
    if (!draftData || !draftData.title) {
        throw new Error("Job draft data is empty or invalid");
    }

    // Validate Draft References
    if (!draftData.formId || !draftData.formVersionId) throw new Error("Job must have a form selected before publishing");
    if (!draftData.pipelineId || !draftData.pipelineVersionId) throw new Error("Job must have a pipeline selected before publishing");

    // 2. Create Job Version Snapshot
    const newVersionId = `v_${Date.now()}`;
    const jobVersion: JobVersion = {
        id: newVersionId,
        jobSnapshot: {
            title: draftData.title,
            location: draftData.location,
            employmentType: draftData.employmentType,
            description: draftData.description
        },
        formId: draftData.formId,
        formVersionId: draftData.formVersionId,
        pipelineId: draftData.pipelineId,
        pipelineVersionId: draftData.pipelineVersionId,
        createdAt: new Date().toISOString()
    };
    
    const jobVersionsPath = this.getJobVersionsPath(orgId, jobId);
    await db.setDocument(jobVersionsPath, newVersionId, jobVersion as any);

    // 3. Fetch Dependencies (Form & Pipeline Snapshots)
    // We need to fetch the ACTUAL schema at this moment to snapshot it.
    const formVersionPath = this.getFormVersionPath(orgId, draftData.formId);
    const formVersionDoc = await db.getDocument(formVersionPath, draftData.formVersionId);
    if (!formVersionDoc) throw new Error("Referenced Form Version not found");
    const formVersionData = unwrap(formVersionDoc) as FormSchema; 

    const pipelineVersionPath = this.getPipelineVersionPath(orgId, draftData.pipelineId);
    const pipelineVersionDoc = await db.getDocument(pipelineVersionPath, draftData.pipelineVersionId);
    if (!pipelineVersionDoc) throw new Error("Referenced Pipeline Version not found");
    const pipelineVersionData = unwrap(pipelineVersionDoc) as PipelineVersion;

    if (!pipelineVersionData || !pipelineVersionData.stages) {
        throw new Error("Pipeline version data is invalid or missing stages");
    }

    const firstStage = pipelineVersionData.stages.find(s => s.order === 0) || pipelineVersionData.stages[0];
    if (!firstStage) throw new Error("Pipeline has no stages");

    // 4. Create Public Posting
    // We generate ID first
    // In firestore client SDK we can usually get ID from ref, but here `addDocument` returns doc.
    // We'll trust `addDocument` for PublicPosting and then update JobPosting.
    
    const publicPostingData: Omit<PublicPosting, 'id'> = {
        orgId,
        moduleId: 'hire',
        jobId,

        jobVersionId: newVersionId,
        jobPostingId: "PENDING", // Will update after creating jobPosting
        status: 'open',
        source: { channel },
        jobPublic: {
            title: overrides.title || draftData.title || "",
            location: overrides.location || draftData.location || "",
            description: overrides.description || draftData.description || "",
            employmentType: draftData.employmentType,
        },
        form: {
            formId: draftData.formId,
            formVersionId: draftData.formVersionId,
            schemaSnapshot: formVersionData // The form schema
        },
        pipeline: {
            pipelineId: draftData.pipelineId,
            pipelineVersionId: draftData.pipelineVersionId,
            firstStageId: firstStage.id
        },
        applyUrl: "", // Will populate
        createdAt: new Date().toISOString()
    };

    const publicPostingsPath = this.getPublicPostingsPath();
    const publicPostingDoc = await db.addDocument(publicPostingsPath, publicPostingData);
    const publicPostingId = publicPostingDoc.id;
    const applyUrl = `${window.location.origin}/apply/${publicPostingId}`;

    // Update Public Posting with its ID and proper Link (if we missed it)
    // and backlink to JobPosting (which we haven't created yet... circular dependency of IDs)
    // Let's create JobPosting next.
    
    // 5. Create Job Posting (Internal)
    const jobPostingData: Omit<JobPosting, 'id'> = {
        jobId,
        jobVersionId: newVersionId,
        channel,
        status: 'published',
        contentOverrides: overrides,
        publicPostingId: publicPostingId,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
    };

    const jobPostingsPath = this.getJobPostingsPath(orgId);
    const jobPostingDoc = await db.addDocument(jobPostingsPath, jobPostingData);
    const jobPostingId = jobPostingDoc.id;

    // 6. Cross-link IDs
    await db.updateDocument(publicPostingsPath, publicPostingId, {
        jobPostingId: jobPostingId,
        applyUrl: applyUrl
    });

    // 7. Update Job Metadata (last published version)
    const jobsCollectionPath = `orgs/${orgId}/modules/hire/jobs`;
    await db.updateDocument(jobsCollectionPath, jobId, {
        publishedVersionId: newVersionId,
        updatedAt: new Date().toISOString()
    });

    return publicPostingId;
  }

  public async getPostingsForJob(orgId: string, jobId: string): Promise<JobPosting[]> {
    const db = getDatabaseService();
    const path = this.getJobPostingsPath(orgId);
    console.log(`[PostingService] Fetching postings from path: ${path} for jobId: ${jobId}`);
    const postings = await db.getDocuments<JobPosting>(path, {
      constraints: [{ field: 'jobId', operator: '==', value: jobId }]
    });
    return postings;
  }
  async closePosting(orgId: string, posting: JobPosting): Promise<void> {
    const db = getDatabaseService();
    
    // 1. Update PublicPosting status to closed
    if (posting.publicPostingId) {
        await db.updateDocument(
            'public_postings', 
            posting.publicPostingId, 
            { status: 'closed', expiresAt: new Date().toISOString() }
        );
    }

    // 2. Update JobPosting status to closed
    await db.updateDocument(
        `orgs/${orgId}/modules/hire/jobPostings`,
        posting.id,
        { status: 'closed', publishedAt: null } // Optional: clear publishedAt or keep it as history
    );

  }
}



export const postingService = PostingService.getInstance();
