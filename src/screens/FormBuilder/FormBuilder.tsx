import { useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
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
                    rows: []
                }
            ]
        }
    ]
};

const FormBuilder = () => {
    const [form, setForm] = useState<FormSchema>(initialForm);
    const [activePageId, setActivePageId] = useState<string>(initialForm.pages[0].id);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    // Helpers to find current page index
    const activePageIndex = form.pages.findIndex(p => p.id === activePageId);

    const handleAddField = (type: FieldType, targetSectionId?: string, targetRowIndex?: number, targetColumnIndex?: number) => {
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
            const page = newForm.pages.find(p => p.id === activePageId);
            if (!page) return prev;

            let section = page.sections.find(s => s.id === targetSectionId);
            if (!section && page.sections.length > 0) {
                section = page.sections[0];
            }

            if (section) {
                if (targetColumnIndex !== undefined && targetRowIndex !== undefined) {
                    // Insert into existing row
                    const row = section.rows[targetRowIndex];
                    if (row && row.fields.length < 4) {
                        row.fields.splice(targetColumnIndex, 0, newField);
                    } else {
                        // If column index provided but row full or missing, create new row
                        section.rows.splice(targetRowIndex, 0, { id: uuidv4(), fields: [newField] });
                    }
                } else {
                    // Insert as new row
                    const rowIndex = targetRowIndex !== undefined ? targetRowIndex : section.rows.length;
                    section.rows.splice(rowIndex, 0, { id: uuidv4(), fields: [newField] });
                }
            }
            return newForm;
        });
        setSelectedElementId(newField.id);
        setIsRightSidebarOpen(true);
    };

    const handleReorderField = (fieldId: string, targetSectionId: string, targetRowIndex: number, targetColumnIndex?: number) => {
        setForm(prev => {
            const newForm = { ...prev };
            let sourceField: FormField | null = null;
            
            // Remove from source and cleanup
            newForm.pages.forEach(page => {
                page.sections.forEach(section => {
                    section.rows.forEach((row, rIdx) => {
                        const idx = row.fields.findIndex(f => f.id === fieldId);
                        if (idx !== -1) {
                            sourceField = row.fields.splice(idx, 1)[0];
                        }
                    });
                    // Cleanup empty rows
                    section.rows = section.rows.filter(row => row.fields.length > 0);
                });
            });

            if (!sourceField) return prev;

            // Insert into target
            newForm.pages.forEach(page => {
                const section = page.sections.find(s => s.id === targetSectionId);
                if (section) {
                    if (targetColumnIndex !== undefined) {
                        // Target existing or new row at targetRowIndex
                        if (!section.rows[targetRowIndex]) {
                             section.rows.splice(targetRowIndex, 0, { id: uuidv4(), fields: [sourceField!] });
                        } else {
                            const row = section.rows[targetRowIndex];
                            if (row.fields.length < 4) {
                                row.fields.splice(targetColumnIndex, 0, sourceField!);
                            } else {
                                // Row full, insert as new row instead
                                section.rows.splice(targetRowIndex + 1, 0, { id: uuidv4(), fields: [sourceField!] });
                            }
                        }
                    } else {
                        // Insert as new row
                        section.rows.splice(targetRowIndex, 0, { id: uuidv4(), fields: [sourceField!] });
                    }
                }
            });

            return newForm;
        });
    };

    const handleAddSection = () => {
        const newSection: FormSection = {
            id: uuidv4(),
            title: 'New Section',
            rows: []
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
                    rows: []
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
                    section.rows.forEach(row => {
                        const fieldIndex = row.fields.findIndex(f => f.id === fieldId);
                        if (fieldIndex !== -1) {
                            row.fields[fieldIndex] = { ...row.fields[fieldIndex], ...updates };
                        }
                    });
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
                    section.rows.forEach(row => {
                        row.fields = row.fields.filter(f => f.id !== fieldId);
                    });
                    // Cleanup empty rows
                    section.rows = section.rows.filter(row => row.fields.length > 0);
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
            // For simplicity, moveField in a multi-column setup is complex. 
            // We'll treat it as moving the field within its row or across rows if needed.
            // But usually, drag and drop is preferred. Let's keep it moving between rows for now.
            let sourceRowIdx = -1;
            let sourceColIdx = -1;
            let section: FormSection | null = null;

            newForm.pages.forEach(page => {
                page.sections.forEach(s => {
                    s.rows.forEach((row, rIdx) => {
                        const cIdx = row.fields.findIndex(f => f.id === fieldId);
                        if (cIdx !== -1) {
                            sourceRowIdx = rIdx;
                            sourceColIdx = cIdx;
                            section = s;
                        }
                    });
                });
            });

            if (section) {
                const s = section as FormSection;
                const newRowIndex = direction === 'up' ? sourceRowIdx - 1 : sourceRowIdx + 1;
                if (newRowIndex >= 0 && newRowIndex < s.rows.length) {
                    const field = s.rows[sourceRowIdx].fields.splice(sourceColIdx, 1)[0];
                    s.rows[newRowIndex].fields.push(field);
                    // Cleanup
                    if (s.rows[sourceRowIdx].fields.length === 0) {
                        s.rows.splice(sourceRowIdx, 1);
                    }
                }
            }
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
                section.rows.forEach(row => {
                    row.fields.forEach(field => {
                        if (field.id === selectedElementId) selectedElement = { type: 'field', data: field };
                    });
                });
            });
        });
    }

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-950">
            {/* Header / Navbar */}
            <header className="flex justify-between items-center w-full px-4 py-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <input 
                        value={form.title} 
                        onChange={(e) => setForm(prev => ({...prev, title: e.target.value}))}
                        className="text-lg font-semibold bg-transparent border-none focus:ring-0 text-white p-0"
                    />
                </div>
                
                {form.pages.length > 1 && (
                    <div className="flex gap-2">
                       {form.pages.map((page, index) => (
                           <button 
                               key={page.id}
                               onClick={() => setActivePageId(page.id)}
                               className={`px-3 py-1 rounded text-sm transition-colors ${activePageId === page.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'text-zinc-400 hover:text-white'}`}
                           >
                               Page {index + 1}
                           </button>
                       ))}
                    </div>
                )}

                <button 
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                    Save Form
                </button>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar 
                    form={form}
                    onAddField={handleAddField} 
                    onAddSection={handleAddSection} 
                    onAddPage={handleAddPage}
                    onSelectElement={setSelectedElementId}
                    selectedId={selectedElementId}
                />
                
                <div 
                    className="flex-1 bg-zinc-900/50 p-8 overflow-y-auto" 
                    onClick={() => setSelectedElementId(null)}
                >
                    <Canvas 
                        page={form.pages[activePageIndex]} 
                        selectedId={selectedElementId}
                        onSelect={(id: string) => {
                            setSelectedElementId(id);
                            setIsRightSidebarOpen(true);
                        }}
                        onDrop={(type: FieldType, sectionId?: string, index?: number) => handleAddField(type, sectionId, index)}
                        onReorderField={handleReorderField}
                        onMoveField={moveField}
                        onMoveSection={moveSection}
                        onMoveSectionUp={(id: string) => moveSection(id, 'up')}
                        onMoveSectionDown={(id: string) => moveSection(id, 'down')}
                    />
                </div>
                
                {isRightSidebarOpen && (
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
                        onClose={() => setIsRightSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default FormBuilder;
