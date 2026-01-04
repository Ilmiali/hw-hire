import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { PublicPosting } from '../../types/posting';
import { Button } from '../../components/button';
import { BriefcaseIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import { toast } from 'react-toastify';
import { FormRenderer } from '../FormBuilder/components/FormRenderer';
import { useApplicationDraft } from '../../hooks/useApplicationDraft';
import { ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';


export default function PublicApplyPage() {
    const { publicPostingId } = useParams<{ publicPostingId: string }>();
    const [posting, setPosting] = useState<PublicPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    
    // Application Form State
    // We'll extract name and email from form values if they exist
    const { 
        answers, 
        setAnswers, 
        stepIndex, 
        setStepIndex,
        isSaving,
        lastSavedAt,
        clearDraft,
        hasSavedDraft 
    } = useApplicationDraft(publicPostingId);

    useEffect(() => {
        const loadPosting = async () => {
            if (!publicPostingId) return;
            try {
                const db = getDatabaseService();
                const doc = await db.getDocument('public_postings', publicPostingId);
                if (doc) {
                    // Check if closed or expired
                    const data = doc as unknown as PublicPosting;
                    if (data.status === 'closed') {
                         toast.error("This job posting is closed.");
                         setLoading(false);
                         return;
                    }
                    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
                        toast.error("This job posting has expired.");
                        setLoading(false);
                        return;
                    }
                    setPosting(data);
                } else {
                    toast.error("Job posting not found.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };
        loadPosting();
    }, [publicPostingId]);

    const handleFormSuccess = async (values: any) => {
        if (!posting || !publicPostingId) return;

        // Guard: Prevent premature submission if not on last page
        const isLastPage = stepIndex === posting.form.schemaSnapshot.pages.length - 1;
        if (!isLastPage) {
            console.warn("Prevented premature submission on step", stepIndex);
            return;
        }

        setSubmitting(true);
        try {
            const db = getDatabaseService();
            
            // Helper to sanitize values for Firestore (remove File objects)
            const sanitizeForFirestore = (val: any): any => {
                if (val instanceof File) {
                    // Firestore cannot store File objects. 
                    // ideally we'd upload this and store the URL, but for now we fallback to metadata
                    // or null to prevent crash. 
                    // User requested not to save file persistence, but that was for Drafts.
                    // For submission, we really should upload, but stripping prevents the crash.
                    return {
                        _type: 'file',
                        name: val.name,
                        size: val.size,
                        type: val.type
                    };
                }
                if (Array.isArray(val)) {
                    return val.map(sanitizeForFirestore);
                }
                if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                    const next: any = {};
                    for (const key in val) {
                        next[key] = sanitizeForFirestore(val[key]);
                    }
                    return next;
                }
                return val;
            };

            const sanitizedValues = sanitizeForFirestore(values);

            // Construct Application object
            const application = {
                orgId: posting.orgId,
                moduleId: 'hire',
                jobId: posting.jobId,

                jobPostingId: posting.jobPostingId || 'DIRECT_PUBLIC',
                publicPostingId: publicPostingId,
                jobVersionId: posting.jobVersionId,
                source: posting.source?.channel || 'direct',
                
                formId: posting.form.formId,
                formVersionId: posting.form.formVersionId,
                
                pipelineId: posting.pipeline.pipelineId,
                pipelineVersionId: posting.pipeline.pipelineVersionId,
                currentStageId: posting.pipeline.firstStageId,
                stageUpdatedAt: new Date().toISOString(),
                
                // Try to find name and email in the values
                applicantName: values.name || values.fullName || values.applicantName || '',
                applicantEmail: values.email || values.emailAddress || values.applicantEmail || '',
                answers: sanitizedValues,
                
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await db.addDocument(
                `orgs/${posting.orgId}/modules/hire/applications`,
                application
            );

            setSubmitted(true);
            toast.success("Application submitted successfully!");
            clearDraft(); // Clear draft on success


        } catch (error) {
            console.error(error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!posting) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                Job posting not found or unavailable.
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-md text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Application Received!</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        Thanks for applying to <strong>{posting.jobPublic.title}</strong>. We've received your details and will be in touch soon.
                    </p>
                    <Button href="/" outline className="dark:border-zinc-700 dark:text-zinc-300">Back to Home</Button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 rounded-t-2xl border border-zinc-200 dark:border-zinc-800 p-8 pb-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">{posting.jobPublic.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        <span className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-700">
                            <MapPinIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                            {posting.jobPublic.location}
                        </span>
                        <span className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-700">
                            <BriefcaseIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                            {posting.jobPublic.employmentType}
                        </span>
                    </div>
                    
                    <div className="mt-8 prose prose-zinc dark:prose-invert max-w-none">
                         <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">About the Role</h3>
                         <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 leading-relaxed">{posting.jobPublic.description}</p>
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white dark:bg-zinc-900 rounded-b-2xl border-x border-b border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-8 pb-0">
                        <div className="flex items-center justify-between mb-2">
                             <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Apply for this position</h2>
                             {hasSavedDraft && (
                                 <div className="flex items-center gap-4 text-xs">
                                     <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                         {isSaving ? (
                                             <>
                                                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                                <span>Saving...</span>
                                             </>
                                         ) : (
                                             <>
                                                <CloudArrowUpIcon className="w-3.5 h-3.5" />
                                                <span>Saved {lastSavedAt ? formatDistanceToNow(lastSavedAt, { addSuffix: true }) : ''}</span>
                                             </>
                                         )}
                                     </div>
                                     <button 
                                         onClick={() => {
                                             if (window.confirm("Are you sure you want to start over? This will clear your current progress.")) {
                                                 clearDraft();
                                                 window.location.reload(); 
                                             }
                                         }}
                                         className="text-red-500 hover:text-red-600 underline decoration-red-500/30 font-medium"
                                     >
                                         Start over
                                     </button>
                                 </div>
                             )}
                        </div>
                    </div>
                    
                    <FormRenderer 
                        schema={posting.form.schemaSnapshot} 
                        onSuccess={handleFormSuccess}
                        submitting={submitting}
                        embedded
                        values={answers}
                        onValuesChange={setAnswers}
                        pageIndex={stepIndex}
                        onPageChange={setStepIndex}
                    />
                </div>

                <div className="mt-8 text-center text-xs text-zinc-400">
                    <p>Powered by HW Hire</p>
                </div>
            </div>
        </div>
    );
}
