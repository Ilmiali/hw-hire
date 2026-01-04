import React, { useState, useEffect, useMemo } from 'react';
import { FormField, FormSchema } from '../../../types/form-builder';
import { PageHeader } from './PageHeader';
import { evaluateRules } from '../../../utils/evaluateRules';
import { buildZodSchema } from '../../../utils/validation';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { ApplyStep } from '../../Public/Apply/ApplyStep';
import { ApplyProgress } from '../../Public/Apply/ApplyProgress';
import { ApplyFooterActions } from '../../Public/Apply/ApplyFooterActions';

interface FormRendererProps {
    schema: FormSchema;
    onSuccess?: (values: any) => void;
    readOnly?: boolean;
    submitting?: boolean;
    embedded?: boolean;
    // Controlled props
    values?: Record<string, any>;
    onValuesChange?: (values: Record<string, any>) => void;
    pageIndex?: number;
    onPageChange?: (pageIndex: number) => void;
}

export const FormRenderer = ({ 
    schema, 
    onSuccess, 
    readOnly = false, 
    submitting = false, 
    embedded = false,
    values,
    onValuesChange,
    pageIndex,
    onPageChange
}: FormRendererProps) => {
    const [internalPageIndex, setInternalPageIndex] = useState(0);
    const [internalFormValues, setInternalFormValues] = useState<Record<string, any>>({});
    
    // Determine controlled vs uncontrolled
    const isControlledValues = values !== undefined;
    const isControlledPage = pageIndex !== undefined;

    const formValues = isControlledValues ? values! : internalFormValues;
    const currentPageIndex = isControlledPage ? pageIndex! : internalPageIndex;
    const [errors, setErrors] = useState<Record<string, string>>({});

    const currentPage = schema.pages[currentPageIndex] || schema.pages[0]; // Safety fallback
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === schema.pages.length - 1;

    // Helper to flatten fields for evaluation
    const allFields = useMemo(() => {
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

    // Evaluate rules
    const { visibleFieldIds, requiredFieldIds } = useMemo(() => {
        return evaluateRules(schema.rules || [], formValues, allFields);
    }, [schema.rules, formValues, allFields]);

    const zodSchema = useMemo(() => {
        return buildZodSchema(allFields, requiredFieldIds, visibleFieldIds);
    }, [allFields, requiredFieldIds, visibleFieldIds]);

    // Effect to clear values of hidden fields
    useEffect(() => {
        // We only do this auto-cleanup if uncontrolled, or if the parent handles it. 
        // For now, let's only do it if we are uncontrolled to avoid infinite loops with parent state
        if (isControlledValues) return;

        setInternalFormValues(prev => {
            const next = { ...prev };
            let hasChanges = false;
            
            allFields.forEach(field => {
                if (!visibleFieldIds.has(field.id) && next[field.id] !== undefined && next[field.id] !== '') {
                    delete next[field.id];
                    hasChanges = true;
                }
            });

            return hasChanges ? next : prev;
        });
    }, [visibleFieldIds, allFields, isControlledValues]);

    // Helper to handle input changes
    const handleChange = (fieldId: string, value: any) => {
        if (readOnly) return;
        
        const nextValues = { ...formValues, [fieldId]: value };
        
        if (isControlledValues) {
            onValuesChange?.(nextValues);
        } else {
            setInternalFormValues(nextValues);
        }

        try {
            const fieldSchema = zodSchema.shape[fieldId];
            if (fieldSchema) {
                fieldSchema.parse(value);
                 setErrors(prev => {
                    const next = { ...prev };
                    delete next[fieldId];
                    return next;
                });
            }
        } catch (e) {
                 if (e instanceof z.ZodError) {
                     setErrors(prev => ({
                        ...prev,
                        [fieldId]: (e as any).issues?.[0]?.message || (e as any).errors?.[0]?.message || 'Invalid value'
                    }));
                 }
        }
    };

    const validatePage = (pageIndex: number): boolean => {
         const page = schema.pages[pageIndex];
         const pageFields = getAllFields([page]);
         let isValid = true;
         const newErrors: Record<string, string> = {};

         pageFields.forEach(field => {
             if (!visibleFieldIds.has(field.id)) return;
             
             try {
                 const fieldSchema = zodSchema.shape[field.id];
                 if (fieldSchema) {
                     fieldSchema.parse(formValues[field.id]);
                 }
             } catch (e) {
                 if (e instanceof z.ZodError) {
                     newErrors[field.id] = (e as any).issues?.[0]?.message || (e as any).errors?.[0]?.message || 'Invalid value';
                     isValid = false;
                 }
             }
         });
         
         if (!isValid) {
             setErrors(prev => ({ ...prev, ...newErrors }));
             return false;
         }
         return true;
    };

    const handleNext = () => {
        if (!readOnly && !validatePage(currentPageIndex)) {
            toast.error('Please fix validation errors before proceeding.');
            return;
        }

        if (!isLastPage) {
            const nextIndex = currentPageIndex + 1;
            if (isControlledPage) {
                onPageChange?.(nextIndex);
            } else {
                setInternalPageIndex(nextIndex);
            }
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (!isFirstPage) {
            const prevIndex = currentPageIndex - 1;
            if (isControlledPage) {
                onPageChange?.(prevIndex);
            } else {
                setInternalPageIndex(prevIndex);
            }
            window.scrollTo(0, 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Check if we're in a textarea, if so let it handle itself
            if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
            
            e.preventDefault();
            if (isLastPage) {
                handleSubmit();
            } else {
                handleNext();
            }
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (readOnly || submitting) return;
        
        // Final verification that we are on the last page
        if (!isLastPage) {
            handleNext();
            return;
        }

        const result = zodSchema.safeParse(formValues);
        
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            const errorIssues = (result.error as any).issues || (result.error as any).errors || [];
            errorIssues.forEach((err: any) => {
                if (err.path && err.path[0]) {
                     newErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(newErrors);
            toast.error('Please fix validation errors.');
            return;
        }

        if (onSuccess) onSuccess(formValues);
    };

    const getAllFields = (pages: any[]): FormField[] => {
        const fields: FormField[] = [];
        pages.forEach(page => {
            page.sections.forEach((section: any) => {
                section.rows.forEach((row: any) => {
                    row.fields.forEach((field: any) => {
                        fields.push(field);
                    });
                });
            });
        });
        return fields;
    };

    const content = (
        <div className="p-8 md:p-12">
            <div className="mb-14 px-2">
                <ApplyProgress 
                    currentStep={currentPageIndex} 
                    totalSteps={schema.pages.length} 
                />
            </div>

            <div onKeyDown={handleKeyDown}>
                <ApplyStep 
                    page={currentPage}
                    values={formValues}
                    onChange={handleChange}
                    errors={errors}
                    visibleFieldIds={visibleFieldIds}
                    requiredFieldIds={requiredFieldIds}
                    disabled={readOnly}
                    hideHeader={true}
                />

                <ApplyFooterActions 
                    onNext={isLastPage ? () => handleSubmit() : handleNext}
                    onBack={handlePrev}
                    isFirstStep={isFirstPage}
                    isLastStep={isLastPage}
                    submitting={submitting}
                    // For editor reuse, we might not have these saving states, so they're optional props on ApplyFooterActions
                    isSaving={false} 
                    lastSavedAt={null}
                />
            </div>
        </div>
    );
    
    if (embedded) {
        return content;
    }

    return (
        <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden mb-20 h-fit flex flex-col mx-auto">
            <PageHeader 
                title={currentPage.title}
                description={currentPage.description}
                cover={currentPage.cover}
                readOnly={true}
            />
            {content}
        </div>
    );
};
