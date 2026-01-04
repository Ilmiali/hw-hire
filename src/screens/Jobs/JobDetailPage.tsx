
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
    fetchResourceById, 
    fetchResourceDraft, 
    saveResourceDraft, 
    clearActiveResource,
    fetchResources,
    fetchResourceVersions,
    fetchResourceVersionById
} from '../../store/slices/resourceSlice';
import { Button } from '../../components/button';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { Textarea } from '../../components/textarea';
import { Badge } from '../../components/badge';
import { JobDraft, EmploymentType } from '../../types/jobs';
import { JobPosting, ChannelType } from '../../types/posting';
import { postingService } from '../../services/postingService';
import { CHANNELS } from '../../config/channels';
import { Dialog, DialogTitle, DialogDescription, DialogActions } from '../../components/dialog';
import { ColorPickerCard } from '../../components/ColorPickerCard';
import { ColorOption } from '../../components/ColorPickerDialog';
import { EmojiPicker } from '../../components/EmojiPicker';

import { CoverPicker } from './components/CoverPicker';


import { PipelinePreview } from './components/PipelinePreview';
import { FormPreviewBox } from './components/FormPreviewBox';
import NProgress from 'nprogress';
import clsx from 'clsx';
import JobEditorSkeleton from './components/JobEditorSkeleton';
import { SharingDialog } from '../../database-components/SharingDialog';
import { ResourceVersion } from '../../types/resource';
import { PostingEditor } from './components/PostingEditor';

import { 
    UsersIcon,
    ChevronLeftIcon,
    BriefcaseIcon,
    ArrowPathIcon,
    GlobeAltIcon,
    ArrowDownOnSquareIcon,
    DocumentTextIcon,
    PlusIcon,
    LinkIcon,
    BuildingOffice2Icon,
    IdentificationIcon,
    SparklesIcon
} from '@heroicons/react/20/solid';
import { FormSchema, FormField } from '../../types/form-builder';
import { ApplicationCardPreview } from './components/ApplicationCardPreview';
import { Checkbox } from '../../components/checkbox';

