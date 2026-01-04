import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { RecruitingJob, RecruitingApplication } from '../../types/recruiting';
import PipelineBoard from '../Pipeline/components/PipelineBoard';
import { PipelineStage } from '../../types/pipeline';
import { DEFAULT_STAGES } from '../../types/pipeline';
import { toast } from 'react-toastify';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
// Table removed
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';

export default function RecruitingJobDetail() {
  const { orgId, jobId } = useParams<{ orgId: string; jobId: string }>();
  const navigate = useNavigate();
  const db = getDatabaseService();

  const [job, setJob] = useState<RecruitingJob | null>(null);
  const [applications, setApplications] = useState<RecruitingApplication[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  
  // Pipeline stages state
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES); // Default fallback

  const fetchJob = async () => {
      setLoadingJob(true);
      try {
        const jobsPath = `orgs/${orgId}/modules/hire/jobs`;
        const jobDoc = await db.getDocument<any>(jobsPath, jobId);
        if (jobDoc) {
             const jobData: RecruitingJob = {
                id: jobDoc.id,
                title: jobDoc.data?.name || jobDoc.name || 'Untitled Job',
                location: jobDoc.data?.location || 'Remote',
                status: jobDoc.status || 'draft',
                updatedAt: jobDoc.updatedAt,
                createdAt: jobDoc.createdAt,
                postingsCount: jobDoc.postingsCount, // Assuming these might exist now or later
                applicantsCount: jobDoc.applicantsCount
             };
             setJob(jobData);

             // If job has a pipelineId, fetch the pipeline stages
             if (jobDoc.data?.pipelineId || jobDoc.pipelineId) {
                const pid = jobDoc.data?.pipelineId || jobDoc.pipelineId;
                const pipelineDoc = await db.getDocument<any>(`orgs/${orgId}/modules/hire/pipelines`, pid);
                if (pipelineDoc) {
                   // Try to find active version or just use data
                   // Simplified logic:
                   if (pipelineDoc.activeVersionId && pipelineDoc.versions) {
                       const v = pipelineDoc.versions.find((ver: any) => ver.id === pipelineDoc.activeVersionId);
                       if (v && v.stages) setStages(v.stages);
                   } else if (pipelineDoc.data?.stages) {
                       setStages(pipelineDoc.data.stages);
                   }
                }
             }
        }
      } catch (error) {
        console.error("Failed to fetch job", error);
      } finally {
        setLoadingJob(false);
      }
    };

    const fetchApplications = async () => {
        setLoadingApps(true);
        try {
            const appsPath = `orgs/${orgId}/modules/hire/applications`;
            const appsData = await db.getDocuments<any>(appsPath, {
                constraints: [{ field: 'jobId', operator: '==', value: jobId }]
            });
            
            const mappedApps: RecruitingApplication[] = appsData.map(doc => ({
                ...doc,
                id: doc.id,
                answers: doc.answers || doc.data?.answers || {}
            }));

            // Client-side sort
            mappedApps.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            setApplications(mappedApps);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        } finally {
            setLoadingApps(false);
        }
    };

  useEffect(() => {
    if (!orgId || !jobId) return;
    fetchJob();
    fetchApplications();
  }, [orgId, jobId]);

  const getCandidateName = (app: RecruitingApplication) => {
      const { answers } = app;
      if (!answers) return 'Unknown Candidate';
      // Try common keys
      return answers.fullName || answers.name || answers['Full Name'] || answers['Name'] || 'Unknown Candidate';
  };



  if (loadingJob) {
      return <div className="p-8">Loading job...</div>;
  }

  if (!job) {
      return <div className="p-8">Job not found.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button plain onClick={() => navigate(`/orgs/${orgId}/recruiting`)}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Jobs
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <Heading>{job.title}</Heading>
                <div className="mt-1 flex gap-2 text-zinc-500 text-sm">
                    <Text>{job.location}</Text>
                    <span>•</span>
                    <Text>Updated {new Date(job.updatedAt).toLocaleDateString()}</Text>
                </div>
            </div>
            <Badge color={job.status === 'open' ? 'green' : job.status === 'closed' ? 'red' : 'zinc'}>
                {job.status}
            </Badge>
        </div>
        
        <div className="mt-6 flex gap-8 border-t border-zinc-100 dark:border-zinc-800 pt-4">
             <div>
                <Text className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Postings</Text>
                <Text className="text-2xl font-bold mt-1">--</Text> 
                {/* Note: We could fetch counts again or pass them via location state, but keeping it simple */}
             </div>
             <div>
                <Text className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Applicants</Text>
                <Text className="text-2xl font-bold mt-1">{applications.length}</Text>
             </div>
        </div>
      </div>

      <Tabs defaultValue="applicants" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
           <TabsTrigger value="applicants">Applicants</TabsTrigger>
           <TabsTrigger value="postings">Postings</TabsTrigger>
           <TabsTrigger value="info">Job Info</TabsTrigger>
        </TabsList>
        <TabsContent value="applicants" className="mt-6 h-[calc(100vh-300px)] min-h-[500px]">
            <PipelineBoard 
                stages={stages}
                applications={applications.map(app => ({
                    id: app.id,
                    name: getCandidateName(app),
                    role: app.jobPostingId || 'Candidate', // fallback
                    stageId: app.currentStageId || stages[0].id,
                    source: app.source,
                    createdAt: app.createdAt
                }))}
                onApplicationMove={async (appId, newStageId) => {
                    // Optimistic update
                    const prevApps = [...applications];
                    setApplications(prev => prev.map(a => 
                        a.id === appId ? { ...a, currentStageId: newStageId } : a
                    ));

                    try {
                        await db.updateDocument(`orgs/${orgId}/modules/hire/applications`, appId, {
                            currentStageId: newStageId,
                            updatedAt: new Date().toISOString()
                        });
                    } catch (err) {
                        console.error("Failed to move application", err);
                        toast.error("Failed to update application stage");
                        setApplications(prevApps); // Revert
                    }
                }}
                onApplicationClick={(appId) => navigate(`/orgs/${orgId}/recruiting/applications/${appId}`)}
            />
        </TabsContent>
        <TabsContent value="postings">
            <div className="p-12 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg dashed border border-zinc-200 dark:border-zinc-800">
                Postings management coming soon.
            </div>
        </TabsContent>
        <TabsContent value="info">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <Heading level={3}>Internal Job Description</Heading>
                {/* Render description if available */}
                <Text className="mt-4 text-zinc-600">No description available.</Text>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
