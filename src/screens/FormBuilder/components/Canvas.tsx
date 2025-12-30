import React from 'react';
import { FormPage, FormSection, FormField } from '../../../types/form-builder';

// Import basic UI components - adjust paths as needed based on file system
import { Input } from '../../../components/input';
import { Textarea } from '../../../components/textarea';
import { Select } from '../../../components/select';
import { Radio, RadioField, RadioGroup } from '../../../components/radio';
import { Checkbox, CheckboxField, CheckboxGroup } from '../../../components/checkbox';
import { Label } from '../../../components/fieldset'; // Assuming Label is here, will verify in next step
import { Heading } from '../../../components/heading';
import { Text } from '../../../components/text';

interface CanvasProps {
    page: FormPage;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onDrop: (type: any) => void;
}

const FieldRenderer = ({ field, isSelected, onClick }: { field: FormField; isSelected: boolean; onClick: (e: React.MouseEvent) => void }) => {
    // ... previous implementation ...
    return (
        <div 
            onClick={onClick}
            className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'}`}
        >
            {/* Same content as before */}
           <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2 cursor-pointer">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            <div className="pointer-events-none"> {/* Disable interaction in builder mode */}
                {field.type === 'text' && <Input placeholder={field.placeholder} />}
                {field.type === 'email' && <Input type="email" placeholder={field.placeholder} />}
                {field.type === 'number' && <Input type="number" placeholder={field.placeholder} />}
                {field.type === 'textarea' && <Textarea placeholder={field.placeholder} />}
                {field.type === 'date' && <Input type="date" />}
                
                {field.type === 'select' && (
                    <Select>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                )}

                {field.type === 'radio' && (
                    <RadioGroup>
                        {field.options?.map(opt => (
                            <RadioField key={opt.value}>
                                <Radio value={opt.value} />
                                <Label>{opt.label}</Label>
                            </RadioField>
                        ))}
                    </RadioGroup>
                )}

                 {field.type === 'checkbox' && (
                    <CheckboxGroup>
                        {field.options?.map(opt => (
                            <CheckboxField key={opt.value}>
                                <Checkbox value={opt.value} />
                                <Label>{opt.label}</Label>
                            </CheckboxField>
                        ))}
                    </CheckboxGroup>
                )}
            </div>
        </div>
    );
};

const SectionRenderer = ({ section, selectedId, onSelect, onDrop }: { section: FormSection; selectedId: string | null; onSelect: (id: string) => void; onDrop: (type: any) => void }) => {
    const isSelected = section.id === selectedId;
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const type = e.dataTransfer.getData('application/x-form-field-type');
        if (type) {
            onDrop(type);
        }
    };

    return (
        <div 
            onClick={(e) => { e.stopPropagation(); onSelect(section.id); }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white dark:bg-zinc-800 rounded-xl p-6 border-2 transition-all ${isSelected ? 'border-blue-500' : 'border-zinc-200 dark:border-white/10'} ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
            <div className="mb-6">
                <Heading level={2}>{section.title}</Heading>
                {section.description && <Text>{section.description}</Text>}
            </div>

            <div className="space-y-4 min-h-[100px]">
                {section.fields.length === 0 ? (
                    <div className="text-center text-zinc-400 dark:text-zinc-600 py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        Drop fields here
                    </div>
                ) : (
                    section.fields.map(field => (
                        <FieldRenderer 
                            key={field.id} 
                            field={field} 
                            isSelected={field.id === selectedId}
                            onClick={(e) => { e.stopPropagation(); onSelect(field.id); }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

const Canvas = ({ page, selectedId, onSelect, onDrop }: CanvasProps) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Page Header */}
            <div className="text-center mb-8">
                <Heading level={1}>{page.title}</Heading>
            </div>

            {page.sections.map(section => (
                <SectionRenderer 
                    key={section.id} 
                    section={section} 
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onDrop={onDrop}
                />
            ))}
            
            {/* Empty State if no sections */}
            {page.sections.length === 0 && (
                 <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">Add a section to start adding fields</p>
                </div>
            )}
        </div>
    );
};

export default Canvas;
