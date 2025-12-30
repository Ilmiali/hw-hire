import React from 'react';
import { FieldType } from '../../../types/form-builder';

interface ToolboxProps {
    onAddField: (type: FieldType) => void;
    onAddSection: () => void;
    onAddPage: () => void;
}

const Toolbox = ({ onAddField, onAddSection, onAddPage }: ToolboxProps) => {
    // Placeholder field types
    const fieldTypes: { type: FieldType; label: string; icon: string }[] = [
        { type: 'text', label: 'Text Input', icon: '📝' },
        { type: 'textarea', label: 'Long Text', icon: '📄' },
        { type: 'number', label: 'Number', icon: '🔢' },
        { type: 'email', label: 'Email', icon: '📧' },
        { type: 'select', label: 'Dropdown', icon: '▼' },
        { type: 'radio', label: 'Radio Group', icon: '◉' },
        { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
        { type: 'date', label: 'Date Picker', icon: '📅' },
    ];

    return (
        <div className="p-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Toolbox</h2>
            <div className="grid grid-cols-1 gap-2">
                {fieldTypes.map((field) => (
                    <button
                        key={field.type}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('application/x-form-field-type', field.type);
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => onAddField(field.type)}
                        className="flex items-center gap-3 p-3 text-left rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing w-full"
                    >
                        <span className="text-xl">{field.icon}</span>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{field.label}</span>
                    </button>
                ))}
            </div>
            
            <div className="mt-8">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Structure</h2>
                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={onAddPage}
                        className="flex items-center gap-3 p-3 text-left rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <span className="text-xl">📑</span>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Add Page</span>
                    </button>
                    <button 
                        onClick={onAddSection}
                        className="flex items-center gap-3 p-3 text-left rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <span className="text-xl">📦</span>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Add Section</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toolbox;
