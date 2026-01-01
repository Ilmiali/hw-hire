import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from 'zustand';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { FormField } from '../../types/form-builder';
import { LeftSidebar } from './components/LeftSidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFormById, saveFormDraft, publishForm, clearCurrentForm, fetchFormDraft } from '../../store/slices/formsSlice';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { 
    ChevronLeftIcon, 
    PlusIcon, 
    UsersIcon,
    EyeIcon,
    ArrowDownOnSquareIcon,
    RocketLaunchIcon
} from '@heroicons/react/20/solid';
import FormBuilderSkeleton from './components/FormBuilderSkeleton';
import FormSettingsDialog from './components/FormSettingsDialog';

const FormBuilder = () => {
    const { orgId, formId } = useParams<{ orgId: string; formId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const { currentForm, currentVersion } = useSelector((state: RootState) => state.forms);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Access zustand state
    const form = useFormBuilderStore(state => state.form);
    const activePageId = useFormBuilderStore(state => state.activePageId);
    const selectedElementId = useFormBuilderStore(state => state.selectedElementId);
    const isRightSidebarOpen = useFormBuilderStore(state => state.sidebarOpen);

    // Access actions
    const setForm = useFormBuilderStore(state => state.setForm);
    const setTitle = useFormBuilderStore(state => state.setTitle);
    const setActivePageId = useFormBuilderStore(state => state.setActivePageId);
    const setSelectedElementId = useFormBuilderStore(state => state.setSelectedElementId);
    const setSidebarOpen = useFormBuilderStore(state => state.setSidebarOpen);
    
    // Form actions
    const addField = useFormBuilderStore(state => state.addField);
    const updateField = useFormBuilderStore(state => state.updateField);
    const deleteField = useFormBuilderStore(state => state.deleteField);
    const duplicateField = useFormBuilderStore(state => state.duplicateField);
    const updateSection = useFormBuilderStore(state => state.updateSection);
    const deleteSection = useFormBuilderStore(state => state.deleteSection);
    const duplicateSection = useFormBuilderStore(state => state.duplicateSection);
    const updatePage = useFormBuilderStore(state => state.updatePage);
    const deletePage = useFormBuilderStore(state => state.deletePage);
    const duplicatePage = useFormBuilderStore(state => state.duplicatePage);
    const reorderField = useFormBuilderStore(state => state.reorderField);
    const reorderSection = useFormBuilderStore(state => state.reorderSection);
    const reorderPage = useFormBuilderStore(state => state.reorderPage);
    const addFieldToRepeat = useFormBuilderStore(state => state.addFieldToRepeat);
    const addSection = useFormBuilderStore(state => state.addSection);
    const addPage = useFormBuilderStore(state => state.addPage);

    // Load form data
    useEffect(() => {
        if (orgId && formId) {
            dispatch(fetchFormById({ orgId, formId }));
        }
        return () => {
			dispatch(clearCurrentForm());
            // Reset the zustand store so next time we open a form it doesn't flash the old one
            useFormBuilderStore.getState().reset();
        };
    }, [dispatch, orgId, formId]);

    useEffect(() => {
        if (orgId && formId) {
            dispatch(fetchFormDraft({ orgId, formId }));
        }
    }, [dispatch, orgId, formId]);

    useEffect(() => {
        if (currentVersion?.data) {
            setForm(currentVersion.data);
            // Favor currentForm.name for the title if available
            if (currentForm) {
                setTitle(currentForm.name);
            } else if (currentVersion.data.title) {
                setTitle(currentVersion.data.title);
            }
        } else if (currentForm) {
            // Fallback if no version found (should be rare now with createForm fix)
            setForm({
                id: formId!,
                title: currentForm.name,
                pages: [
                    {
                        id: 'page-1',
                        title: 'Page 1',
                        sections: []
                    }
                ],
                rules: []
            });
            setTitle(currentForm.name);
        }
    }, [currentVersion, currentForm, setForm, setTitle, formId]);

    const handleSave = async () => {
        if (!orgId || !formId) return;
        setIsSaving(true);
        try {
            // Ensure title is up to date in the form object before saving
            // (Zustand store should be up to date, but just in case)
            await dispatch(saveFormDraft({ orgId, formId, data: form })).unwrap();
            toast.success('Form draft saved!');
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error('Failed to save: ' + (error?.message || error || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!orgId || !formId) return;
        setIsPublishing(true);
        try {
            await dispatch(saveFormDraft({ orgId, formId, data: form })).unwrap();
            await dispatch(publishForm({ orgId, formId })).unwrap();
            toast.success('Form published successfully!');
        } catch (error: any) {
            toast.error('Failed to publish: ' + error.message);
        } finally {
            setIsPublishing(false);
        }
    };
    
    // Temporal (Undo/Redo)
    const temporalStore = useFormBuilderStore.temporal;
    const { undo: handleUndo, redo: handleRedo } = temporalStore.getState();
    const pastStatesLength = useStore(temporalStore, (state: any) => state.pastStates.length);
    const futureStatesLength = useStore(temporalStore, (state: any) => state.futureStates.length);

    // Helpers to find current page index
    const activePageIndex = Math.max(0, form.pages.findIndex(p => p.id === activePageId));

    // Find the selected object for the properties panel
    let selectedElement: { type: 'field' | 'section' | 'page' | 'form', data: any } | null = null;
    
    const findFieldRecursive = (fields: FormField[]): FormField | null => {
        for (const field of fields) {
            if (field.id === selectedElementId) return field;
            if (field.fields) {
                const found = findFieldRecursive(field.fields);
                if (found) return found;
            }
        }
        return null;
    };

    if (selectedElementId) {
        form.pages.forEach(page => {
            if (page.id === selectedElementId) selectedElement = { type: 'page', data: page };
            page.sections.forEach(section => {
                if (section.id === selectedElementId) selectedElement = { type: 'section', data: section };
                section.rows.forEach(row => {
                    const foundField = findFieldRecursive(row.fields);
                    if (foundField) selectedElement = { type: 'field', data: foundField };
                });
            });
        });
    }

    const isInitialized = useFormBuilderStore(state => state.isInitialized);

    // Access global loading state
    const { loading, error } = useSelector((state: RootState) => state.forms);

    // Show skeleton if:
    // 1. Redux is fetching (loading=true)
    // 2. OR The form stores hasn't been initialized yet (isInitialized=false)
    // BUT only if there isn't an error (so we can show the error state)
    if ((loading || !isInitialized)) {
        return (
            <FormBuilderSkeleton />
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            {/* Header / Navbar */}
            <header className="flex justify-between items-center w-full px-4 py-2 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate(`/orgs/${orgId}/forms`)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                        title="Back to Forms"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <input 
                        value={form.title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-white p-0 ml-2"
                    />
                    <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-white/10 pl-4 ml-4">
                        <button
                            onClick={() => handleUndo()}
                            disabled={pastStatesLength === 0}
                            className={`p-1.5 rounded transition-colors ${pastStatesLength > 0 ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10' : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'}`}
                            title="Undo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                        </button>
                        <button
                            onClick={() => handleRedo()}
                            disabled={futureStatesLength === 0}
                            className={`p-1.5 rounded transition-colors ${futureStatesLength > 0 ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10' : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'}`}
                            title="Redo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-2 bg-zinc-100/50 dark:bg-white/5 p-1 rounded-lg border border-zinc-200 dark:border-white/10">
                   {form.pages.map((page, index) => (
                       <button 
                           key={page.id}
                           onClick={() => setActivePageId(page.id)}
                           className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activePageId === page.id ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-sm border border-zinc-200 dark:border-white/10' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
                       >
                           {page.title}
                       </button>
                   ))}
                   <button
                       onClick={() => addPage()}
                       className="px-2 py-1 rounded-md text-zinc-400 hover:text-blue-600 hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center gap-1 group"
                       title="Add New Page"
                   >
                       <PlusIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                       {form.pages.length === 1 && <span className="text-xs font-semibold uppercase tracking-wider pr-1">Add Page</span>}
                   </button>
                </div>
                
                <div className="flex gap-2">
                    <Button 
                         variant="ghost"
                         size="icon"
                         onClick={() => setIsSettingsOpen(true)}
                         className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                         title="Sharing"
                     >
                         <UsersIcon className="w-4 h-4" />
                     </Button>
                    <Button 
                        variant="ghost"
                        onClick={() => navigate(`/orgs/${orgId}/forms/${formId}/preview`)}
                        className="h-9 px-4 text-sm font-medium hover:bg-muted/50 border border-transparent hover:border-border/40 rounded-lg transition-all"
                    >
                        <EyeIcon className="mr-2 h-4 w-4 opacity-70" />
                        Preview
                    </Button>
                    <Button 
                        variant="secondary"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-9 px-4 text-sm font-medium bg-secondary/50 hover:bg-secondary/80 border border-border/40 rounded-lg transition-all"
                    >
                        {isSaving ? (
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-2" />
                        ) : (
                           <ArrowDownOnSquareIcon className="mr-2 h-4 w-4 opacity-70" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="h-9 px-4 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 rounded-lg transition-all"
                    >
                        {isPublishing ? (
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                        ) : (
                           <RocketLaunchIcon className="mr-2 h-4 w-4" />
                        )}
                        {isPublishing ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar 
                    form={form}
                    onAddSection={addSection} 
                    onAddPage={addPage}
                    onSelectElement={(id) => {
                        setSelectedElementId(id);
                        const findInFields = (fields: FormField[]): boolean => {
                            for (const field of fields) {
                                if (field.id === id) return true;
                                if (field.fields && findInFields(field.fields)) return true;
                            }
                            return false;
                        };

                        form.pages.forEach(page => {
                            let found = page.id === id;
                            if (!found) {
                                page.sections.forEach(section => {
                                    if (section.id === id) found = true;
                                    section.rows.forEach(row => {
                                        if (findInFields(row.fields)) found = true;
                                    });
                                });
                            }
                            if (found && activePageId !== page.id) {
                                setActivePageId(page.id);
                            }
                        });
                    }}
                    onDeleteElement={(id, type) => {
                        if (type === 'field') deleteField(id);
                        if (type === 'section') deleteSection(id);
                        if (type === 'page') deletePage(id);
                    }}
                    onDuplicateElement={(id, type) => {
                        if (type === 'field') duplicateField(id);
                        if (type === 'section') duplicateSection(id);
                        if (type === 'page') duplicatePage(id);
                    }}
                    onReorderPage={reorderPage}
                    onReorderSection={reorderSection}
                    onReorderField={reorderField}
                    selectedId={selectedElementId}
                />
                
                <div 
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-8 overflow-y-auto" 
                    onClick={() => setSelectedElementId(null)}
                >
                    <Canvas 
                        page={form.pages[activePageIndex]} 

                        selectedId={selectedElementId}
                        onUpdatePage={(updates: any) => updatePage(activePageId, updates)}
                        onSelect={(id: string) => {
                            setSelectedElementId(id);
                            setSidebarOpen(true);
                        }}
                        onDrop={addField}
                        onAddSection={addSection}
                        onDropToField={addFieldToRepeat}
                        onReorderField={reorderField}
                        onReorderSection={reorderSection}
                        onDelete={(id: string, type: 'field' | 'section') => {
                            if (type === 'field') deleteField(id);
                            if (type === 'section') deleteSection(id);
                        }}
                        onDuplicate={(id: string, type: 'field' | 'section') => {
                            if (type === 'field') duplicateField(id);
                            if (type === 'section') duplicateSection(id);
                        }}
                    />
                </div>
                
                {isRightSidebarOpen && (
                    <div className="w-80 shrink-0 border-l border-zinc-200 dark:border-white/10">
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
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                )}
            </div>

            <FormSettingsDialog 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                orgId={orgId!} 
                formId={formId!} 
            />
        </div>
    );
};

export default FormBuilder;
