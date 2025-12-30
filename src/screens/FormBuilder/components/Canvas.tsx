import React from 'react';
import { FormPage, FormSection, FormField, FieldType, FormRow } from '../../../types/form-builder';
import { PageHeader } from './PageHeader';

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
    onUpdatePage: (updates: Partial<FormPage>) => void;
    onSelect: (id: string) => void;
    onDrop: (type: FieldType, sectionId?: string, rowIndex?: number, colIndex?: number) => void;
    onReorderField: (fieldId: string, sectionId: string, rowIndex: number, colIndex?: number) => void;
    onReorderSection: (sectionId: string, targetIndex: number) => void;
}

const DropIndicator = ({ isVisible, orientation = 'vertical', text }: { isVisible: boolean; orientation?: 'horizontal' | 'vertical'; text?: string }) => {
    if (!isVisible) return null;
    
    // orientation 'vertical' means a horizontal line between blocks (vertical stack)
    // orientation 'horizontal' means a vertical line between blocks (horizontal stack)
    
    if (orientation === 'vertical') {
        return (
            <div className="relative h-10 w-full flex items-center justify-center my-2 pointer-events-none z-50">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                </div>
                {text && (
                    <div className="relative flex justify-center">
                        <span className="bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-2xl border border-blue-400 animate-pulse">
                            {text}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-10 h-full flex items-center justify-center mx-1 pointer-events-none z-50 min-h-[100px]">
             <div className="absolute inset-0 flex justify-center" aria-hidden="true">
                <div className="h-full border-l-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
            {text && (
                <div className="relative flex items-center justify-center">
                    <span className="bg-blue-600 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-2xl border border-blue-400 animate-pulse whitespace-nowrap rotate-90">
                        {text}
                    </span>
                </div>
            )}
        </div>
    );
};

const FieldRenderer = ({ field, isSelected, onClick }: { field: FormField; isSelected: boolean; onClick: (e: React.MouseEvent) => void }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const ghostRef = React.useRef<HTMLDivElement>(null);

    return (
        <>
            {/* Hidden ghost for drag image */}
            <div 
                ref={ghostRef}
                className="fixed -left-[9999px] top-0 p-4 rounded-lg border-2 border-dashed border-blue-500 bg-zinc-900 opacity-40 w-80 pointer-events-none z-[9999]"
            >
                <label className="block text-sm font-medium text-white mb-2">
                    {field.label}
                </label>
                <div className="h-8 w-full bg-zinc-800 rounded border border-white/5"></div>
            </div>

            <div 
                id={field.id}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-form-field-id', field.id);
                    e.dataTransfer.effectAllowed = 'move';
                    
                    if (ghostRef.current) {
                        e.dataTransfer.setDragImage(ghostRef.current, 40, 40);
                    }
                    
                    setTimeout(() => setIsDragging(true), 0);
                }}
                onDragEnd={() => setIsDragging(false)}
                onClick={onClick}
                className={`field-wrapper relative group p-4 rounded-lg cursor-grab active:cursor-grabbing border-2 transition-all flex-1 min-w-0 ${isDragging ? 'opacity-10 border-dashed border-zinc-700 bg-transparent scale-95' : isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 bg-white/5 dark:bg-zinc-800/30'}`}
            >
               {!['paragraph', 'divider', 'spacer'].includes(field.type) && (
                   <label className={`block text-sm font-medium text-zinc-900 dark:text-white mb-2 truncate ${isDragging ? 'opacity-0' : ''}`}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
               )}
                
                <div className={`pointer-events-none ${isDragging ? 'opacity-0' : ''}`}>
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

                    {field.type === 'file' && <Input type="file" multiple={field.multiple} />}
                    
                    {field.type === 'paragraph' && (
                        <Text className="text-zinc-600 dark:text-zinc-400">
                            {field.content || field.placeholder || 'Enter your text here...'}
                        </Text>
                    )}

                    {field.type === 'divider' && <hr className="my-2 border-zinc-200 dark:border-zinc-700" />}
                    
                    {field.type === 'spacer' && <div className="h-8" />}
                </div>
            </div>
        </>
    );
};

const RowRenderer = ({ row, rowIndex, selectedId, onSelect, onDrop, onReorderField, sectionId }: { row: FormRow; rowIndex: number; selectedId: string | null; onSelect: (id: string) => void; onDrop: (type: FieldType, sectionId: string, rowIndex: number, colIndex: number) => void; onReorderField: (fieldId: string, sectionId: string, rowIndex: number, colIndex: number) => void; sectionId: string }) => {
    const [dragOverColIndex, setDragOverColIndex] = React.useState<number | null>(null);
    const rowRef = React.useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        // Only handle field drops here
        if (!e.dataTransfer.types.includes('application/x-form-field-type') && 
            !e.dataTransfer.types.includes('application/x-form-field-id')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (!rowRef.current) return;

        const children = Array.from(rowRef.current.children).filter(child => child.classList.contains('field-wrapper'));
        let newColIndex = children.length;

        for (let i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            if (e.clientX < midpoint) {
                newColIndex = i;
                break;
            }
        }
        setDragOverColIndex(newColIndex);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.dataTransfer.getData('application/x-form-field-type') as FieldType;
        const fieldId = e.dataTransfer.getData('application/x-form-field-id');

        if (dragOverColIndex !== null) {
            if (type) {
                onDrop(type, sectionId, rowIndex, dragOverColIndex);
            } else if (fieldId) {
                onReorderField(fieldId, sectionId, rowIndex, dragOverColIndex);
            }
        }
        setDragOverColIndex(null);
    };

    return (
        <div 
            ref={rowRef}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOverColIndex(null)}
            onDrop={handleDrop}
            className="flex gap-4 items-stretch relative min-h-[80px]"
        >
            {row.fields.map((field, colIndex: number) => (
                <React.Fragment key={field.id}>
                    {dragOverColIndex === colIndex && <DropIndicator isVisible={true} orientation="horizontal" text="Drop it here" />}
                    <FieldRenderer 
                        field={field} 
                        isSelected={field.id === selectedId}
                        onClick={(e) => { e.stopPropagation(); onSelect(field.id); }}
                    />
                </React.Fragment>
            ))}
            {dragOverColIndex === row.fields.length && <DropIndicator isVisible={true} orientation="horizontal" text="Drop it here" />}
        </div>
    );
};

