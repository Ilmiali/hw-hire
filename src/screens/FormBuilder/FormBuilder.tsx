import { useNavigate } from 'react-router-dom';
import { useStore } from 'zustand';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { LeftSidebar } from './components/LeftSidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';

const FormBuilder = () => {
    // Access state
    const navigate = useNavigate();
    const form = useFormBuilderStore(state => state.form);
    const activePageId = useFormBuilderStore(state => state.activePageId);
    const selectedElementId = useFormBuilderStore(state => state.selectedElementId);
    const isRightSidebarOpen = useFormBuilderStore(state => state.sidebarOpen);

    // Access actions
    const setTitle = useFormBuilderStore(state => state.setTitle);
    const setActivePageId = useFormBuilderStore(state => state.setActivePageId);
    const setSelectedElementId = useFormBuilderStore(state => state.setSelectedElementId);
    const setSidebarOpen = useFormBuilderStore(state => state.setSidebarOpen);
    
    // Form actions
    const addField = useFormBuilderStore(state => state.addField);
    const updateField = useFormBuilderStore(state => state.updateField);
    const deleteField = useFormBuilderStore(state => state.deleteField);
    const reorderField = useFormBuilderStore(state => state.reorderField);
    
    const addSection = useFormBuilderStore(state => state.addSection);
    const updateSection = useFormBuilderStore(state => state.updateSection);
    const deleteSection = useFormBuilderStore(state => state.deleteSection);
    const reorderSection = useFormBuilderStore(state => state.reorderSection);
    
    const addPage = useFormBuilderStore(state => state.addPage);
    const updatePage = useFormBuilderStore(state => state.updatePage);
    const deletePage = useFormBuilderStore(state => state.deletePage);

    // Temporal (Undo/Redo)
    const temporalStore = useFormBuilderStore.temporal;
    const { undo: handleUndo, redo: handleRedo } = temporalStore.getState();
    const pastStatesLength = useStore(temporalStore, (state) => state.pastStates.length);
    const futureStatesLength = useStore(temporalStore, (state) => state.futureStates.length);

    // Helpers to find current page index
    const activePageIndex = Math.max(0, form.pages.findIndex(p => p.id === activePageId));

    const handleSave = () => {
        console.log('Form Schema:', JSON.stringify(form, null, 2));
        alert('Form saved! Check console for JSON.');
    };

    // Find the selected object for the properties panel
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

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-950">
            {/* Header / Navbar */}
            <header className="flex justify-between items-center w-full px-4 py-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <input 
                        value={form.title} 
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none focus:ring-0 text-white p-0"
                    />
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-4">
                        <button
                            onClick={() => handleUndo()}
                            disabled={pastStatesLength === 0}
                            className={`p-1.5 rounded transition-colors ${pastStatesLength > 0 ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-700 cursor-not-allowed'}`}
                            title="Undo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                        </button>
                        <button
                            onClick={() => handleRedo()}
                            disabled={futureStatesLength === 0}
                            className={`p-1.5 rounded transition-colors ${futureStatesLength > 0 ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-700 cursor-not-allowed'}`}
                            title="Redo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                        </button>
                    </div>
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
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate('/form-builder/preview')}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors border border-white/10"
                    >
                        Preview
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                        Save Form
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar 
                    form={form}
                    onAddSection={addSection} 
                    onAddPage={addPage}
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
                            setSidebarOpen(true);
                        }}
                        onDrop={addField}
                        onReorderField={reorderField}
                        onReorderSection={reorderSection}
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
                        onClose={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default FormBuilder;
