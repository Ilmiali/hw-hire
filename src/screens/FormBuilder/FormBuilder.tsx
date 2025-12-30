import React, { useState } from 'react';
import { StackedLayout } from '../../components/stacked-layout';
import Toolbox from './components/Toolbox';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import { FormSchema, FormPage, FormSection, FormField, FieldType } from '../../types/form-builder';
import { v4 as uuidv4 } from 'uuid';

const initialForm: FormSchema = {
    id: uuidv4(),
    title: 'Untitled Form',
    description: 'Add a description to your form',
    pages: [
        {
            id: uuidv4(),
            title: 'Page 1',
            sections: [
                {
                    id: uuidv4(),
                    title: 'Section 1',
                    description: '',
                    fields: []
                }
            ]
        }
    ]
};

const FormBuilder = () => {
    const [form, setForm] = useState<FormSchema>(initialForm);
    const [activePageId, setActivePageId] = useState<string>(initialForm.pages[0].id);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    // Helpers to find current page index
    const activePageIndex = form.pages.findIndex(p => p.id === activePageId);

    const handleAddField = (type: FieldType) => {
        const newField: FormField = {
            id: uuidv4(),
            type,
            label: `New ${type} field`,
            required: false,
            placeholder: '',
            options: ['select', 'radio', 'checkbox'].includes(type) ? 
                [{ label: 'Option 1', value: 'option-1' }, { label: 'Option 2', value: 'option-2' }] : undefined
        };

        setForm(prev => {
            const newForm = { ...prev };
            // Add to the last section of the active page for simplicity, 
            // or we could track "active section" too. 
            // For now, let's just add to the first section of the active page if exists.
            if (newForm.pages[activePageIndex].sections.length > 0) {
                newForm.pages[activePageIndex].sections[0].fields.push(newField);
            }
            return newForm;
        });
        setSelectedElementId(newField.id);
    };

    const handleAddSection = () => {
        const newSection: FormSection = {
            id: uuidv4(),
            title: 'New Section',
            fields: []
        };
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages[activePageIndex].sections.push(newSection);
            return newForm;
        });
        setSelectedElementId(newSection.id);
    };

    const handleAddPage = () => {
        const newPage: FormPage = {
            id: uuidv4(),
            title: `Page ${form.pages.length + 1}`,
            sections: [
                {
                    id: uuidv4(),
                    title: 'Section 1',
                    fields: []
                }
            ]
        };
        setForm(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
        setActivePageId(newPage.id);
    };

    const handleSave = () => {
        console.log('Form Schema:', JSON.stringify(form, null, 2));
        alert('Form saved! Check console for JSON.');
    };

    const updateField = (fieldId: string, updates: Partial<FormField>) => {
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages.forEach(page => {
                page.sections.forEach(section => {
                    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
                    if (fieldIndex !== -1) {
                        section.fields[fieldIndex] = { ...section.fields[fieldIndex], ...updates };
                    }
                });
            });
            return newForm;
        });
    };

    const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages.forEach(page => {
                const sectionIndex = page.sections.findIndex(s => s.id === sectionId);
                if (sectionIndex !== -1) {
                    page.sections[sectionIndex] = { ...page.sections[sectionIndex], ...updates };
                }
            });
            return newForm;
        });
    };

    const updatePage = (pageId: string, updates: Partial<FormPage>) => {
        setForm(prev => {
            const newForm = { ...prev };
            const pageIndex = newForm.pages.findIndex(p => p.id === pageId);
            if (pageIndex !== -1) {
                newForm.pages[pageIndex] = { ...newForm.pages[pageIndex], ...updates };
            }
            return newForm;
        });
    };
    const deleteField = (fieldId: string) => {
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages.forEach(page => {
                page.sections.forEach(section => {
                    section.fields = section.fields.filter(f => f.id !== fieldId);
                });
            });
            return newForm;
        });
        setSelectedElementId(null);
    };

    const deleteSection = (sectionId: string) => {
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages.forEach(page => {
                page.sections = page.sections.filter(s => s.id !== sectionId);
            });
            return newForm;
        });
        setSelectedElementId(null);
    };

    const deletePage = (pageId: string) => {
        if (form.pages.length <= 1) {
            alert("Cannot delete the only page.");
            return;
        }
        setForm(prev => {
            const newForm = { ...prev };
            const pageIndex = newForm.pages.findIndex(p => p.id === pageId);
            const newPages = newForm.pages.filter(p => p.id !== pageId);
            
            // If deleting active page, switch to previous or next
            if (pageId === activePageId) {
                const newActiveIndex = Math.max(0, pageIndex - 1);
                setActivePageId(newPages[newActiveIndex].id);
            }
            
            return { ...prev, pages: newPages };
        });
        setSelectedElementId(null);
    };

    const moveField = (fieldId: string, direction: 'up' | 'down') => {
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages.forEach(page => {
                page.sections.forEach(section => {
                    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
                    if (fieldIndex !== -1) {
                        const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
                        if (newIndex >= 0 && newIndex < section.fields.length) {
                            // Swap
                            const temp = section.fields[fieldIndex];
                            section.fields[fieldIndex] = section.fields[newIndex];
                            section.fields[newIndex] = temp;
                        }
                    }
                });
            });
            return newForm;
        });
    };

    const moveSection = (sectionId: string, direction: 'up' | 'down') => {
        setForm(prev => {
            const newForm = { ...prev };
            newForm.pages.forEach(page => {
                const sectionIndex = page.sections.findIndex(s => s.id === sectionId);
                if (sectionIndex !== -1) {
                    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
                    if (newIndex >= 0 && newIndex < page.sections.length) {
                        // Swap
                        const temp = page.sections[sectionIndex];
                        page.sections[sectionIndex] = page.sections[newIndex];
                        page.sections[newIndex] = temp;
                    }
                }
            });
            return newForm;
        });
    };

    // Find the selected object for the properties panel
    let selectedElement: { type: 'field' | 'section' | 'page' | 'form', data: any } | null = null;
    
    // Check if form itself is selected (hacky way, maybe just clearing selection means form props)
    // For now let's just check fields and sections
    if (selectedElementId) {
        form.pages.forEach(page => {
            if (page.id === selectedElementId) selectedElement = { type: 'page', data: page };
            page.sections.forEach(section => {
                if (section.id === selectedElementId) selectedElement = { type: 'section', data: section };
                section.fields.forEach(field => {
                    if (field.id === selectedElementId) selectedElement = { type: 'field', data: field };
                });
            });
        });
    }

    return (
        <StackedLayout 
            sidebar={null} // Sidebar is hidden in this layout usage
            navbar={
                <div className="flex justify-between items-center w-full px-4 py-2 border-b border-zinc-200 dark:border-white/10">
                    <div>
                        <input 
                            value={form.title} 
                            onChange={(e) => setForm(prev => ({...prev, title: e.target.value}))}
                            className="text-lg font-semibold bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-white p-0"
                        />
                    </div>
                    
                    {/* Page Navigation if multiple pages */}
                    {form.pages.length > 1 && (
                        <div className="flex gap-2">
                           {form.pages.map((page, index) => (
                               <button 
                                   key={page.id}
                                   onClick={() => setActivePageId(page.id)}
                                   className={`px-3 py-1 rounded text-sm ${activePageId === page.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-zinc-600 dark:text-zinc-400'}`}
                               >
                                   Page {index + 1}
                               </button>
                           ))}
                        </div>
                    )}

                    <button 
                        onClick={handleSave}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium"
                    >
                        Save Form
                    </button>
                </div>
            }
        >
            <div className="flex h-full">
                <div className="w-64 border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-y-auto">
                    <Toolbox onAddField={handleAddField} onAddSection={handleAddSection} onAddPage={handleAddPage} />
                </div>
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-8 overflow-y-auto" onClick={() => setSelectedElementId(null)}>
                    <Canvas 
                        page={form.pages[activePageIndex]} 
                        selectedId={selectedElementId}
                        onSelect={setSelectedElementId}
                        onDrop={(type) => handleAddField(type)}
                        onMoveField={moveField}
                        onMoveSection={moveSection}
                    />
                </div>
                <div className="w-80 border-l border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 overflow-y-auto">
                    <PropertiesPanel 
                        selectedElement={selectedElement} 
                        onUpdate={(updates) => {
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
                    />
                </div>
            </div>
        </StackedLayout>
    );
};

export default FormBuilder;
