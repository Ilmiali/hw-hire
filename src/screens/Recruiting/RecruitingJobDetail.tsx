import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { getDatabaseService } from '../../services/databaseService';
import { RecruitingJob, RecruitingApplication } from '../../types/recruiting';
import PipelineBoard from '../Pipeline/components/PipelineBoard';
import { PipelineStage } from '../../types/pipeline';
import { DEFAULT_STAGES } from '../../types/pipeline';
import { toast } from 'react-toastify';
import { Badge } from '../../components/badge';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { SplitTwoLayout } from '../../components/split-two-layout';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { RecruitingApplicationWorkspace } from './components/RecruitingApplicationWorkspace';
import { DataTable, Field } from '../../data-components/dataTable';
import { Squares2X2Icon, ListBulletIcon, ArrowLeftIcon, UsersIcon, BriefcaseIcon } from '@heroicons/react/16/solid';

export default function RecruitingJobDetail() {
  const { orgId, jobId, applicationId } = useParams<{ orgId: string; jobId: string; applicationId?: string }>();
  const navigate = useNavigate();
  const db = getDatabaseService();

  const [job, setJob] = useState<RecruitingJob | null>(null);
  const [applications, setApplications] = useState<RecruitingApplication[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
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
                postingsCount: jobDoc.postingsCount,
                applicantsCount: jobDoc.applicantsCount,
                formId: jobDoc.data?.formId || jobDoc.formId,
                applicationCardConfig: jobDoc.data?.applicationCardConfig || jobDoc.applicationCardConfig,
                layout: jobDoc.data?.layout || jobDoc.layout
             };
             setJob(jobData);

             if (jobDoc.data?.pipelineId || jobDoc.pipelineId) {
                const pid = jobDoc.data?.pipelineId || jobDoc.pipelineId;
                const pipelineDoc = await db.getDocument<any>(`orgs/${orgId}/modules/hire/pipelines`, pid);
                if (pipelineDoc) {
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

            mappedApps.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            setApplications(mappedApps);
        } catch (error) {
            console.error("Failed to fetch applications", error);
        }
    };

    useEffect(() => {
        if (!orgId || !jobId) return;
        fetchJob();
        fetchApplications();
    }, [orgId, jobId]);

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
      if (app.candidateSummary?.fullname) return app.candidateSummary.fullname;
      const candidateName = (answers as any).fullName || (answers as any).name || answers['Full Name'] || answers['Name'];
      if (candidateName) return candidateName;
      const firstName = (answers as any).firstName || (answers as any).firstname || answers['First Name'];
      const lastName = (answers as any).lastName || (answers as any).lastname || answers['Last Name'];
      if (firstName || lastName) {
          return [firstName, lastName].filter(Boolean).join(' ');
      }
      const email = app.candidateSummary?.email || (answers as any).email || (answers as any).Email || answers['Email'];
      if (email) return email;
      return 'Unknown Candidate';
  };

  const getFormattedFieldValue = (val: any) => {
      if (!val) return '';
      if (Array.isArray(val)) return val.join(', ');
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
          setApplications(prevApps);
      }
  };

  // Dynamic Fields for the List View
  const listFields = useMemo(() => {
    const fields: Field<RecruitingApplication>[] = [
      { 
        key: 'candidate', 
        label: 'Candidate',
        render: (item) => {
            const name = getCandidateName(item);
            const email = item.candidateSummary?.email || item.answers?.email || 'No email';
            
            return (
              <div className="flex items-center gap-3">
                <Avatar
                    initials={name.substring(0, 1).toUpperCase()}
                    className="size-8 bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                    variant="square"
                />
                <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{name}</span>
                    <span className="text-xs text-zinc-500">{email}</span>
                </div>
              </div>
            );
        }
      }
    ];

    const config = (job as any)?.applicationCardConfig;
    if (config?.additionalFields && applications.length > 0) {
        // Try to find labels from the first application that has these fields
        config.additionalFields.forEach((fid: string) => {
            // Find first app that has this field with a label
            const appWithField = applications.find(a => a.answers?.[fid]?.label);
            const label = appWithField?.answers?.[fid]?.label || fid;
            
            fields.push({
                key: fid,
                label: label,
                render: (item) => {
                    const answer = item.answers?.[fid];
                    return (
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {answer?.value ? getFormattedFieldValue(answer.value) : '-'}
                        </span>
                    );
                }
            });
        });
    }

    // Add Stage and other standard fields at the end
    fields.push(
      { 
          key: 'stage', 
          label: 'Stage',
          render: (item) => {
              const stage = stages.find(s => s.id === item.currentStageId);
              if (!stage) return <Badge color="zinc">Unknown Stage</Badge>;

              return (
                  <Badge 
                    style={{ 
                        backgroundColor: stage.color ? `${stage.color}15` : undefined, 
                        color: stage.color,
                        borderColor: stage.color ? `${stage.color}30` : undefined
                    }}
                    className={clsx(!stage.color && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400")}
                  >
                      {stage.name}
                  </Badge>
              );
          }
      },
      { key: 'createdAt', label: 'Applied', type: 'date', sortable: true },
      { key: 'actions', label: '', type: 'actions' }
    );

    return fields;
  }, [job, stages, applications]);

  if (loadingJob) {
      return <div className="p-8">Loading job...</div>;
  }

  if (!job) {
      return <div className="p-8">Job not found.</div>;
  }

  const MainContent = (
    <div className="flex flex-col min-h-full">
      <div 
        className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800"
        style={{ 
          background: job.layout?.cover ? job.layout.cover.value : 'transparent',
          backgroundImage: job.layout?.cover?.type === 'gradient' 
            ? `linear-gradient(${job.layout.cover.value})` 
            : undefined
        }}
      >
        <div className={clsx(
          "px-8 py-8 flex flex-col gap-4 max-w-7xl mx-auto w-full",
          job.layout?.cover ? "text-white" : "text-zinc-900 dark:text-zinc-100"
        )}>
           <div className="flex items-center gap-4 mb-2">
            <Button plain onClick={() => navigate(`/orgs/${orgId}/recruiting`)} className={job.layout?.cover ? "!text-white/80 hover:!text-white" : ""}>
                <ArrowLeftIcon className="size-4 mr-2" />
                Back to Jobs
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Avatar
              initials={job.layout?.icon?.type === 'emoji' ? job.layout.icon.value : (job.title?.substring(0, 2).toUpperCase() || 'JB')}
              src={job.layout?.icon?.type === 'image' ? job.layout.icon.value : undefined}
              className={clsx(
                "size-12 shadow-sm text-xl",
                job.layout?.cover ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800"
              )}
              variant="square"
            />
            <div className="flex flex-col">
              <Heading className={job.layout?.cover ? "text-white" : ""}>{job.title}</Heading>
              <div className={clsx(
                "mt-0.5 flex gap-2 text-sm items-center",
                job.layout?.cover ? "text-white/80" : "text-zinc-500"
              )}>
                <Text className={job.layout?.cover ? "text-white/80" : ""}>{job.location}</Text>
                <span>•</span>
                <Text className={job.layout?.cover ? "text-white/80" : ""}>Updated {new Date(job.updatedAt).toLocaleDateString()}</Text>
                <span>•</span>
                <Badge color={job.status === 'open' ? 'green' : job.status === 'closed' ? 'red' : 'zinc'}>
                    {job.status}
                </Badge>
              </div>

              <div className="flex gap-2 mt-4">
                <div className={clsx(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium shadow-sm",
                  job.layout?.cover ? "bg-white/20 text-white backdrop-blur-sm" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}>
                  <BriefcaseIcon className="size-3.5" />
                  <span>0 Postings</span>
                </div>
                <div className={clsx(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium shadow-sm",
                  job.layout?.cover ? "bg-white/20 text-white backdrop-blur-sm" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}>
                  <UsersIcon className="size-3.5" />
                  <span>{applications.length} Applicants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
              <Heading level={2} className="text-zinc-900 dark:text-zinc-100">Applicants</Heading>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                  <button
                      onClick={() => setViewMode('board')}
                      className={clsx(
                          "p-1.5 rounded-md transition-all",
                          viewMode === 'board' 
                              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" 
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                  >
                      <Squares2X2Icon className="size-4" />
                  </button>
                  <button
                      onClick={() => setViewMode('list')}
                      className={clsx(
                          "p-1.5 rounded-md transition-all",
                          viewMode === 'list' 
                              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" 
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                  >
                      <ListBulletIcon className="size-4" />
                  </button>
              </div>
          </div>

          <div className="flex-1 min-h-[500px] flex flex-col">
              {viewMode === 'board' ? (
                  <PipelineBoard 
                      stages={stages}
                      applications={applications.map(app => {
                          const config = (job as any).applicationCardConfig;
                          const candidateSummary = app.candidateSummary || {
                              fullname: getCandidateName(app),
                              email: app.answers?.email || app.answers?.Email || '',
                          };
                          const additionalFields = (config?.additionalFields || []).map((fid: string) => {
                              const answer = app.answers?.[fid];
                              if (!answer || !answer.label || !answer.value) return null;
                              return { 
                                  id: fid, 
                                  label: answer.label, 
                                  value: getFormattedFieldValue(answer.value) 
                              };
                          }).filter(Boolean) as any[];
                          return {
                              id: app.id,
                              headline: candidateSummary.fullname,
                              subtitle: candidateSummary.email,
                              stageId: app.currentStageId || stages[0].id,
                              source: app.source,
                              createdAt: app.createdAt,
                              candidateSummary,
                              additionalFields
                          };
                      })}
                      onApplicationMove={async (appId, newStageId) => {
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
                              setApplications(prevApps);
                          }
                      }}
                      onApplicationClick={handleApplicationClick}
                  />
              ) : (
                  <div className="h-full">
                      <DataTable
                          data={applications}
                          fields={listFields}
                          onAction={(action, item) => {
                              if (action === 'view') {
                                  handleApplicationClick(item.id);
                              }
                          }}
                          isLink
                      />
                  </div>
              )}
          </div>
      </div>
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
                        const cs: { fullname: string; email: string; avatarUrl?: string } = app.candidateSummary || {
                            fullname: getCandidateName(app),
                            email: app.answers?.email || app.answers?.Email || '',
                        };
                        return { 
                            id, 
                            name: cs.fullname,
                            subtitle: cs.email,
                            avatar: cs.avatarUrl ? { type: 'image', value: cs.avatarUrl } : { type: 'text', value: cs.fullname.charAt(0).toUpperCase() }
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
