import { useState } from 'react';
import { FormSchema, FieldType, FormField, FormRow } from '../../../types/form-builder';
import { MagnifyingGlassIcon, PlusIcon, DocumentIcon, FolderIcon, QueueListIcon, TrashIcon, Square2StackIcon } from '@heroicons/react/20/solid';
import { RulesSidebar } from './rules/RulesSidebar';

interface LeftSidebarProps {
    form: FormSchema;
    onAddSection: () => void;
    onAddPage: () => void;
    onSelectElement: (id: string) => void;
    onDeleteElement: (id: string, type: 'field' | 'section' | 'page') => void;
    onDuplicateElement: (id: string, type: 'field' | 'section' | 'page') => void;
    selectedId: string | null;
}

const fieldTypes: { type: FieldType; label: string; icon: string }[] = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'textarea', label: 'Long Text', icon: '📄' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'email', label: 'Email', icon: '📧' },
    { type: 'select', label: 'Dropdown', icon: '▼' },
    { type: 'radio', label: 'Radio Group', icon: '◉' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'date', label: 'Date Picker', icon: '📅' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'paragraph', label: 'Paragraph', icon: '¶' },
    { type: 'divider', label: 'Divider', icon: '➖' },
    { type: 'spacer', label: 'Spacer', icon: '↕️' },
];

export const LeftSidebar = ({ form, onAddSection, onAddPage, onSelectElement, onDeleteElement, onDuplicateElement, selectedId }: LeftSidebarProps) => {
    const [activeTab, setActiveTab] = useState<'elements' | 'tree' | 'rules'>('elements');
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-white/10 w-80">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('elements')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'elements'
                            ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                    Elements
                </button>
                <button
                    onClick={() => setActiveTab('tree')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'tree'
                            ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                    Tree
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'rules'
                            ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                >
                    Rules
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'elements' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search elements"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                             <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Basic Fields</h3>
                            {fieldTypes.filter(f => f.label.toLowerCase().includes(searchTerm.toLowerCase())).map((field) => (
                                <button
                                    key={field.type}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/x-form-field-type', field.type);
                                        e.dataTransfer.effectAllowed = 'copy';
                                    }}
                                    className="flex items-center gap-3 p-2 text-left rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-grab active:cursor-grabbing"
                                    title="Drag to add to canvas"
                                >
                                    <span className="flex items-center justify-center w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-base group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
                                        {field.icon}
                                    </span>
                                    <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                        {field.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'tree' && (
                    <div className="space-y-2">
                         <div className="relative mb-4">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search tree"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-white placeholder-zinc-400"
                            />
                        </div>
                        
                        <div className="space-y-1">
                            {form.pages.map(page => (
                                <div key={page.id} className="space-y-1">
                                    <div 
                                        className={`group/treeitem flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${selectedId === page.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                                        onClick={() => onSelectElement(page.id)}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <DocumentIcon className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm truncate">{page.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDuplicateElement(page.id, 'page'); }}
                                                className="opacity-0 group-hover/treeitem:opacity-100 p-1 hover:bg-blue-500/10 hover:text-blue-500 rounded transition-all"
                                                title="Duplicate Page"
                                            >
                                                <Square2StackIcon className="w-3.5 h-3.5" />
                                            </button>
                                            {form.pages.length > 1 && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDeleteElement(page.id, 'page'); }}
                                                    className="opacity-0 group-hover/treeitem:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                                                    title="Delete Page"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pl-4 space-y-1 border-l border-zinc-100 dark:border-zinc-800 ml-3">
                                        {page.sections.map(section => (
                                            <div key={section.id} className="space-y-1">
                                                <div 
                                                    className={`group/treeitem flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${selectedId === section.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                                                    onClick={() => onSelectElement(section.id)}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <FolderIcon className="w-4 h-4 text-zinc-400" />
                                                        <span className="text-sm truncate">{section.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onDuplicateElement(section.id, 'section'); }}
                                                            className="opacity-0 group-hover/treeitem:opacity-100 p-1 hover:bg-blue-500/10 hover:text-blue-500 rounded transition-all"
                                                            title="Duplicate Section"
                                                        >
                                                            <Square2StackIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); onDeleteElement(section.id, 'section'); }}
                                                            className="opacity-0 group-hover/treeitem:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                                                            title="Delete Section"
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="pl-4 space-y-1 border-l border-zinc-100 dark:border-zinc-800 ml-3">
                                                    {section.rows.flatMap(r => r.fields).map((field) => (
                                                        <div 
                                                            key={field.id}
                                                            onClick={(e) => { e.stopPropagation(); onSelectElement(field.id); }}
                                                            className={`group/treeitem flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${selectedId === field.id ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            <div className="flex items-center gap-2 truncate">
                                                                <QueueListIcon className="w-3.5 h-3.5 text-zinc-500/50" />
                                                                <span className="text-sm truncate">{field.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); onDuplicateElement(field.id, 'field'); }}
                                                                    className="opacity-0 group-hover/treeitem:opacity-100 p-1 hover:bg-blue-500/10 hover:text-blue-500 rounded transition-all"
                                                                    title="Duplicate Field"
                                                                >
                                                                    <Square2StackIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); onDeleteElement(field.id, 'field'); }}
                                                                    className="opacity-0 group-hover/treeitem:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                                                                    title="Delete Field"
                                                                >
                                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Add Actions in Tree */}
                         <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-white/5 space-y-2">
                            <button 
                                onClick={onAddPage}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                Add Page
                            </button>
                             <button 
                                onClick={onAddSection}
                                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                Add Section
                            </button>
                         </div>
                    </div>
                )}

                {activeTab === 'rules' && (
                     <RulesSidebar />
                )}
            </div>
        </div>
    );
};
