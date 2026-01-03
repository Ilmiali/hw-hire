import React, { useState, useEffect, useMemo } from 'react';
import { FormField, FormPage, FormSchema } from '../../../types/form-builder';
import { PageHeader } from './PageHeader';
import { evaluateRules } from '../../../utils/evaluateRules';
import { buildZodSchema } from '../../../utils/validation';
import { z } from 'zod';
import { toast } from 'react-toastify';

// UI Components
import { Input } from '../../../components/input';
import { Textarea } from '../../../components/textarea';
import { Select } from '../../../components/select';
import { Radio, RadioField, RadioGroup } from '../../../components/radio';
import { Checkbox, CheckboxField, CheckboxGroup } from '../../../components/checkbox';
import { Label, Field } from '../../../components/fieldset';
import { Heading } from '../../../components/heading';
import { Text } from '../../../components/text';
import { Button } from '@/components/ui/button';
import { 
    XMarkIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    CheckIcon,
    PlusIcon
} from '@heroicons/react/20/solid';
import { Spinner } from '../../../components/ui/spinner';

interface FormRendererProps {
    schema: FormSchema;
    onSuccess?: (values: any) => void;
    readOnly?: boolean;
    submitting?: boolean;
    embedded?: boolean;
}

export const FormRenderer = ({ schema, onSuccess, readOnly = false, submitting = false, embedded = false }: FormRendererProps) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const currentPage = schema.pages[currentPageIndex];
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
        setFormValues(prev => {
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
    }, [visibleFieldIds, allFields]);

    // Helper to handle input changes
    const handleChange = (fieldId: string, value: any) => {
        if (readOnly) return;
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));

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
        if (readOnly) return;
        
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
        toast.success('Form submitted! value logged to console.');
    };

    const renderFieldItem = (field: FormField, value: any, onChange: (val: any) => void) => {
        const isRequired = requiredFieldIds.has(field.id) || field.required;

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
                        readOnly={readOnly}
                    />
                );
            case 'textarea':
                return (
                    <Textarea 
                        placeholder={field.placeholder}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={isRequired}
                        readOnly={readOnly}
                    />
                );
            case 'select':
                return (
                    <Select 
                        value={value || ''} 
                        onChange={(e) => onChange(e.target.value)}
                        required={isRequired}
                        disabled={readOnly}
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
                        disabled={readOnly}
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
                                e.target.value = '';
                            }}
                            required={isRequired && files.length === 0}
                            disabled={readOnly}
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
                                        {!readOnly && (
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
                                        )}
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
                                {!readOnly && (
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
                                )}
                                <div className="flex flex-col gap-4">
                                     {field.fields?.map(child => (
                                         <div key={child.id} className="flex flex-col gap-1.5">
                                             {!['paragraph', 'divider', 'spacer', 'image'].includes(child.type) && (
                                                <Label className="text-zinc-700 dark:text-zinc-300">
                                                    {child.label} {child.required && <span className="text-red-500">*</span>}
                                                </Label>
                                             )}
                                             {renderFieldItem(child, itemValue[child.id], (childVal) => {
                                                 if (readOnly) return;
                                                 const newItems = [...items];
                                                 newItems[index] = { ...newItems[index], [child.id]: childVal };
                                                 onChange(newItems);
                                             })}
                                         </div>
                                     ))}
                                </div>
                            </div>
                        ))}
                        {!readOnly && (
                            <Button 
                                type="button" 
                                onClick={() => onChange([...items, {}])}
                                variant="outline"
                                className="w-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 rounded-xl py-6"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add {field.label || 'Item'}
                            </Button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderField = (field: FormField) => {
        if (!visibleFieldIds.has(field.id)) return null;
        return renderFieldItem(field, formValues[field.id], (val) => handleChange(field.id, val));
    };

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

    const content = (
        <div className="p-8 md:p-12">
                {schema.pages.length > 1 && (
                    <div className="mb-14 relative px-2">
                        <div className="absolute top-[11px] left-2 right-2 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                        <div 
                            className="absolute top-[11px] left-0 h-[2px] bg-blue-500 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" 
                            style={{ width: `${(currentPageIndex / (schema.pages.length - 1)) * 100}%` }}
                        />
                        <div className="relative flex justify-between">
                            {schema.pages.map((page, index) => {
                                const isActive = index === currentPageIndex;
                                const isCompleted = index < currentPageIndex;
                                return (
                                    <div key={page.id} className="flex flex-col items-center">
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
                                                if (isStatic) return <div key={field.id} className="flex-1 min-w-0">{renderField(field)}</div>;
                                                return (
                                                    <Field key={field.id} className="flex-1 min-w-0">
                                                        <Label className="text-zinc-700 dark:text-zinc-300">
                                                            {field.label} {isRequired && <span className="text-red-500">*</span>}
                                                        </Label>
                                                        {renderField(field)}
                                                        {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
                                                    </Field>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-8 border-t border-zinc-100 dark:border-white/5 mt-12 pb-4">
                        <div>
                            {!isFirstPage && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={handlePrev}
                                    className="text-muted-foreground hover:text-foreground transition-all rounded-lg"
                                >
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div>
                            {isLastPage ? (
                                !readOnly && (
                                    <Button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-tight shadow-lg shadow-primary/20 rounded-xl px-8 py-6 transition-all duration-200"
                                    >
                                        {submitting ? <Spinner size={20} className="mr-2" /> : <CheckIcon className="mr-2 h-5 w-5" />}
                                        Submit
                                    </Button>
                                )
                            ) : (
                                <Button 
                                    type="button" 
                                    onClick={handleNext} 
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-tight shadow-md rounded-xl px-8 py-6 transition-all duration-200"
                                >
                                    Next Step
                                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
    );
    
    if (embedded) {
        return content;
    }

    return (
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden mb-20 h-fit flex flex-col mx-auto">
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
