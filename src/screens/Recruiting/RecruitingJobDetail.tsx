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
import { SplitTwoLayout } from '../../components/split-two-layout';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { RecruitingApplicationWorkspace } from './components/RecruitingApplicationWorkspace';
// Table removed
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';

export default function RecruitingJobDetail() {
  const { orgId, jobId, applicationId } = useParams<{ orgId: string; jobId: string; applicationId?: string }>();
  const navigate = useNavigate();
  const db = getDatabaseService();

  const [job, setJob] = useState<RecruitingJob | null>(null);
  const [applications, setApplications] = useState<RecruitingApplication[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [loadingApps, setLoadingApps] = useState(false);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  // Card Config
  const [formFields, setFormFields] = useState<any[]>([]);
  const [loadingForm, setLoadingForm] = useState(false);

  // Workspace state
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Pipeline stages state
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES); // Default fallback

  const fetchJob = async () => {
      setLoadingJob(true);
      try {
        const jobsPath = `orgs/${orgId}/modules/hire/jobs`;
        if (!jobId) return;
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
                applicantsCount: jobDoc.applicantsCount,
                formId: jobDoc.data?.formId || jobDoc.formId, // Capture formId
                applicationCardConfig: jobDoc.data?.applicationCardConfig || jobDoc.applicationCardConfig // Capture config
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



    // Fetch form schema to resolve field labels
    const fetchFormSchema = async (formId: string) => {
        setLoadingForm(true);
        try {
             const formDoc = await db.getDocument<any>(`orgs/${orgId}/modules/hire/forms`, formId);
             if (formDoc) {
                 // Simplified schema extraction
                 let schema: any = formDoc.data || formDoc;
                 
                 const fields: any[] = [];
                 if (schema.pages) {
                     schema.pages.forEach((p: any) => p.sections.forEach((s: any) => s.rows.forEach((r: any) => r.fields.forEach((f: any) => fields.push(f)))));
                 }
                 setFormFields(fields);
             }
        } catch (error) {
            console.error("Failed to fetch form schema", error);
        } finally {
            setLoadingForm(false);
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

  // Load form schema when job is loaded and has formId
  useEffect(() => {
      if (job && (job as any).formId) {
          fetchFormSchema((job as any).formId);
      }
  }, [job]);

  useEffect(() => {
      if (applicationId && !openTabIds.includes(applicationId)) {
          setOpenTabIds(prev => {
              if (prev.includes(applicationId)) return prev;
              return [...prev, applicationId];
          });
      }
  }, [applicationId]);

  const getCandidateName = (app: RecruitingApplication) => {
      const { answers } = app;
      if (!answers) return 'Unknown Candidate';
      
      // 1. Try common full name keys
      const candidateName = answers.fullName || answers.name || answers['Full Name'] || answers['Name'];
      if (candidateName) return candidateName;

      // 2. Try joining first and last name
      const firstName = answers.firstName || answers.firstname || answers['First Name'];
      const lastName = answers.lastName || answers.lastname || answers['Last Name'];
      
      if (firstName || lastName) {
          return [firstName, lastName].filter(Boolean).join(' ');
      }

      // 3. Try email as last resort fallback
      if (answers.email || answers.Email) return answers.email || answers.Email;

      return 'Unknown Candidate';
  };

  const getFieldValue = (app: RecruitingApplication, fieldId?: string) => {
      if (!fieldId || !app.answers) return undefined;
      // 1. Try direct match by field ID (ideal)
      if (app.answers[fieldId]) return app.answers[fieldId];
      
      // 2. Try match by label if we have the field definition (legacy/fallback)
      const field = formFields.find(f => f.id === fieldId);
      if (field && app.answers[field.label]) return app.answers[field.label];
      
      return undefined;
  };

  const getFormattedFieldValue = (val: any) => {
      if (!val) return '';
      if (Array.isArray(val)) return val.join(', '); // Multi-select
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
  };

  const handleApplicationClick = (appId: string) => {
      if (!openTabIds.includes(appId)) {
          setOpenTabIds(prev => [...prev, appId]);
      }
      navigate(`/orgs/${orgId}/recruiting/${jobId}/applications/${appId}`);
  };

  const handleTabClose = (tabId: string) => {
      const newTabs = openTabIds.filter(id => id !== tabId);
      setOpenTabIds(newTabs);
      
      if (tabId === applicationId) {
          if (newTabs.length > 0) {
              const lastTab = newTabs[newTabs.length - 1];
              navigate(`/orgs/${orgId}/recruiting/${jobId}/applications/${lastTab}`);
          } else {
              navigate(`/orgs/${orgId}/recruiting/${jobId}`);
          }
      }
  };

  const currentApp = applications.find(app => app.id === applicationId) || null;

  const handleAssignChange = async ({ groupId, memberId }: { groupId: string; memberId?: string }) => {
      if (!currentApp) return;

      // Optimistic update
      const prevApps = [...applications];
      setApplications(prev => prev.map(a => 
          a.id === currentApp.id ? { ...a, groupId, assignedTo: memberId } : a
      ));

      try {
          await db.updateDocument(`orgs/${orgId}/modules/hire/applications`, currentApp.id, {
              groupId,
              assignedTo: memberId || null,
              updatedAt: new Date().toISOString()
          });
      } catch (err) {
          console.error("Failed to assign application", err);
          toast.error("Failed to update assignee");
          setApplications(prevApps); // Revert
      }
  };



  if (loadingJob) {
      return <div className="p-8">Loading job...</div>;
  }

  if (!job) {
      return <div className="p-8">Job not found.</div>;
  }

  const MainContent = (
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
                applications={applications.map(app => {
                    const config = (job as any).applicationCardConfig;
                    
                    // Headline
                    let headline = getFormattedFieldValue(getFieldValue(app, config?.headlineFieldId));
                    if (!headline) headline = getCandidateName(app); // Fallback

                    // Subtitle
                    let subtitle = getFormattedFieldValue(getFieldValue(app, config?.subtitleFieldId));
                    if (!subtitle) subtitle = app.jobPostingId || 'Candidate'; // Fallback

                    // Avatar
                    const avatarFieldId = config?.avatarFieldId;
                    const avatarField = formFields.find(f => f.id === avatarFieldId);
                    const avatarVal = getFieldValue(app, avatarFieldId);
                    
                    let avatar: { type: 'text' | 'image'; value: string } | undefined;
                    
                    if (avatarField && (avatarField.type === 'file' || avatarField.type === 'image')) {
                        // Assuming val is a URL for file/image types
                         if (avatarVal) avatar = { type: 'image', value: avatarVal };
                    } else if (avatarVal) {
                         avatar = { type: 'text', value: String(avatarVal).charAt(0) };
                    }

                    // Additional Fields
                    const additionalFields = (config?.additionalFields || []).map((fid: string) => {
                        const field = formFields.find(f => f.id === fid);
                        const val = getFormattedFieldValue(getFieldValue(app, fid));
                        if (!field || !val) return null;
                        return { id: fid, label: field.label, value: val };
                    }).filter(Boolean) as any[];

                    return {
                        id: app.id,
                        headline,
                        subtitle,
                        name: headline, // legacy
                        role: subtitle, // legacy
                        stageId: app.currentStageId || stages[0].id,
                        source: app.source,
                        createdAt: app.createdAt,
                        avatar,
                        additionalFields
                    };
                })}
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
                onApplicationClick={handleApplicationClick}
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

  if (applicationId) {
      return (
          <SplitTwoLayout 
            leftColumn={
                <div className="h-full overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">
                    {MainContent}
                </div>
            }
            rightColumn={
                <RecruitingApplicationWorkspace
                    currentApplication={currentApp}
                    openTabs={openTabIds.map(id => {
                        const app = applications.find(a => a.id === id);
                        if (!app) return { id, name: 'Loading...' };

                        const config = (job as any).applicationCardConfig;
                        
                        // Headline
                        let headline = getFormattedFieldValue(getFieldValue(app, config?.headlineFieldId));
                        if (!headline) headline = getCandidateName(app); // Fallback

                        // Subtitle
                        let subtitle = getFormattedFieldValue(getFieldValue(app, config?.subtitleFieldId));
                        if (!subtitle) subtitle = app.jobPostingId || 'Candidate'; // Fallback

                        // Avatar
                        const avatarFieldId = config?.avatarFieldId;
                        const avatarField = formFields.find(f => f.id === avatarFieldId);
                        const avatarVal = getFieldValue(app, avatarFieldId);
                        
                        let avatar: { type: 'text' | 'image'; value: string } | undefined;
                        
                        if (avatarField && (avatarField.type === 'file' || avatarField.type === 'image')) {
                             if (avatarVal) avatar = { type: 'image', value: avatarVal };
                        } else if (avatarVal) {
                             avatar = { type: 'text', value: String(avatarVal).charAt(0) };
                        }

                        return { 
                            id, 
                            name: headline,
                            subtitle,
                            avatar
                        };
                    })}
                    activeTabId={applicationId}
                    isExpanded={isExpanded}
                    onExpandChange={setIsExpanded}
                    onTabChange={(id) => navigate(`/orgs/${orgId}/recruiting/${jobId}/applications/${id}`)}
                    onTabClose={handleTabClose}
                    onAssignChange={handleAssignChange}
                />
            }
            hideColumn={isExpanded ? 'left' : 'none'}
            leftColumnWidth="45%" 
          />
      );
  }

  return (
      <div className="h-full overflow-y-auto">
         {MainContent}
      </div>
  );
}

