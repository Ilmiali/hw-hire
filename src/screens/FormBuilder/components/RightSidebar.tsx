
import React, { useState, useEffect } from 'react';
import { useFormBuilderStore } from '../../../store/formBuilderStore';
import PropertiesPanel from './PropertiesPanel';
import { RulesSidebar } from './rules/RulesSidebar';
import clsx from 'clsx';

interface RightSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose, onToggle }) => {
    const selectedElementId = useFormBuilderStore(state => state.selectedElementId);
    const form = useFormBuilderStore(state => state.form);
    
    // Derived selected element
    let selectedElement: { type: 'field' | 'section' | 'page' | 'form', data: any } | null = null;
    if (selectedElementId) {
        form.pages.forEach(page => {
            if (page.id === selectedElementId) selectedElement = { type: 'page', data: page };
            page.sections.forEach(section => {
                if (section.id === selectedElementId) selectedElement = { type: 'section', data: section };
                section.rows.forEach(row => {
                    row.fields.forEach(field => {
                        if (field.id === selectedElementId) selectedElement = { type: 'field', data: field };
                    });
                });
            });
        });
    }

    // Actions
    const updateField = useFormBuilderStore(state => state.updateField);
    const deleteField = useFormBuilderStore(state => state.deleteField);
    const updateSection = useFormBuilderStore(state => state.updateSection);
    const deleteSection = useFormBuilderStore(state => state.deleteSection);
    const updatePage = useFormBuilderStore(state => state.updatePage);
    const deletePage = useFormBuilderStore(state => state.deletePage);

    // Tab State
    const [activeTab, setActiveTab] = useState<'properties' | 'rules'>('properties');

    // Auto-switch to properties when element is selected
    useEffect(() => {
        if (selectedElementId) {
            setActiveTab('properties');
        }
    }, [selectedElementId]);

    // If closed, render a collapsed strip (optional, or just handle in parent)
    // We'll maintain the width=0 if closed logic from parent, but actually better to handle it here or in layout.
    // The previous implementation used conditional rendering `{isRightSidebarOpen && ...}`.
    // To support "Opening from closed state via tab", we might want to render a strip always.
    
    // But adhering to the layout in FormBuilder, let's Stick to the existing layout where Sidebar is a specific width block.
    // We will render the strip if !isOpen.

    if (!isOpen) {
        return (
             <div className="w-12 border-l border-white/10 bg-zinc-900 flex flex-col items-center py-4 gap-4">
                 <button 
                    onClick={() => { onToggle(); setActiveTab('properties'); }}
                    className={clsx("p-2 rounded-lg transition-colors text-zinc-400 hover:text-white hover:bg-white/10", activeTab === 'properties' && "text-blue-400")}
                    title="Properties"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                 </button>
                 <button 
                    onClick={() => { onToggle(); setActiveTab('rules'); }}
                    className={clsx("p-2 rounded-lg transition-colors text-zinc-400 hover:text-white hover:bg-white/10", activeTab === 'rules' && "text-blue-400")}
                    title="Rules"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                 </button>
             </div>
        );
    }

    return (
        <div className="w-80 border-l border-white/10 bg-zinc-900 flex flex-col">
            {/* Tab Header */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('properties')}
                    className={clsx(
                        "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'properties' 
                            ? "text-blue-400 border-blue-500 bg-white/5" 
                            : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5"
                    )}
                >
                    Properties
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                     className={clsx(
                        "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'rules' 
                            ? "text-blue-400 border-blue-500 bg-white/5" 
                            : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/5"
                    )}
                >
                    Rules ({form.rules?.length || 0})
                </button>
                <button 
                    onClick={onClose}
                    className="px-3 border-l border-white/10 text-zinc-500 hover:text-zinc-300"
                >
                    &times;
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'properties' && (
                    <PropertiesPanel 
                        selectedElement={selectedElement} 
                        onUpdate={(updates: any) => {
                            if (selectedElement?.type === 'field') updateField(selectedElementId!, updates);
                            if (selectedElement?.type === 'section') updateSection(selectedElementId!, updates);
                            if (selectedElement?.type === 'page') updatePage(selectedElementId!, updates);
                        }}
                        onDelete={() => {
                            if (!selectedElementId) return;
                            if (selectedElement?.type === 'field') deleteField(selectedElementId);
                            if (selectedElement?.type === 'section') deleteSection(selectedElementId);
                            if (selectedElement?.type === 'page') deletePage(selectedElementId);
                        }}
                        onClose={onClose}
                        hideHeader // Since we have tabs now, we might want to hide the inner header of PropertiesPanel or adjust it
                    />
                )}
                
                {activeTab === 'rules' && (
                    <RulesSidebar />
                )}
            </div>
        </div>
    );
};
