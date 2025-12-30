import React from 'react';
import { FormPage, FormSection, FormField, FieldType, FormRow } from '../../../types/form-builder';

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
    onDrop: (type: FieldType, sectionId?: string, rowIndex?: number, colIndex?: number) => void;
    onReorderField: (fieldId: string, sectionId: string, rowIndex: number, colIndex?: number) => void;
    onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
    onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
    onMoveSectionUp: (id: string) => void;
    onMoveSectionDown: (id: string) => void;
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

const FieldRenderer = ({ field, isSelected, onClick, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: { field: FormField; isSelected: boolean; onClick: (e: React.MouseEvent) => void; onMoveUp: () => void; onMoveDown: () => void; canMoveUp: boolean; canMoveDown: boolean }) => {
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
                {!isDragging && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                            disabled={!canMoveUp}
                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                            disabled={!canMoveDown}
                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )}
               <label className={`block text-sm font-medium text-zinc-900 dark:text-white mb-2 truncate ${isDragging ? 'opacity-0' : ''}`}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
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
                </div>
            </div>
        </>
    );
};

const RowRenderer = ({ row, rowIndex, selectedId, onSelect, onDrop, onReorderField, sectionId, onMoveField }: { row: FormRow; rowIndex: number; selectedId: string | null; onSelect: (id: string) => void; onDrop: (type: FieldType, sectionId: string, rowIndex: number, colIndex: number) => void; onReorderField: (fieldId: string, sectionId: string, rowIndex: number, colIndex: number) => void; sectionId: string; onMoveField: (id: string, direction: 'up' | 'down') => void }) => {
    const [dragOverColIndex, setDragOverColIndex] = React.useState<number | null>(null);
    const rowRef = React.useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
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
                        onMoveUp={() => onMoveField(field.id, 'up')}
                        onMoveDown={() => onMoveField(field.id, 'down')}
                        canMoveUp={true} // Can always try to move up/down between rows
                        canMoveDown={true}
                    />
                </React.Fragment>
            ))}
            {dragOverColIndex === row.fields.length && <DropIndicator isVisible={true} orientation="horizontal" text="Drop it here" />}
        </div>
    );
};

const SectionRenderer = ({ section, selectedId, onSelect, onDrop, onReorderField, onMoveField }: { section: FormSection; selectedId: string | null; onSelect: (id: string) => void; onDrop: (type: FieldType, sectionId: string, rowIndex: number, colIndex?: number) => void; onReorderField: (fieldId: string, sectionId: string, rowIndex: number, colIndex?: number) => void; onMoveField: (fieldId: string, direction: 'up' | 'down') => void }) => {
    const isSelected = section.id === selectedId;
    const [dragOverRowIndex, setDragOverRowIndex] = React.useState<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
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
        e.preventDefault();
        const type = e.dataTransfer.getData('application/x-form-field-type') as FieldType;
        const fieldId = e.dataTransfer.getData('application/x-form-field-id');

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
        <div 
            onClick={(e) => { e.stopPropagation(); onSelect(section.id); }}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOverRowIndex(null)}
            onDrop={handleDrop}
            className={`relative group bg-zinc-800/20 dark:bg-zinc-900/40 rounded-2xl p-6 border-2 transition-all ${isSelected ? 'border-blue-600/50 bg-blue-600/5' : 'border-white/5 hover:border-white/10'}`}
        >
            <div className="mb-6">
                <Heading level={2} className="text-white text-xl">{section.title}</Heading>
                {section.description && <Text className="text-zinc-400">{section.description}</Text>}
            </div>

            <div className="space-y-4 relative" ref={containerRef}>
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
                            onMoveField={onMoveField}
                        />
                        {dragOverRowIndex === rowIndex + 1 && <DropIndicator isVisible={true} text="New Row" />}
                    </div>
                ))}
                
                {section.rows.length === 0 && !dragOverRowIndex !== null && (
                    <div className="text-center text-zinc-500 py-10 border-2 border-dashed border-white/5 rounded-xl">
                        Drop fields here
                    </div>
                )}
            </div>
        </div>
    );
}

const Canvas = ({ page, selectedId, onSelect, onDrop, onReorderField, onMoveField, onMoveSection, onMoveSectionUp, onMoveSectionDown }: CanvasProps) => {
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-32">
            <div className="text-center mb-12">
                <Heading level={1} className="text-white text-3xl">{page.title}</Heading>
            </div>

            {page.sections.map((section) => (
                <SectionRenderer 
                    key={section.id} 
                    section={section} 
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onDrop={onDrop}
                    onReorderField={onReorderField}
                    onMoveField={onMoveField}
                />
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
