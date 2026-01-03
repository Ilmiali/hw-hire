import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { PublicPosting } from '../../types/posting'; // You might need to export this if not already
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Fieldset, Field, Label } from '../../components/fieldset';
import { BriefcaseIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/20/solid';
import { toast } from 'react-toastify';
// Import a form renderer or build a simple one. 
// For now, we'll assume a simple dynamic form renderer based on schemaSnapshot.
// Since we don't have the full form renderer code in context, I'll build a simple map.

type FormData = Record<string, any>;

export default function PublicApplyPage() {
    const { publicPostingId } = useParams<{ publicPostingId: string }>();
    const [posting, setPosting] = useState<PublicPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    // Application Form State
    const [answers, setAnswers] = useState<FormData>({});
    const [applicantName, setApplicantName] = useState('');
    const [applicantEmail, setApplicantEmail] = useState('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!posting || !publicPostingId) return;

        setSubmitting(true);
        try {
            const db = getDatabaseService();
            
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
                
                applicantName,
                applicantEmail,
                answers,
                
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // We write to specific org collection structure
            // orgs/{orgId}/modules/{moduleId}/applications
            await db.addDocument(
                `orgs/${posting.orgId}/modules/hire/applications`, // Assuming 'hire' is the module for applications
                application
            );

            setSubmitted(true);
            toast.success("Application submitted successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-64 bg-zinc-200 rounded"></div>
                    <div className="h-4 w-48 bg-zinc-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!posting) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500">
                Job posting not found or unavailable.
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 max-w-md text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Application Received!</h2>
                    <p className="text-zinc-600 mb-6">
                        Thanks for applying to <strong>{posting.jobPublic.title}</strong>. We've received your details and will be in touch soon.
                    </p>
                    <Button href="/" outline>Back to Home</Button>
                </div>
            </div>
        );
    }

    // Render Form Fields based on schemaSnapshot
    // This is a simplified renderer. In a real app, you'd reuse the FormRenderer component used in preview.
    const renderFormFields = () => {
        const schema = posting.form.schemaSnapshot;
        if (!schema || !schema.pages) return null;

        return (
            <div className="space-y-8">
                {schema.pages.map((page: any) => (
                    <div key={page.id} className="space-y-6">
                        {page.sections?.map((section: any) => (
                            <div key={section.id} className="space-y-4">
                                <h4 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2 mb-4">{section.title}</h4>
                                <div className="space-y-4">
                                    {section.fields?.map((field: any) => (
                                        <Field key={field.id}>
                                            <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                                            {field.type === 'textarea' ? (
                                                <Textarea 
                                                    value={answers[field.id] || ''} 
                                                    onChange={e => setAnswers({ ...answers, [field.id]: e.target.value })}
                                                    required={field.required}
                                                />
                                            ) : (
                                                <Input 
                                                    type={field.type === 'email' ? 'email' : 'text'}
                                                    value={answers[field.id] || ''} 
                                                    onChange={e => setAnswers({ ...answers, [field.id]: e.target.value })}
                                                    required={field.required}
                                                />
                                            )}
                                        </Field>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="bg-white rounded-t-2xl border border-zinc-200 p-8 pb-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4">{posting.jobPublic.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                            <MapPinIcon className="w-4 h-4 text-zinc-400" />
                            {posting.jobPublic.location}
                        </span>
                        <span className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                            <BriefcaseIcon className="w-4 h-4 text-zinc-400" />
                            {posting.jobPublic.employmentType}
                        </span>
                    </div>
                    
                    <div className="mt-8 prose prose-zinc max-w-none">
                         <h3 className="text-lg font-semibold text-zinc-900">About the Role</h3>
                         <p className="whitespace-pre-wrap text-zinc-600 leading-relaxed">{posting.jobPublic.description}</p>
                    </div>
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl border-x border-b border-zinc-200 p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6">Apply for this position</h2>
                    
                    <Fieldset className="space-y-6">
                        {/* Standard Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field>
                                <Label>Full Name <span className="text-red-500">*</span></Label>
                                <Input 
                                    value={applicantName} 
                                    onChange={e => setApplicantName(e.target.value)} 
                                    required 
                                    placeholder="Jane Doe"
                                />
                            </Field>
                            <Field>
                                <Label>Email Address <span className="text-red-500">*</span></Label>
                                <Input 
                                    type="email"
                                    value={applicantEmail} 
                                    onChange={e => setApplicantEmail(e.target.value)} 
                                    required 
                                    placeholder="jane@example.com"
                                />
                            </Field>
                        </div>
                        
                        {/* Dynamic Fields from Schema */}
                        {renderFormFields()}

                    </Fieldset>

                    <div className="mt-10 pt-6 border-t border-zinc-100 flex justify-end">
                        <Button type="submit" color="indigo" loading={submitting} className="w-full sm:w-auto min-w-[140px]">
                            Submit Application
                        </Button>
                    </div>

                </form>

                <div className="mt-8 text-center text-xs text-zinc-400">
                    <p>Powered by HW Hire</p>
                </div>
            </div>
        </div>
    );
}
