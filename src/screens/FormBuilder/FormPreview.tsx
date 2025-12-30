
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { FormField } from '../../types/form-builder';

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

export const FormPreview = () => {
    const navigate = useNavigate();
    const form = useFormBuilderStore(state => state.form);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    const currentPage = form.pages[currentPageIndex];
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === form.pages.length - 1;

    // Helper to handle input changes
    const handleChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleNext = () => {
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
        console.log('Form Submission:', formValues);
        alert('Form submitted! value logged to console.');
    };

    // Helper to render field based on type
    const renderField = (field: FormField) => {
        const value = formValues[field.id] || '';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                return (
                    <Input 
                        type={field.type} 
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                    />
                );
            case 'textarea':
                return (
                    <Textarea 
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                    />
                );
            case 'select':
                return (
                    <Select 
                        value={value} 
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
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
                        value={value} 
                        onChange={(val) => handleChange(field.id, val)}
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
                // Checkbox can be single (boolean) or multiple (array) if we had a CheckboxGroup with multiple values.
                // Based on Canvas.tsx, it renders a CheckboxGroup around CheckboxFields.
                // Assuming standard checkbox group behavior here or multiple checkboxes.
                // For simplicity, treating "checkbox" type as "Multi-select checkbox group" or "Single Checkbox"? 
                // The Type definition says 'checkbox', and Canvas renders CheckboxGroup.
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
                                            handleChange(field.id, currentArr);
                                        }}
                                    />
                                    <Label>{opt.label}</Label>
                                </CheckboxField>
                            );
                        })}
                    </CheckboxGroup>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            {/* Preview Banner */}
            <div className="bg-blue-600/10 border-b border-blue-500/20 px-6 py-3 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400">
                    <span className="bg-blue-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-blue-500/30">Preview Mode</span>
                    <Text className="text-sm text-blue-200">This is how your form will look to users.</Text>
                </div>
                <Button onClick={() => navigate('/form-builder')} outline>
                    Back to Editor
                </Button>
            </div>

            <div className="flex-1 flex justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-2xl bg-zinc-900 rounded-xl border border-white/5 shadow-2xl p-8 md:p-12 mb-20 h-fit">
                    
                    {/* Form Header */}
                    <div className="mb-8 text-center">
                        <Heading level={1} className="text-3xl text-white mb-2">{form.title}</Heading>
                        {form.description && <Text className="text-zinc-400">{form.description}</Text>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Page Content */}
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="mb-6 border-b border-white/5 pb-4">
                                <Heading level={2} className="text-xl text-white">{currentPage.title}</Heading>
                            </div>

                            {currentPage.sections.map(section => (
                                <div key={section.id} className="space-y-6">
                                    <div className="mb-4">
                                        <Heading level={3} className="text-lg text-white mb-1">{section.title}</Heading>
                                        {section.description && <Text className="text-sm text-zinc-500">{section.description}</Text>}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {section.rows.map(row => (
                                            <div key={row.id} className="flex flex-col md:flex-row gap-4">
                                                {row.fields.map(field => (
                                                    <Field key={field.id} className="flex-1 min-w-0">
                                                        <Label className="text-zinc-300">
                                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                                        </Label>
                                                        {renderField(field)}
                                                    </Field>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation / Submit */}
                        <div className="flex justify-between pt-8 border-t border-white/5 mt-8">
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
    );
};

export default FormPreview;