const SectionRenderer = ({ 
    section, 
    selectedId, 
    onSelect, 
    onDrop, 
    onReorderField
}: { 
    section: FormSection; 
    selectedId: string | null; 
    onSelect: (id: string) => void; 
    onDrop: (type: FieldType, sectionId: string, rowIndex: number, colIndex?: number) => void; 
    onReorderField: (fieldId: string, sectionId: string, rowIndex: number, colIndex?: number) => void; 
}) => {
    const isSelected = section.id === selectedId;
    const [dragOverRowIndex, setDragOverRowIndex] = React.useState<number | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const ghostRef = React.useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        // Only handle field drops here
        if (!e.dataTransfer.types.includes('application/x-form-field-type') && 
            !e.dataTransfer.types.includes('application/x-form-field-id')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (!containerRef.current) return;

        const children = Array.from(containerRef.current.children).filter(child => child.classList.contains('row-wrapper'));
        let newRowIndex = children.length;

        for (let i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                newRowIndex = i;
                break;
            }
        }
        setDragOverRowIndex(newRowIndex);
    };

    const handleDrop = (e: React.DragEvent) => {
        const type = e.dataTransfer.getData('application/x-form-field-type') as FieldType;
        const fieldId = e.dataTransfer.getData('application/x-form-field-id');

        if (!type && !fieldId) return;

        e.preventDefault();
        e.stopPropagation();

        if (dragOverRowIndex !== null) {
            if (type) {
                onDrop(type, section.id, dragOverRowIndex);
            } else if (fieldId) {
                onReorderField(fieldId, section.id, dragOverRowIndex);
            }
        }
        setDragOverRowIndex(null);
    };

    return (
        <>
            {/* Section Ghost */}
            <div 
                ref={ghostRef}
                className="fixed -left-[9999px] top-0 p-6 rounded-2xl border-2 border-dashed border-blue-500 bg-zinc-900 opacity-40 w-[600px] pointer-events-none z-[9999]"
            >
                <Heading level={2} className="text-white text-xl mb-2">{section.title}</Heading>
                <div className="h-20 w-full bg-zinc-800 rounded-xl border border-white/5"></div>
            </div>

            <div 
                id={section.id}
                draggable
                onDragStart={(e) => {
                    // Check if we are dragging a button or the section itself
                    const target = e.target as HTMLElement;
                    const isActionButton = target.closest('button');
                    const isField = target.closest('.field-wrapper');

                    if (isActionButton || isField) {
                        e.stopPropagation();
                        // If it's a field, we want the field's own draggable to handle it.
                        // We shouldn't preventDefault here if it's a field, 
                        // as the field component needs to start its own drag.
                        // But we must stop propagation so the section doesn't take over.
                        if (isActionButton) e.preventDefault();
                        return;
                    }

                    e.dataTransfer.setData('application/x-form-section-id', section.id);
                    e.dataTransfer.effectAllowed = 'move';
                    
                    if (ghostRef.current) {
                        e.dataTransfer.setDragImage(ghostRef.current, 100, 40);
                    }
                    
                    setTimeout(() => setIsDragging(true), 0);
                }}
                onDragEnd={() => setIsDragging(false)}
                onClick={(e) => { e.stopPropagation(); onSelect(section.id); }}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOverRowIndex(null)}
                onDrop={handleDrop}
                className={`section-wrapper relative group bg-zinc-800/20 dark:bg-zinc-900/40 rounded-2xl p-6 border-2 transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-10 border-dashed border-zinc-700 bg-transparent scale-95' : isSelected ? 'border-blue-600/50 bg-blue-600/5' : 'border-white/5 hover:border-white/10'}`}
            >

                <div className={`mb-6 ${isDragging ? 'opacity-0' : ''}`}>
                    <Heading level={2} className="text-white text-xl">{section.title}</Heading>
                    {section.description && <Text className="text-zinc-400">{section.description}</Text>}
                </div>

                <div className={`space-y-4 relative ${isDragging ? 'opacity-0' : ''}`} ref={containerRef}>
                    {dragOverRowIndex === 0 && <DropIndicator isVisible={true} text="New Row" />}
                    
                    {section.rows.map((row, rowIndex) => (
                        <div key={row.id} className="row-wrapper relative">
                            <RowRenderer 
                                row={row} 
                                rowIndex={rowIndex}
                                selectedId={selectedId}
                                onSelect={onSelect}
                                onDrop={onDrop}
                                onReorderField={onReorderField}
                                sectionId={section.id}
                            />
                            {dragOverRowIndex === rowIndex + 1 && <DropIndicator isVisible={true} text="New Row" />}
                        </div>
                    ))}
                    
                    {section.rows.length === 0 && dragOverRowIndex === null && !isDragging && (
                        <div className="text-center text-zinc-500 py-10 border-2 border-dashed border-white/5 rounded-xl">
                            Drop fields here
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

const Canvas = ({ 
    page, 
    selectedId, 
    onUpdatePage,
    onSelect, 
    onDrop, 
    onReorderField, 
    onReorderSection 
}: CanvasProps) => {
    const [dragOverSectionIndex, setDragOverSectionIndex] = React.useState<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        // Only handle section reordering here
        if (!e.dataTransfer.types.includes('application/x-form-section-id')) {
            return;
        }

        e.preventDefault();
        if (!containerRef.current) return;

        const children = Array.from(containerRef.current.children).filter(child => child.classList.contains('section-wrapper'));
        let newIndex = children.length;

        for (let i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                newIndex = i;
                break;
            }
        }
        setDragOverSectionIndex(newIndex);
    };

    const handleDrop = (e: React.DragEvent) => {
        const sectionId = e.dataTransfer.getData('application/x-form-section-id');
        if (!sectionId) return;

        e.preventDefault();
        if (dragOverSectionIndex !== null) {
            onReorderSection(sectionId, dragOverSectionIndex);
        }
        setDragOverSectionIndex(null);
    };

    React.useEffect(() => {
        if (!selectedId) return;
        
        // Wait a bit for the page to transition and elements to mount
        const timeout = setTimeout(() => {
            const element = document.getElementById(selectedId);
            if (element) {
                // Check if element is already in view
                const rect = element.getBoundingClientRect();
                const isInView = (
                    rect.top >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
                );

                if (!isInView) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [selectedId, page.id]); // Re-run if selection changes or we switch pages

    return (
        <div 
            className="max-w-5xl mx-auto space-y-12 pb-32"
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOverSectionIndex(null)}
            onDrop={handleDrop}
            ref={containerRef}
        >
            <PageHeader 
                title={page.title}
                description={page.description || ''}
                cover={page.cover}
                setTitle={(title) => onUpdatePage({ title })}
                setDescription={(description) => onUpdatePage({ description })}
                setCover={(cover) => onUpdatePage({ cover } as any)}
            />

            {dragOverSectionIndex === 0 && <DropIndicator isVisible={true} text="Move Section Here" />}

            {page.sections.map((section, index) => (
                <React.Fragment key={section.id}>
                    <SectionRenderer 
                        section={section} 
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onDrop={onDrop}
                        onReorderField={onReorderField}
                    />
                    {dragOverSectionIndex === index + 1 && <DropIndicator isVisible={true} text="Move Section Here" />}
                </React.Fragment>
            ))}
            
            {page.sections.length === 0 && (
                 <div className="border-2 border-dashed border-white/10 rounded-2xl p-20 flex flex-col items-center justify-center text-center bg-white/5">
                    <p className="text-zinc-400">Add a section to start adding fields</p>
                </div>
            )}
        </div>
    );
};

export default Canvas;
