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
    onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
    onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
}

const FieldRenderer = ({ field, isSelected, onClick, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: { field: FormField; isSelected: boolean; onClick: (e: React.MouseEvent) => void; onMoveUp: () => void; onMoveDown: () => void; canMoveUp: boolean; canMoveDown: boolean }) => {
    return (
        <div 
            onClick={onClick}
            className={`relative group p-4 rounded-lg cursor-pointer border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'}`}
        >
            {/* Reorder buttons */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={!canMoveUp}
                    className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={!canMoveDown}
                    className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
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

const SectionRenderer = ({ section, selectedId, onSelect, onDrop, onMoveField, onMoveSection, onMoveSectionUp, onMoveSectionDown, canMoveSectionUp, canMoveSectionDown }: { section: FormSection; selectedId: string | null; onSelect: (id: string) => void; onDrop: (type: any) => void; onMoveField: (fieldId: string, direction: 'up' | 'down') => void; onMoveSection: (sectionId: string, direction: 'up' | 'down') => void; onMoveSectionUp: () => void; onMoveSectionDown: () => void; canMoveSectionUp: boolean; canMoveSectionDown: boolean }) => {
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
            className={`relative group bg-white dark:bg-zinc-800 rounded-xl p-6 border-2 transition-all ${isSelected ? 'border-blue-500' : 'border-zinc-200 dark:border-white/10'} ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
            {/* Section Reorder buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveSectionUp(); }}
                    disabled={!canMoveSectionUp}
                    className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move section up"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveSectionDown(); }}
                    disabled={!canMoveSectionDown}
                    className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move section down"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
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
                    section.fields.map((field, index) => (
                        <FieldRenderer 
                            key={field.id} 
                            field={field} 
                            isSelected={field.id === selectedId}
                            onClick={(e) => { e.stopPropagation(); onSelect(field.id); }}
                            onMoveUp={() => onMoveField(field.id, 'up')}
                            onMoveDown={() => onMoveField(field.id, 'down')}
                            canMoveUp={index > 0}
                            canMoveDown={index < section.fields.length - 1}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

const Canvas = ({ page, selectedId, onSelect, onDrop, onMoveField, onMoveSection }: CanvasProps) => {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Page Header */}
            <div className="text-center mb-8">
                <Heading level={1}>{page.title}</Heading>
            </div>

            {page.sections.map((section, index) => (
                <SectionRenderer 
                    key={section.id} 
                    section={section} 
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onDrop={onDrop}
                    onMoveField={onMoveField}
                    onMoveSection={onMoveSection}
                    onMoveSectionUp={() => onMoveSection(section.id, 'up')}
                    onMoveSectionDown={() => onMoveSection(section.id, 'down')}
                    canMoveSectionUp={index > 0}
                    canMoveSectionDown={index < page.sections.length - 1}
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
