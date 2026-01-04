import { SidebarSection, SidebarItem, SidebarLabel, SidebarHeading } from '../components/sidebar';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectCurrentOrganization } from '../store/slices/organizationSlice';
import { useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { getDatabaseService } from '../services/databaseService';
import { RecruitingJob } from '../types/recruiting';

export function RecruitingSidebarSection() {
  const location = useLocation();
  const currentOrganization = useSelector(selectCurrentOrganization);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);
  const db = getDatabaseService();
  
  const [jobs, setJobs] = useState<RecruitingJob[]>([]);
  // We can add loading state if needed, but for sidebar usually better to just pop in when ready or show skeleton
  
  useEffect(() => {
    if (!currentOrganization || !userId) return;

    const fetchPublishedJobs = async () => {
      try {
        const jobsPath = `orgs/${currentOrganization.id}/modules/hire/jobs`;
        // Fetch all jobs sorted by updatedAt desc, like in RecruitingJobsList.tsx
        // Avoiding constraints here ensures we don't hit index issues for this internal sidebar.
        const jobsData = await db.getDocuments<any>(jobsPath, {
            sortBy: { field: 'updatedAt', order: 'desc' }
        });

        const mappedJobs: RecruitingJob[] = jobsData.map((doc: any) => ({
            id: doc.id,
            title: doc.data?.name || doc.name || 'Untitled Job',
            location: doc.data?.location || 'Remote',
            status: doc.status || 'draft',
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt
        }));

        // Filter for published/open jobs in JS
        const activeJobs = mappedJobs.filter(job => 
            job.status === 'published' || job.status === 'open'
        );

        // Fetch applicant counts
        const jobsWithCounts = await Promise.all(activeJobs.map(async (job) => {
            try {
                const applicationsPath = `orgs/${currentOrganization.id}/modules/hire/applications`;
                const applications = await db.getDocuments(applicationsPath, {
                     constraints: [{ field: 'jobId', operator: '==', value: job.id }]
                });

                return {
                    ...job,
                    applicantsCount: applications.length
                };
            } catch (e) {
                console.error(`Failed to fetch counts for job ${job.id}`, e);
                return { ...job, applicantsCount: 0 };
            }
        }));

        setJobs(jobsWithCounts);
      } catch (error) {
        console.error("Failed to fetch sidebar jobs", error);
      }
    };

    fetchPublishedJobs();
    
    // Optional: Set up real-time listener if supported by DB service for this path
    // For now, simple fetch on mount/org change
  }, [currentOrganization?.id, userId]);

  if (!currentOrganization) return null;

  // Only render if there are published jobs? Or render empty header?
  // "And into category recruiting that lists the current published jobs."
  // Usually if empty, maybe hide or show "Recruiting" with "No active jobs".
  // Let's render always to show the section exists if that's desired, or hide if empty.
  // The prompt implies a category structure. I'll render it even if empty to keep structure, or maybe Hide.
  // "Open" jobs are arguably "Published". I need to be careful with "published" vs "open".
  // The user said "published jobs". In my previous steps I saw status 'open', 'closed', 'draft'. 
  // I should probably check if 'open' is what they mean by 'published' or if there is a new 'published' status.
  // In `RecruitingJobsList` I saw: `job.status === 'open' ? 'green' : ...`
  // I also saw a `ResourceStatus` update in conversation history to 'published'.
  // But `RecruitingJob` types might differ from `Resource`.
  // Let's check `RecruitingJob` interface or `RecruitingJobsList` logic again.
  // `RecruitingJobsList` had `job.status` mapped from doc.status.
  // It specifically checked for `open` and `closed`.
  // The user *requested* "published jobs". 
  // I will check for 'published' AND 'open' just in case, or maybe just 'published' if that was the recent change. 
  // Wait, the conversation history mentions: "Update Resource Status Fields... to published or unpublished".
  // `RecruitingJob` might be using `Resource` under the hood or separate. 
  // Let's look at `RecruitingJobsList.tsx` again (I have it in context).
  // It maps `status: doc.status || 'draft'`. 
  // And renders badge: `job.status === 'open' ? ...`. 
  // Use `['published', 'open']` to be safe? Or just query all and filter?
  // Querying all and filtering in client might be safer if volume is low.
  // Let's query all non-archived if possible.
  // I'll query for `status` in `['published', 'open']`. Firestore `in` query.
  
  return (
    <SidebarSection>
      <SidebarHeading>Recruiting</SidebarHeading>
      {jobs.length === 0 && (
          <div className="px-4 py-2 text-xs text-zinc-500">No published jobs</div>
      )}
      {jobs.map((job) => {
        const titleRaw = job.title || 'Untitled Job';
        const initials = titleRaw
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
          
        const isActive = location.pathname.includes(`/recruiting/${job.id}`);

        return (
          <SidebarItem
            key={job.id}
            href={`/orgs/${currentOrganization.id}/recruiting/${job.id}`}
            current={isActive}
          >
            <Avatar 
                variant="square" 
                initials={initials} 
                className="bg-indigo-500 text-white" 
            />
            <SidebarLabel>{titleRaw}</SidebarLabel>
            {job.applicantsCount !== undefined && job.applicantsCount > 0 && (
                <Badge className="ml-auto bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {job.applicantsCount}
                </Badge>
            )}
          </SidebarItem>
        );
      })}
    </SidebarSection>
  );
}