export default function JobDetailPage() {
  const { orgId, jobId } = useParams<{ orgId: string; jobId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { activeResource, activeDraft, loading, resources } = useSelector((state: RootState) => state.resource);
  
  const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'form' | 'posting' | 'personalize'>('details');
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [isChannelPickerOpen, setIsChannelPickerOpen] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Job Form State
  const [jobForm, setJobForm] = useState<Partial<JobDraft>>({});

  const [isSaving, setIsSaving] = useState(false);

  // Postings State
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loadingPostings, setLoadingPostings] = useState(false);
  const [pendingPostingChannel, setPendingPostingChannel] = useState<ChannelType | null>(null);

  // Version States
  const [pipelineVersions, setPipelineVersions] = useState<ResourceVersion[]>([]);
  const [formVersions, setFormVersions] = useState<ResourceVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Card Config State
  const [availableFormFields, setAvailableFormFields] = useState<FormField[]>([]);
  const [loadingFormSchema, setLoadingFormSchema] = useState(false);

  useEffect(() => {
    if (orgId && jobId) {
      dispatch(fetchResourceById({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId }));
      dispatch(fetchResourceDraft({ orgId, moduleId: 'hire', resourceType: 'jobs', resourceId: jobId }));
      
      dispatch(fetchResources({ orgId, moduleId: 'hire', resourceType: 'forms' }));
      dispatch(fetchResources({ orgId, moduleId: 'hire', resourceType: 'pipelines' }));
      
      loadPostings();
    }
    return () => {
      dispatch(clearActiveResource());
    };
  }, [dispatch, orgId, jobId]);

  const loadPostings = async () => {
    if (!orgId || !jobId) return;
    setLoadingPostings(true);
    try {
        const data = await postingService.getPostingsForJob(orgId, jobId);
        setPostings(data);
        
        // If the selected posting is gone, clear selection
        if (selectedPostingId && !data.find(p => p.id === selectedPostingId)) {
            setSelectedPostingId(null);
            if (activeTab === 'posting') {
                setActiveTab('details'); // Fallback to details if we were looking at the deleted posting
            }
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to load postings");
    } finally {
        setLoadingPostings(false);
    }
  };

  useEffect(() => {
    if (activeDraft) {
      const draftData = activeDraft.data as any;
      setJobForm({
        title: draftData.title || activeResource?.name || '',
        location: draftData.location || '',
        employmentType: draftData.employmentType || 'Full-time',
        description: draftData.description || '',
        coverImage: draftData.coverImage,
        layout: draftData.layout || {
            cover: { id: 'blue', type: 'solid', value: '#64B5F6' },
            icon: { type: 'emoji', value: '📋' }
        },
        formId: draftData.formId,
        formVersionId: draftData.formVersionId,
        pipelineId: draftData.pipelineId,
        pipelineVersionId: draftData.pipelineVersionId,
        applicationCardConfig: draftData.applicationCardConfig || {},
      });
    } else if (activeResource) {
      setJobForm({
        title: activeResource.name,
        location: (activeResource as any).location || '',
        employmentType: (activeResource as any).employmentType || 'Full-time',
        description: (activeResource as any).description || '',
        coverImage: (activeResource as any).coverImage,
        layout: (activeResource as any).layout || {
            cover: { id: 'blue', type: 'solid', value: '#64B5F6' },
            icon: { type: 'emoji', value: '📋' }
        },

        formId: (activeResource as any).formId,
        formVersionId: (activeResource as any).formVersionId,
        pipelineId: (activeResource as any).pipelineId,
        pipelineVersionId: (activeResource as any).pipelineVersionId,
        applicationCardConfig: (activeResource as any).applicationCardConfig || {},
      });
    }
  }, [activeDraft, activeResource]);
  
  // Load form schema to get fields for card config
  useEffect(() => {
    const loadFormSchema = async () => {
        if (!orgId || !jobForm.formId) {
            setAvailableFormFields([]);
            return;
        }

        setLoadingFormSchema(true);
        try {
            let resourceData: any;
            if (jobForm.formVersionId) {
                const res = await dispatch(fetchResourceVersionById({ 
                    orgId, 
                    moduleId: 'hire', 
                    resourceType: 'forms', 
                    resourceId: jobForm.formId,
                    versionId: jobForm.formVersionId
                })).unwrap();
                resourceData = res.data;
            } else {
                const res = await dispatch(fetchResourceById({ 
                    orgId, 
                    moduleId: 'hire', 
                    resourceType: 'forms', 
                    resourceId: jobForm.formId 
                })).unwrap();
                resourceData = res;
            }
            
            let schema: FormSchema | null = null;
            if (resourceData.data) {
                schema = resourceData.data;
            } else if (resourceData.pages) { // handle if it is directly the schema object
                 schema = resourceData;
            } else if ((resourceData as any).id && (resourceData as any).pages) {
                 schema = resourceData;
            }

            if (schema) {
                const fields: FormField[] = [];
                schema.pages.forEach(page => {
                    page.sections.forEach(section => {
                        section.rows.forEach(row => {
                            row.fields.forEach(field => {
                                // Exclude structural fields
                                if (!['divider', 'spacer', 'image'].includes(field.type)) {
                                    fields.push(field);
                                }
                            });
                        });
                    });
                });
                setAvailableFormFields(fields);
            }
        } catch (error) {
            console.error("Failed to load form schema", error);
        } finally {
            setLoadingFormSchema(false);
        }
    };
    
    loadFormSchema();
  }, [dispatch, orgId, jobForm.formId, jobForm.formVersionId]);

  // Load versions for selected pipeline
  useEffect(() => {
      const loadVersions = async () => {
          if (orgId && jobForm.pipelineId) {
              setLoadingVersions(true);
              try {
                const versions = await dispatch(fetchResourceVersions({ 
                    orgId, 
                    moduleId: 'hire', 
                    resourceType: 'pipelines', 
                    resourceId: jobForm.pipelineId 
                })).unwrap();
                setPipelineVersions(versions);
                
                // If no version selected, default to published version
                if (!jobForm.pipelineVersionId) {
                    const pipeline = (resources['pipelines'] || []).find(p => p.id === jobForm.pipelineId);
                    if (pipeline?.publishedVersionId) {
                        setJobForm(prev => ({ ...prev, pipelineVersionId: pipeline.publishedVersionId }));
                    }
                }
              } catch (err) {
                  console.error("Failed to fetch pipeline versions", err);
              } finally {
                  setLoadingVersions(false);
              }
          } else {
              setPipelineVersions([]);
          }
      };
      loadVersions();
  }, [orgId, jobForm.pipelineId, dispatch, resources]);

  // Load versions for selected form
  useEffect(() => {
      const loadVersions = async () => {
          if (orgId && jobForm.formId) {
              setLoadingVersions(true);
              try {
                const versions = await dispatch(fetchResourceVersions({ 
                    orgId, 
                    moduleId: 'hire', 
                    resourceType: 'forms', 
                    resourceId: jobForm.formId 
                })).unwrap();
                setFormVersions(versions);

                // If no version selected, default to published version
                if (!jobForm.formVersionId) {
                    const form = (resources['forms'] || []).find(f => f.id === jobForm.formId);
                    if (form?.publishedVersionId) {
                        setJobForm(prev => ({ ...prev, formVersionId: form.publishedVersionId }));
                    }
                }
              } catch (err) {
                  console.error("Failed to fetch form versions", err);
              } finally {
                  setLoadingVersions(false);
              }
          } else {
              setFormVersions([]);
          }
      };
      loadVersions();
  }, [orgId, jobForm.formId, dispatch, resources]);

  const handleJobSave = async () => {
    if (!orgId || !jobId || isSaving) return;
    
    setIsSaving(true);
    NProgress.start();
    try {
        await dispatch(saveResourceDraft({
            orgId,
            moduleId: 'hire',
            resourceType: 'jobs',
            resourceId: jobId,
            data: { 
                ...jobForm, 
                id: jobId
            },

            resourceUpdates: { 
                name: jobForm.title,
                formId: jobForm.formId,
                formVersionId: jobForm.formVersionId,
                pipelineId: jobForm.pipelineId,
                pipelineVersionId: jobForm.pipelineVersionId,
                applicationCardConfig: jobForm.applicationCardConfig,
                layout: jobForm.layout,
            } as any
        })).unwrap();
        toast.success('Job saved');
    } catch (error) {
        toast.error('Failed to save job');
    } finally {
        setIsSaving(false);
        NProgress.done();
    }
  };


  const handleCreatePosting = async (channel: ChannelType) => {
      if (!orgId || !jobId) return;
      if (!jobForm.formId || !jobForm.pipelineId) {
          toast.warning("Please select a Form and Workflow first.");
          return;
      }

      setPendingPostingChannel(channel);
      setIsChannelPickerOpen(false);
      const toastId = toast.loading(`Creating ${channel === 'direct' ? 'direct link' : channel} posting...`);

      try {
          const newPosting = await postingService.createDraftPosting(orgId, jobId, channel);
          await loadPostings();
          setActiveTab('posting');
          setSelectedPostingId(newPosting.id);
          toast.update(toastId, { 
              render: "Draft posting created", 
              type: "success", 
              isLoading: false,
              autoClose: 3000 
          });
      } catch (error) {
          console.error(error);
          toast.update(toastId, { 
              render: "Failed to create posting", 
              type: "error", 
              isLoading: false,
              autoClose: 5000 
          });
      } finally {
          setPendingPostingChannel(null);
      }
  };

  const selectedPosting = postings.find(p => p.id === selectedPostingId);

  if (loading && !activeResource) return <JobEditorSkeleton />;
  if (!activeResource && !loading) return null;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-2 border-b border-zinc-200 dark:border-white/10 shrink-0 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/orgs/${orgId}/jobs`)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 font-medium">Job Editor</span>
            <input 
                value={jobForm.title || ''} 
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="text-sm font-semibold bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-white p-0 "
            />
          </div>
          <Badge color={((activeResource?.status as any) === 'published') ? 'green' : 'zinc'}>
            {activeResource?.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
            <Button 
                plain
                 onClick={() => setIsSharingOpen(true)}
                 className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
                 title="Sharing"
             >
                 <UsersIcon className="w-4 h-4" />
             </Button>
            <Button 
                outline
                onClick={() => navigate(`/orgs/${orgId}/jobs`)}
                className="h-9 px-4 text-sm font-medium border border-zinc-200 dark:border-white/10 rounded-lg"
            >
                Cancel
            </Button>
            <Button 
                onClick={handleJobSave}
                disabled={isSaving}
                loading={isSaving}
                className="h-9 px-4 text-sm font-medium bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
            >
                {!isSaving && <ArrowDownOnSquareIcon className="mr-2 h-4 w-4 opacity-70" />}
                {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-200 dark:border-white/10 flex flex-col bg-zinc-50/50 dark:bg-black/20 shrink-0">
            <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 px-2">Config</h4>
                    <nav className="space-y-1">
                        <SidebarItem 
                            icon={BriefcaseIcon} 
                            label="Job Details" 
                            active={activeTab === 'details'} 
                            onClick={() => setActiveTab('details')} 
                        />
                        <SidebarItem 
                            icon={ArrowPathIcon} 
                            label="Workflow" 
                            active={activeTab === 'workflow'} 
                            onClick={() => setActiveTab('workflow')} 
                        />
                         <SidebarItem 
                            icon={DocumentTextIcon} 
                            label="Application Form" 
                            active={activeTab === 'form'} 
                            onClick={() => setActiveTab('form')} 
                        />
                         <SidebarItem 
                            icon={SparklesIcon} 
                            label="Personalize" 
                            active={activeTab === 'personalize'} 
                            onClick={() => setActiveTab('personalize')} 
                        />
                    </nav>
                </div>
                
                <div className="group">
                    <div className="flex justify-between items-center mb-2 px-2">
                         <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Distribution</h4>
                        <button 
                            onClick={() => setIsChannelPickerOpen(true)}
                            className="bg-zinc-200 dark:bg-zinc-800 p-1 rounded hover:bg-indigo-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                            title="Create new posting"
                        >
                            <PlusIcon className="w-3 h-3" />
                        </button>
                    </div>
                    
                    <nav className="space-y-1">
                        {loadingPostings && postings.length === 0 && (
                            <div className="px-3 py-2 text-xs text-zinc-500 italic">Loading...</div>
                        )}
                        {!loadingPostings && postings.length === 0 && (
                             <div className="px-3 py-2 text-xs text-zinc-500 italic">No postings yet</div>
                        )}
                        {postings.map(p => {
                            const channelName = p.channel === 'direct' ? 'Direct' : CHANNELS.find(c => c.id === p.channel)?.name || p.channel;
                            const Icon = p.channel === 'direct' ? LinkIcon : 
                                       p.channel === 'tyomarkkinatori' ? BuildingOffice2Icon : 
                                       p.channel === 'duunitori' ? BriefcaseIcon : GlobeAltIcon;
                            
                            return (
                                <SidebarItem 
                                    key={p.id}
                                    icon={Icon} 
                                    label={p.contentOverrides?.title || `${jobForm.title} (${channelName})`} 
                                    active={activeTab === 'posting' && selectedPostingId === p.id} 
                                    onClick={() => {
                                        setActiveTab('posting');
                                        setSelectedPostingId(p.id);
                                    }} 
                                    badge={p.status}
                                />
                            );
                        })}

                        {pendingPostingChannel && (
                            <SidebarItem 
                                icon={
                                    pendingPostingChannel === 'direct' ? LinkIcon : 
                                    pendingPostingChannel === 'tyomarkkinatori' ? BuildingOffice2Icon : 
                                    pendingPostingChannel === 'duunitori' ? BriefcaseIcon : GlobeAltIcon
                                } 
                                label={`${jobForm.title} (${pendingPostingChannel === 'direct' ? 'Direct' : CHANNELS.find(c => c.id === pendingPostingChannel)?.name || pendingPostingChannel})`} 
                                active={false}
                                onClick={() => {}}
                                loading={true}
                                className="opacity-50 pointer-events-none"
                            />
                        )}
                    </nav>
                </div>

            </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/10">
            <div className="max-w-4xl mx-auto p-8">
                {activeTab === 'details' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <BriefcaseIcon className="w-5 h-5 text-blue-500" />
                                Basic Information
                            </h3>
                            <div className="relative group h-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-8 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                {jobForm.coverImage ? (
                                    <img src={jobForm.coverImage} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                        <GlobeAltIcon className="w-8 h-8 opacity-20 mb-1" />
                                        <span className="text-xs">No cover image</span>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4">
                                     <Button 
                                        plain 
                                        className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs"
                                        onClick={() => setShowPicker(!showPicker)}
                                     >
                                        {jobForm.coverImage ? 'Change cover' : 'Add cover'}
                                     </Button>
                                     {showPicker && (
                                        <CoverPicker
                                            currentCover={jobForm.coverImage}
                                            onSelect={(url) => { setJobForm({ ...jobForm, coverImage: url }); setShowPicker(false); }}
                                            onRemove={() => { setJobForm({ ...jobForm, coverImage: undefined }); setShowPicker(false); }}
                                            onClose={() => setShowPicker(false)}
                                        />
                                     )}
                                </div>
                            </div>

                            <Fieldset>
                                <Field>
                                    <Label>Job Title</Label>
                                    <Input 
                                        placeholder="e.g. Senior Product Designer"
                                        value={jobForm.title || ''} 
                                        onChange={e => setJobForm({...jobForm, title: e.target.value})} 
                                    />
                                </Field>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field>
                                        <Label>Location</Label>
                                        <Input 
                                            placeholder="e.g. Helsinki (Hybrid)"
                                            value={jobForm.location || ''} 
                                            onChange={e => setJobForm({...jobForm, location: e.target.value})} 
                                        />
                                    </Field>
                                    <Field>
                                        <Label>Employment Type</Label>
                                        <Select 
                                            value={jobForm.employmentType}
                                            onChange={e => setJobForm({...jobForm, employmentType: e.target.value as EmploymentType})}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Temporary">Temporary</option>
                                        </Select>
                                    </Field>
                                </div>
                                <Field>
                                    <Label>Description</Label>
                                    <Textarea 
                                        rows={12}
                                        placeholder="Describe the role..."
                                        value={jobForm.description || ''} 
                                        onChange={e => setJobForm({...jobForm, description: e.target.value})} 
                                    />
                                </Field>
                            </Fieldset>
                        </section>
                    </div>
                )}

                {activeTab === 'workflow' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <ArrowPathIcon className="w-5 h-5 text-purple-500" />
                                Recruitment Workflow
                            </h3>
                             <Fieldset>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field>
                                        <Label>Recruitment Pipeline</Label>
                                        <p className="text-xs text-zinc-500 mb-2">The hiring stages candidates will move through.</p>
                                        <Select 
                                            value={jobForm.pipelineId || ''}
                                            onChange={e => {
                                                const id = e.target.value;
                                                const pipeline = (resources['pipelines'] || []).find(p => p.id === id);
                                                setJobForm({
                                                    ...jobForm,
                                                    pipelineId: id || undefined,
                                                    pipelineVersionId: pipeline?.publishedVersionId
                                                });
                                            }}
                                        >
                                            <option value="">Select Pipeline</option>
                                            {(resources['pipelines'] || [])
                                                .filter(p => p.status === 'published')
                                                .map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </Select>
                                    </Field>

                                    {jobForm.pipelineId && (
                                        <Field className="animate-in fade-in slide-in-from-left-2 duration-300">
                                            <Label>Pipeline Version</Label>
                                            <p className="text-xs text-zinc-500 mb-2">Select a snapshot to use.</p>
                                            <Select 
                                                value={jobForm.pipelineVersionId || ''}
                                                disabled={loadingVersions}
                                                onChange={e => setJobForm({ ...jobForm, pipelineVersionId: e.target.value })}
                                            >
                                                <option value="">Latest Published</option>
                                                {pipelineVersions.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {new Date(v.publishedAt || v.createdAt).toLocaleDateString()} ({v.id})
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    )}
                                </div>
                             </Fieldset>
                        </section>

                        {jobForm.pipelineId && (
                             <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <PipelinePreview 
                                    orgId={orgId!} 
                                    pipelineId={jobForm.pipelineId} 
                                    versionId={jobForm.pipelineVersionId}
                                />
                             </section>
                        )}
                    </div>
                )}

                {activeTab === 'form' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                             <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-emerald-500" />
                                Application Form
                            </h3>
                             <Fieldset>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field>
                                        <Label>Application Form</Label>
                                        <p className="text-xs text-zinc-500 mb-2">The form candidates will fill out when applying.</p>
                                        <Select 
                                            value={jobForm.formId || ''}
                                            onChange={e => {
                                                const id = e.target.value;
                                                const form = (resources['forms'] || []).find(f => f.id === id);
                                                setJobForm({
                                                    ...jobForm,
                                                    formId: id || undefined,
                                                    formVersionId: form?.publishedVersionId
                                                });
                                            }}
                                        >
                                            <option value="">Select Form</option>
                                            {(resources['forms'] || [])
                                                .filter(f => f.status === 'published')
                                                .map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </Select>
                                    </Field>

                                    {jobForm.formId && (
                                        <Field className="animate-in fade-in slide-in-from-left-2 duration-300">
                                            <Label>Form Version</Label>
                                            <p className="text-xs text-zinc-500 mb-2">Select a snapshot to use.</p>
                                            <Select 
                                                value={jobForm.formVersionId || ''}
                                                disabled={loadingVersions}
                                                onChange={e => setJobForm({ ...jobForm, formVersionId: e.target.value })}
                                            >
                                                <option value="">Latest Published</option>
                                                {formVersions.map(v => (
                                                    <option key={v.id} value={v.id}>
                                                        {new Date(v.publishedAt || v.createdAt).toLocaleDateString()} ({v.id})
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    )}
                                </div>
                             </Fieldset>
                        </section>

                        {/* Application Card Configuration */}
                         {jobForm.formId && (
                             <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <IdentificationIcon className="w-5 h-5 text-indigo-500" />
                                    Application Card Display
                                </h3>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Configure how applications appear on the pipeline board.
                                    </p>
                                    
                                    {loadingFormSchema ? (
                                        <div className="py-4 text-center text-zinc-400 italic text-sm">Loading form fields...</div>
                                    ) : (
                                        <div className="space-y-6">
                                    <div className="pt-2">
                                        <span className="text-sm font-medium text-zinc-950 dark:text-white mb-3 block text-center md:text-left">Additional Card Fields</span>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                            {availableFormFields
                                                .map(field => {
                                                const isSelected = (jobForm.applicationCardConfig?.additionalFields || []).includes(field.id);
                                                        return (
                                                            <label key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                                                                <Checkbox 
                                                                    checked={isSelected}
                                                                    onChange={(checked) => {
                                                                        const current = jobForm.applicationCardConfig?.additionalFields || [];
                                                                        const newConfig = { ...jobForm.applicationCardConfig };
                                                                        
                                                                        if (checked) {
                                                                            if (current.length >= 3) {
                                                                                toast.info("You can only select up to 3 additional fields");
                                                                                return;
                                                                            }
                                                                            newConfig.additionalFields = [...current, field.id];
                                                                        } else {
                                                                             newConfig.additionalFields = current.filter(id => id !== field.id);
                                                                        }
                                                                        setJobForm({ ...jobForm, applicationCardConfig: newConfig });
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{field.label}</div>
                                                                    <div className="text-xs text-zinc-500">
                                                                        Type: {field.type}
                                                                        {field.required && <span className="ml-1 text-red-500">*</span>}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                    {availableFormFields.length === 0 && (
                                                         <div className="py-4 text-center text-zinc-400 italic text-sm">No fields found in this form</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="w-full md:w-auto flex flex-col items-center justify-start pt-8">
                                     <div className="sticky top-6 p-6 bg-zinc-50/50 dark:bg-black/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                         <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 block text-center">Preview</span>
                                         <ApplicationCardPreview 
                                            config={jobForm.applicationCardConfig}
                                            fields={availableFormFields} 
                                         />
                                     </div>
                                </div>
                            </div>
                         </section>
                         )}

                        {jobForm.formId && (
                             <section className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <FormPreviewBox 
                                    orgId={orgId!} 
                                    formId={jobForm.formId} 
                                    versionId={jobForm.formVersionId}
                                />
                             </section>
                        )}
                    </div>
                )}

                {activeTab === 'personalize' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-pink-500" />
                                Internal Personalization
                            </h3>
                            <p className="text-zinc-500 text-sm mb-8">
                                Customize how this job appears to your team in the internal recruiting board.
                                This does not affect the public job posting.
                            </p>

                            <div className="max-w-xl">
                                <ColorPickerCard
                                    label="Cover Style"
                                    initialColor={jobForm.layout?.cover || { id: 'blue', type: 'solid', value: '#64B5F6' }}
                                    onColorChange={(color) => setJobForm({ 
                                        ...jobForm, 
                                        layout: { 
                                            ...(jobForm.layout || { icon: { type: 'emoji', value: '📋' }} as any),
                                            cover: color 
                                        } 
                                    })}
                                    className="mb-8"
                                />

                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                        Job Icon
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsEmojiPickerOpen(true)}
                                            className="relative group h-16 w-16 flex items-center justify-center rounded-xl text-4xl shadow-sm transition-all hover:scale-105"
                                            style={{ 
                                                background: jobForm.layout?.cover?.value || '#64B5F6' 
                                            }}
                                        >
                                            <span className="transform group-hover:scale-110 transition-transform">
                                                {jobForm.layout?.icon?.value || '📋'}
                                            </span>
                                            <div className="absolute inset-0 rounded-xl ring-inset ring-2 ring-black/5 dark:ring-white/10 group-hover:ring-white/50 transition-all" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl backdrop-blur-[1px]">
                                                <span className="text-xs font-medium text-white bg-black/40 px-2 py-1 rounded-full border border-white/20">Change</span>
                                            </div>
                                        </button>
                                        <div className="text-sm text-zinc-500">
                                            This icon will be used in the job board and sidebar navigation.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
                
                <EmojiPicker
                    isOpen={isEmojiPickerOpen}
                    onClose={() => setIsEmojiPickerOpen(false)}
                    onEmojiSelect={(emoji) => setJobForm({ 
                        ...jobForm, 
                        layout: { 
                            ...(jobForm.layout || { cover: { id: 'blue', type: 'solid', value: '#64B5F6' }} as any),
                            icon: { type: 'emoji', value: emoji } 
                        } 
                    })}
                />

                {activeTab === 'posting' && selectedPosting && (
                    <PostingEditor 
                        orgId={orgId!} 
                        jobId={jobId!} 
                        posting={selectedPosting}
                        defaults={{
                            title: jobForm.title || '',
                            location: jobForm.location || '',
                            description: jobForm.description || ''
                        }}
                        onUpdate={loadPostings}
                    />
                )}
                {activeTab === 'posting' && !selectedPosting && (
                     <div className="text-center py-12 text-zinc-500">
                        <GlobeAltIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Select a posting to edit or create a new one.</p>
                     </div>
                )}

            </div>
        </main>
      </div>

      <SharingDialog 
          isOpen={isSharingOpen} 
          onClose={() => setIsSharingOpen(false)} 
          title="Sharing"
          description="Manage who can view and edit this job posting."
          visibility={(activeResource as any)?.visibility || 'private'}
          ownerIds={(activeResource as any)?.ownerIds || []}
          availableRoles={['viewer', 'editor', 'owner']}
          orgId={orgId!}
          moduleId="hire"
          resourceType="jobs"
          resourceId={jobId!}
          currentUserId={(activeResource as any)?.ownerIds?.[0]} // Fallback or use auth state if available
      />

      <ChannelPickerModal 
        isOpen={isChannelPickerOpen}
        onClose={() => setIsChannelPickerOpen(false)}
        onSelect={handleCreatePosting}
      />
    </div>
  );
}

function ChannelPickerModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (type: ChannelType) => void }) {
    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Choose Distribution Channel</DialogTitle>
            <DialogDescription>
                Select where you want to publish this job posting. Content requirements may vary by channel.
            </DialogDescription>
            <div className="mt-6 grid grid-cols-1 gap-4">
                <button 
                    onClick={() => onSelect('direct')}
                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30">
                        <LinkIcon className="w-6 h-6 text-zinc-500 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-white">Direct Link</div>
                        <div className="text-xs text-zinc-500">Get a public URL to share anywhere.</div>
                    </div>
                </button>
                {CHANNELS.map(channel => {
                    const Icon = channel.id === 'tyomarkkinatori' ? BuildingOffice2Icon : 
                               channel.id === 'duunitori' ? BriefcaseIcon : GlobeAltIcon;
                    return (
                        <button 
                            key={channel.id}
                            onClick={() => onSelect(channel.id as ChannelType)}
                            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 font-bold text-lg text-zinc-400 group-hover:text-indigo-600">
                                <Icon className="w-6 h-6 text-zinc-500 group-hover:text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-zinc-900 dark:text-white">{channel.name}</div>
                                <div className="text-xs text-zinc-500">Post to {channel.name} job board.</div>
                            </div>
                        </button>
                    );
                })}
            </div>
            <DialogActions>
                <Button plain onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

function SidebarItem({ icon: Icon, label, active, onClick, badge, loading, className }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: string, loading?: boolean, className?: string }) {
    return (
        <button 
            onClick={onClick}
            className={clsx(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all",
                active 
                    ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-zinc-200 dark:border-white/10" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5",
                className
            )}
        >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                <Icon className={clsx("w-4 h-4 shrink-0", active ? "text-blue-500" : "text-zinc-400")} />
                <span className="truncate">{label}</span>
            </div>
            {loading ? (
                <ArrowPathIcon className="w-3 h-3 animate-spin text-zinc-400 shrink-0" />
            ) : badge && badge !== 'not_configured' && (
                <div className={clsx(
                    "w-2 h-2 rounded-full shrink-0",
                    badge === 'published' ? 'bg-green-500' :
                    badge === 'draft' ? 'bg-yellow-500' :
                    badge === 'failed' ? 'bg-red-500' : 'bg-zinc-300'
                )} />
            )}
        </button>
    );
}


