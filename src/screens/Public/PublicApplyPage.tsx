import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabaseService } from '../../services/databaseService';
import { PublicPosting } from '../../types/posting';
import { toast } from 'react-toastify';
import { useApplicationDraft } from '../../hooks/useApplicationDraft';
import { buildZodSchema } from '../../utils/validation';
import { evaluateRules } from '../../utils/evaluateRules';
import { FormField } from '../../types/form-builder';
import { z } from 'zod';

import { ApplyLayout } from './Apply/ApplyLayout';
import { ApplyProgress } from './Apply/ApplyProgress';
import { ApplyStep } from './Apply/ApplyStep';
import { ApplyFooterActions } from './Apply/ApplyFooterActions';
import { SuccessScreen } from './Apply/SuccessScreen';

export default function PublicApplyPage() {
    const { publicPostingId } = useParams<{ publicPostingId: string }>();
    const [posting, setPosting] = useState<PublicPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Application Form State
    const { 
        answers, 
        setAnswers, 
        stepIndex, 
        setStepIndex,
        isSaving,
        lastSavedAt,
        clearDraft
    } = useApplicationDraft(publicPostingId);

    // Initial Load
    useEffect(() => {
        const loadPosting = async () => {
            if (!publicPostingId) return;
            try {
                const db = getDatabaseService();
                const doc = await db.getDocument('public_postings', publicPostingId);
                if (doc) {
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

    // Validation Logic
    const schema = posting?.form.schemaSnapshot;
    
    const allFields = useMemo(() => {
        if (!schema) return [];
        const fields: FormField[] = [];
        schema.pages.forEach(page => {
            page.sections.forEach(section => {
                section.rows.forEach(row => {
                    row.fields.forEach(field => {
                        fields.push(field);
                    });
                });
            });
        });
        return fields;
    }, [schema]);

    const { visibleFieldIds, requiredFieldIds } = useMemo(() => {
        if (!schema) return { visibleFieldIds: new Set<string>(), requiredFieldIds: new Set<string>() };
        return evaluateRules(schema.rules || [], answers, allFields);
    }, [schema, answers, allFields]);

    const zodSchema = useMemo(() => {
        return buildZodSchema(allFields, requiredFieldIds, visibleFieldIds);
    }, [allFields, requiredFieldIds, visibleFieldIds]);

    const validateStep = (targetIndex: number) => {
        if (!schema) return false;
        
        // Define fields strictly on the current page
        const currentPage = schema.pages[targetIndex];
        const pageFieldIds = new Set<string>();
        currentPage.sections.forEach(s => s.rows.forEach(r => r.fields.forEach(f => pageFieldIds.add(f.id))));

        let isValid = true;
        const newErrors: Record<string, string> = {};

        // Only validate fields on this page that are visible
        pageFieldIds.forEach(fieldId => {
            if (!visibleFieldIds.has(fieldId)) return;
            
            try {
                const fieldSchema = zodSchema.shape[fieldId];
                if (fieldSchema) {
                    fieldSchema.parse(answers[fieldId]);
                }
            } catch (e) {
                if (e instanceof z.ZodError) {
                    newErrors[fieldId] = (e as any).issues?.[0]?.message || (e as any).errors?.[0]?.message || 'Invalid value';
                    isValid = false;
                }
            }
        });

        if (!isValid) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            
            // Scroll to first error
            const firstErrorId = Object.keys(newErrors)[0];
            // Simple heuristic to scroll to top if error exists
            if (firstErrorId) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Clear errors for fields on this page
            setErrors(prev => {
                const next = { ...prev };
                pageFieldIds.forEach(id => delete next[id]);
                return next;
            });
        }

        return isValid;
    };


    const handleNext = () => {
        if (!validateStep(stepIndex)) {
            toast.error('Please fix the errors before proceeding.');
            return;
        }

        if (schema && stepIndex < schema.pages.length - 1) {
            setStepIndex(stepIndex + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleChange = (fieldId: string, value: any) => {
        setAnswers({ ...answers, [fieldId]: value });
        
        // Clear error immediately on change
        if (errors[fieldId]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[fieldId];
                return next;
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Check if we're in a textarea, if so let it handle itself
            if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
            
            e.preventDefault();
            const isLast = stepIndex === schema!.pages.length - 1;
            if (isLast) {
                handleFormSuccess();
            } else {
                handleNext();
            }
        }
    };

    const handleFormSuccess = async () => {
        // Final full validation
        if (!validateStep(stepIndex)) return;
        if (!posting || !publicPostingId || submitting) return;

        setSubmitting(true);
        try {
            const db = getDatabaseService();
            
            // Sanitize values (reuse logic or similar)
            const sanitizeForFirestore = (val: any): any => {
                if (val instanceof File) {
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

            const sanitizedValues = sanitizeForFirestore(answers);

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
                
                // Heuristic for name/email
                applicantName: answers.name || answers.fullName || answers.applicantName || 'Applicant',
                applicantEmail: answers.email || answers.emailAddress || answers.applicantEmail || '',
                answers: sanitizedValues,
                
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await db.addDocument(
                `orgs/${posting.orgId}/modules/hire/applications`,
                application
            );

            setSubmitted(true);
            clearDraft();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-64 bg-zinc-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!posting || !schema) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center text-zinc-500">
                Job posting not found.
            </div>
        );
    }

    if (submitted) {
        return <SuccessScreen jobTitle={posting.jobPublic.title} />;
    }

    const currentPage = schema.pages[stepIndex];
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === schema.pages.length - 1;

    return (
        <ApplyLayout>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    {posting.orgName && (
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                            {posting.orgName}
                        </div>
                    )}
                </div>
                
                {/* Job Header */}
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
                    {posting.jobPublic.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>{posting.jobPublic.location}</span>
                    <span>&bull;</span>
                    <span>{posting.jobPublic.employmentType}</span>
                </div>
            </div>

            <div 
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6 sm:p-8 md:p-10 mb-8 transition-colors"
                onKeyDown={handleKeyDown}
            >
                <div className="mb-8">
                    <ApplyProgress currentStep={stepIndex} totalSteps={schema.pages.length} />
                </div>
                
                <ApplyStep 
                    page={currentPage}
                    values={answers}
                    onChange={handleChange}
                    errors={errors}
                    visibleFieldIds={visibleFieldIds}
                    requiredFieldIds={requiredFieldIds}
                />

                <ApplyFooterActions 
                    onNext={isLastStep ? handleFormSuccess : handleNext}
                    onBack={handleBack}
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    submitting={submitting}
                    isSaving={isSaving}
                    lastSavedAt={lastSavedAt}
                />
            </div>
        </ApplyLayout>
    );
}
