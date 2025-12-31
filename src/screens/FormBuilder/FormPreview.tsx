
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { FormField, FormPage } from '../../types/form-builder';
import { PageHeader } from './components/PageHeader';
import { evaluateRules } from '../../utils/evaluateRules';
import { buildZodSchema } from '../../utils/validation';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFormById, fetchFormDraft } from '../../store/slices/formsSlice';

// UI Components
import { Input } from '../../components/input';
import { Textarea } from '../../components/textarea';
import { Select } from '../../components/select';
import { Radio, RadioField, RadioGroup } from '../../components/radio';
import { Checkbox, CheckboxField, CheckboxGroup } from '../../components/checkbox';
import { Label, Field } from '../../components/fieldset';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { Button } from '../../components/button';
import { XMarkIcon } from '@heroicons/react/20/solid';

export const FormPreview = () => {
    const { orgId, formId } = useParams<{ orgId: string; formId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const { currentForm, currentVersion } = useSelector((state: RootState) => state.forms);
    const form = useFormBuilderStore(state => state.form);
    const setForm = useFormBuilderStore(state => state.setForm);

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load form data if navigation was direct
    useEffect(() => {
        if (orgId && formId && (!currentForm || currentForm.id !== formId)) {
            dispatch(fetchFormById({ orgId, formId }));
        }
    }, [dispatch, orgId, formId, currentForm]);

    useEffect(() => {
        if (orgId && formId) {
             // If we have a published version, we could prefer that, but for "Preview" 
             // usually users want to see the latest draft if they are editing.
             // However, strictly speaking "Preview this form" might mean different things.
             // Given the bug report "previewing forms is not working", and likely they are in builder,
             // let's try to fetch the most recent version first.
            dispatch(fetchFormDraft({ orgId, formId }));
        }
    }, [dispatch, orgId, formId]);

    useEffect(() => {
        if (currentVersion?.data && form.id !== formId) {
            setForm(currentVersion.data);
        }
    }, [currentVersion, setForm, formId, form.id]);

    const currentPage = form.pages[currentPageIndex];
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === form.pages.length - 1;

    // Helper to flatten fields for evaluation
    const allFields = useMemo(() => {
        const fields: FormField[] = [];
        form.pages.forEach(page => {
            page.sections.forEach(section => {
                section.rows.forEach(row => {
                    row.fields.forEach(field => {
                        fields.push(field);
                    });
                });
            });
        });
        return fields;
    }, [form]);

    // Evaluate rules
    const { visibleFieldIds, requiredFieldIds } = useMemo(() => {
        return evaluateRules(form.rules || [], formValues, allFields);
    }, [form.rules, formValues, allFields]);

    const schema = useMemo(() => {
        return buildZodSchema(allFields, requiredFieldIds, visibleFieldIds);
    }, [allFields, requiredFieldIds, visibleFieldIds]);

    // Effect to clear values of hidden fields
    useEffect(() => {
        setFormValues(prev => {
            const next = { ...prev };
            let hasChanges = false;
            
            // Find fields that have a value but are not visible
            allFields.forEach(field => {
                if (!visibleFieldIds.has(field.id) && next[field.id] !== undefined && next[field.id] !== '') {
                    // Only clear if it has a value (to avoid infinite loops with empty checks if any)
                    // But standard logic: if hidden, value should be cleared.
                    // However, we must be careful. If evaluating rules depends on this value, clearing it might change visibility?
                    // "When a field becomes hidden, clear its value"
                    // If A controls B. A=True -> Show B.
                    // If A=False -> Hide B. Clear B.
                    // B's value usually doesn't affect A (unless circular dependency).
                    // If B controls C, and B is hidden (and cleared), then C might change visibility.
                    // This effect handles one pass. React will re-render and re-evaluate if needed.
                    
                    delete next[field.id];
                    hasChanges = true;
                }
            });

            return hasChanges ? next : prev;
        });
    }, [visibleFieldIds, allFields]);


    // Helper to handle input changes
    const handleChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));

        // Validate on change if touched or always? 
        // Let's validate.
        try {
            const fieldSchema = schema.shape[fieldId];
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
         const page = form.pages[pageIndex];
         const pageFields = getAllFields([page]);
         let isValid = true;
         const newErrors: Record<string, string> = {};

         pageFields.forEach(field => {
             // Only validate if visible
             if (!visibleFieldIds.has(field.id)) return;
             
             try {
                 const fieldSchema = schema.shape[field.id];
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
             // mark all as touched so errors show?
             // Render loop uses 'errors[field.id]' so that's enough.
             return false;
         }
         return true;
    };

    const handleNext = () => {
        // Validate required visible fields on this page?
        // Basic check for now
        if (!validatePage(currentPageIndex)) {
            // Scroll to error?
            alert('Please fix validation errors before proceeding.');
            return;
        }

        if (!isLastPage) {
            setCurrentPageIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (!isFirstPage) {
            setCurrentPageIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all visible required fields
        // Validate everything
        const result = schema.safeParse(formValues);
        
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            // Explicit cast to avoid ts issues with loaded zod version
            const errorIssues = (result.error as any).issues || (result.error as any).errors || [];
            errorIssues.forEach((err: any) => {
                // path[0] should be fieldId
                if (err.path && err.path[0]) {
                     newErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(newErrors);
            alert('Please fix validation errors.');
            return;
        }

        console.log('Form Submission:', formValues);
        alert('Form submitted! value logged to console.');
    };

    // Helper to render field based on type
    const renderFieldItem = (field: FormField, value: any, onChange: (val: any) => void) => {
        const isRequired = requiredFieldIds.has(field.id) || field.required; // Fallback to static required for nested

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                return (
                    <Input 
                        type={field.type} 
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={isRequired}
                    />
                );
            case 'textarea':
                return (
                    <Textarea 
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={isRequired}
                    />
                );
            case 'select':
                return (
                    <Select 
                        value={value || ''} 
                        onChange={(e) => onChange(e.target.value)}
                        required={isRequired}
                    >
                        <option value="" disabled>Select an option</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                );
            case 'radio':
                return (
                    <RadioGroup 
                        value={value || ''} 
                        onChange={(val) => onChange(val)}
                    >
                        {field.options?.map(opt => (
                            <RadioField key={opt.value}>
                                <Radio value={opt.value} />
                                <Label>{opt.label}</Label>
                            </RadioField>
                        ))}
                    </RadioGroup>
                );
            case 'checkbox':
                return (
                    <CheckboxGroup>
                        {field.options?.map(opt => {
                            const isChecked = Array.isArray(value) ? value.includes(opt.value) : value === opt.value;
                             return (
                                <CheckboxField key={opt.value}>
                                    <Checkbox 
                                        value={opt.value} 
                                        checked={isChecked}
                                        onChange={(checked) => {
                                            const currentArr = Array.isArray(value) ? [...value] : [];
                                            if (checked) {
                                                currentArr.push(opt.value);
                                            } else {
                                                const idx = currentArr.indexOf(opt.value);
                                                if (idx > -1) currentArr.splice(idx, 1);
                                            }
                                            onChange(currentArr);
                                        }}
                                    />
                                    <Label>{opt.label}</Label>
                                </CheckboxField>
                                    );
                        })}
                    </CheckboxGroup>
                );
            case 'file':
                const files = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-3">
                        <Input 
                            type="file" 
                            multiple={field.multiple}
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files || []);
                                if (field.multiple) {
                                    onChange([...files, ...newFiles]);
                                } else {
                                    onChange(newFiles);
                                }
                                // Reset input so same files can be selected again
                                e.target.value = '';
                            }}
                            required={isRequired && files.length === 0}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 dark:file:bg-blue-900/40 dark:file:text-blue-300 transition-colors"
                        />
                        {files.length > 0 && (
                            <ul className="space-y-2">
                                {files.map((file: File, idx: number) => (
                                    <li key={`${file.name}-${idx}`} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg border border-white/5 animate-in fade-in slide-in-from-left-2 duration-200">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="text-xs text-zinc-400 shrink-0">📄</span>
                                            <span className="text-sm text-zinc-300 truncate">{file.name}</span>
                                            <span className="text-[10px] text-zinc-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const newFiles = [...files];
                                                newFiles.splice(idx, 1);
                                                onChange(newFiles.length > 0 ? newFiles : undefined);
                                            }}
                                            className="p-1 hover:bg-white/10 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                                            title="Remove file"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            case 'paragraph':
                return (
                    <Text className="text-zinc-600 dark:text-zinc-300">
                        {field.content || field.placeholder || 'Enter your text here...'}
                    </Text>
                );
            case 'divider':
                return <hr className="my-4 border-zinc-200 dark:border-white/10" />;
            case 'spacer':
                return <div className="h-8" />;
            case 'image':
                return (
                    <div className="flex justify-center">
                        {field.imageUrl && (
                            <img 
                                src={field.imageUrl} 
                                alt={field.altText || ''} 
                                style={{ 
                                    width: field.width || '100%', 
                                    height: field.height || 'auto',
                                    objectFit: field.objectFit || 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                        )}
                    </div>
                );
            case 'repeat':
                const items = (Array.isArray(value) ? value : []) as Record<string, any>[];
                return (
                    <div className="space-y-4">
                        {items.map((itemValue, index) => (
                            <div key={index} className="relative p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div className="absolute right-4 top-4">
                                     <button 
                                        type="button"
                                        onClick={() => {
                                            const newItems = [...items];
                                            newItems.splice(index, 1);
                                            onChange(newItems);
                                        }}
                                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                        title="Remove item"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-4">
                                     {field.fields?.map(child => (
                                         <div key={child.id} className="flex flex-col gap-1.5">
                                             {!['paragraph', 'divider', 'spacer', 'image'].includes(child.type) && (
                                                <Label className="text-zinc-700 dark:text-zinc-300">
                                                    {child.label} {child.required && <span className="text-red-500">*</span>}
                                                </Label>
                                             )}
                                             {renderFieldItem(child, itemValue[child.id], (childVal) => {
                                                 const newItems = [...items];
                                                 newItems[index] = { ...newItems[index], [child.id]: childVal };
                                                 onChange(newItems);
                                             })}
                                         </div>
                                     ))}
                                </div>
                            </div>
                        ))}
                        <Button 
                            type="button" 
                            onClick={() => onChange([...items, {}])}
                            outline
                            className="w-full border-dashed"
                        >
                            + Add {field.label || 'Item'}
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderField = (field: FormField) => {
        // Skip if hidden
        if (!visibleFieldIds.has(field.id)) return null;

        return renderFieldItem(field, formValues[field.id], (val) => handleChange(field.id, val));
    };

    // Helper just for current page validation
    const getAllFields = (pages: FormPage[]): FormField[] => {
        const fields: FormField[] = [];
        pages.forEach(page => {
            page.sections.forEach(section => {
                section.rows.forEach(row => {
                    row.fields.forEach(field => {
                        fields.push(field);
                    });
                });
            });
        });
        return fields;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
            {/* Preview Banner */}
            <div className="bg-blue-50 dark:bg-blue-600/10 border-b border-blue-200 dark:border-blue-500/20 px-6 py-3 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <span className="bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-500/30">Preview Mode</span>
                    <Text className="text-sm text-blue-700 dark:text-blue-200">This is how your form will look to users.</Text>
                </div>
                <Button onClick={() => navigate(`/orgs/${orgId}/forms/${formId}`)} outline>
                    Back to Editor
                </Button>
            </div>

            <div className="flex-1 flex justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden mb-20 h-fit flex flex-col">
                    
                    <PageHeader 
                        title={currentPage.title}
                        description={currentPage.description}
                        cover={currentPage.cover}
                        readOnly={true}
                    />

                    <div className="p-8 md:p-12">
                        {form.pages.length > 1 && (
                            <div className="mb-14 relative px-2">
                                {/* Background Line */}
                                <div className="absolute top-[11px] left-2 right-2 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                                
                                {/* Progress Line */}
                                <div 
                                    className="absolute top-[11px] left-0 h-[2px] bg-blue-500 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                                    style={{ width: `${(currentPageIndex / (form.pages.length - 1)) * 100}%` }}
                                />
                                
                                {/* Milestones */}
                                <div className="relative flex justify-between">
                                    {form.pages.map((page, index) => {
                                        const isActive = index === currentPageIndex;
                                        const isCompleted = index < currentPageIndex;
                                        
                                        return (
                                            <div key={page.id} className="flex flex-col items-center">
                                                {/* Dot */}
                                                <div 
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                                                        isActive 
                                                            ? 'bg-white dark:bg-zinc-950 border-blue-500 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                                            : isCompleted
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <svg className="w-3.5 h-3.5 text-white animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-blue-400' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                                    )}
                                                </div>
                                                
                                                {/* Label */}
                                                <div className="absolute top-8 flex flex-col items-center">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 whitespace-nowrap ${isActive ? 'text-blue-500' : 'text-zinc-400 dark:text-zinc-600'}`}>
                                                        {page.title}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Page Content */}
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {currentPage.sections.map(section => (
                                    <div key={section.id} className="space-y-6">
                                        <div className="mb-4">
                                            <Heading level={3} className="text-lg text-zinc-900 dark:text-white mb-1">{section.title}</Heading>
                                            {section.description && <Text className="text-sm text-zinc-500 dark:text-zinc-400">{section.description}</Text>}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {section.rows.map(row => (
                                                <div key={row.id} className="flex flex-col md:flex-row gap-4">
                                                    {row.fields.map(field => {
                                                        if (!visibleFieldIds.has(field.id)) return null;
                                                        const isRequired = requiredFieldIds.has(field.id);
                                                        const isStatic = ['paragraph', 'divider', 'spacer', 'image'].includes(field.type);
                                                        
                                                        if (isStatic) {
                                                            return (
                                                                <div key={field.id} className="flex-1 min-w-0">
                                                                    {renderField(field)}
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <Field key={field.id} className="flex-1 min-w-0">
                                                                <Label className="text-zinc-700 dark:text-zinc-300">
                                                                    {field.label} {isRequired && <span className="text-red-500">*</span>}
                                                                </Label>
                                                                {renderField(field)}
                                                                {errors[field.id] && (
                                                                    <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
                                                                )}
                                                            </Field>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation / Submit */}
                            <div className="flex justify-between pt-8 border-t border-zinc-100 dark:border-white/5 mt-8">
                                <div>
                                    {!isFirstPage && (
                                        <Button type="button" onClick={handlePrev} plain>
                                            &larr; Previous Step
                                        </Button>
                                    )}
                                </div>
                                <div>
                                    {isLastPage ? (
                                        <Button type="submit" color="blue">
                                            Submit Form
                                        </Button>
                                    ) : (
                                        <Button type="button" onClick={handleNext} color="blue">
                                            Next Step &rarr;
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormPreview;
