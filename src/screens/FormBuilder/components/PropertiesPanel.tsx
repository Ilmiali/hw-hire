import { Input } from '../../../components/input';
import { Switch } from '../../../components/switch';
import { Textarea } from '../../../components/textarea';
import { ValidationPanel } from './fields/ValidationPanel';

interface PropertiesPanelProps {
    selectedElement: { type: 'field' | 'section' | 'page' | 'form', data: any } | null;
    onUpdate: (updates: any) => void;
    onDelete?: () => void;
    onClose: () => void;
    hideHeader?: boolean;
}

const PropertiesPanel = ({ selectedElement, onUpdate, onDelete, onClose, hideHeader = false }: PropertiesPanelProps) => {
    if (!selectedElement) {
        return (
            <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 mt-20">
                <p>Select an element to edit properties</p>
            </div>
        );
    }

    const { type, data } = selectedElement;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 w-full">
             {!hideHeader && (
                 <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/10">
                    <h2 className="text-sm font-semibold capitalize text-zinc-900 dark:text-white">
                        {type} Properties
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
             )}
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">



            {type === 'field' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Label</label>
                        <Input value={data.label} onChange={(e) => onUpdate({ label: e.target.value })} />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Placeholder</label>
                        <Input value={data.placeholder || ''} onChange={(e) => onUpdate({ placeholder: e.target.value })} />
                    </div>

                    <div className="flex items-center justify-between">
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Required</label>
                         <Switch checked={data.required} onChange={(checked) => onUpdate({ required: checked })} />
                    </div>

                    {/* Validation Panel */}
                    <ValidationPanel field={data} onUpdate={onUpdate} />

                    {['select', 'radio', 'checkbox'].includes(data.type) && (
                        <div>
                             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Options</label>
                             <div className="space-y-2">
                                 {data.options?.map((opt: any, idx: number) => (
                                     <div key={idx} className="flex gap-2">
                                         <Input 
                                             placeholder="Label"
                                             value={opt.label} 
                                             onChange={(e) => {
                                                 const newOptions = [...(data.options || [])];
                                                 newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                                 onUpdate({ options: newOptions });
                                             }} 
                                         />
                                         <Input 
                                             placeholder="Value"
                                             value={opt.value} 
                                             onChange={(e) => {
                                                 const newOptions = [...(data.options || [])];
                                                 newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                                                 onUpdate({ options: newOptions });
                                             }} 
                                         />
                                          <button 
                                             onClick={() => {
                                                 const newOptions = data.options.filter((_: any, i: number) => i !== idx);
                                                 onUpdate({ options: newOptions });
                                             }}
                                             className="text-red-500 hover:text-red-700"
                                         >
                                             ×
                                         </button>
                                     </div>
                                 ))}
                                 <button
                                     onClick={() => onUpdate({ options: [...(data.options || []), { label: 'New Option', value: 'new-option' }] })}
                                     className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                                 >
                                     + Add Option
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {type === 'section' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                        <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                        <Textarea value={data.description || ''} onChange={(e) => onUpdate({ description: e.target.value })} />
                    </div>
                </div>
            )}

            {type === 'page' && (
                <div className="space-y-4">
                    <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Title</label>
                         <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} />
                    </div>
                </div>
            )}

            {onDelete && (
                <div className="pt-6 border-t border-zinc-200 dark:border-white/10 mt-6">
                    <button 
                        onClick={onDelete}
                        className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                    >
                        Delete {type}
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};

export default PropertiesPanel;
