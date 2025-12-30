import React from 'react';
import { Input } from '../../../components/input';
import { Switch } from '../../../components/switch';
import { Textarea } from '../../../components/textarea';

interface PropertiesPanelProps {
    selectedElement: { type: 'field' | 'section' | 'page' | 'form', data: any } | null;
    onUpdate: (updates: any) => void; // Using any for simplicity for now, refine later
}

const PropertiesPanel = ({ selectedElement, onUpdate }: PropertiesPanelProps) => {
    if (!selectedElement) {
        return (
            <div className="p-4">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Properties</h2>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Select an element on the canvas to edit its properties.
                    </p>
                </div>
            </div>
        );
    }

    const { type, data } = selectedElement;

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 pb-2">
                Edit {type.charAt(0).toUpperCase() + type.slice(1)}
            </h2>

            {type === 'field' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Label</label>
                        <Input 
                            value={data.label} 
                            onChange={(e) => onUpdate({ label: e.target.value })} 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Placeholder</label>
                        <Input 
                            value={data.placeholder || ''} 
                            onChange={(e) => onUpdate({ placeholder: e.target.value })} 
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Required</label>
                        <Switch 
                            checked={data.required} 
                            onChange={(checked) => onUpdate({ required: checked })} 
                        />
                    </div>

                    {['select', 'radio', 'checkbox'].includes(data.type) && (
                         <div>
                            <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Options</label>
                            <div className="space-y-2">
                                {data.options?.map((opt: any, idx: number) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input 
                                            value={opt.label} 
                                            onChange={(e) => {
                                                const newOptions = [...data.options];
                                                newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                                onUpdate({ options: newOptions });
                                            }}
                                            placeholder="Label"
                                        />
                                        <Input 
                                            value={opt.value} 
                                             onChange={(e) => {
                                                const newOptions = [...data.options];
                                                newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                                                onUpdate({ options: newOptions });
                                            }}
                                            placeholder="Value"
                                        />
                                    </div>
                                ))}
                                <button 
                                    onClick={() => onUpdate({ options: [...(data.options || []), { label: 'New Option', value: 'new-option' }]})}
                                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
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
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Title</label>
                        <Input 
                            value={data.title} 
                            onChange={(e) => onUpdate({ title: e.target.value })} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase mb-1">Description</label>
                        <Textarea 
                            value={data.description || ''} 
                            onChange={(e) => onUpdate({ description: e.target.value })} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertiesPanel;
