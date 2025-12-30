
import React from 'react';
import { RuleAction, RuleActionType, FormField } from '../../../../types/form-builder';
import { Select } from '../../../../components/select';
import { Button } from '../../../../components/button';
import { v4 as uuidv4 } from 'uuid';

interface ActionListEditorProps {
    actions: RuleAction[];
    fields: FormField[];
    onChange: (actions: RuleAction[]) => void;
}

const ACTION_TYPES: { value: RuleActionType; label: string }[] = [
    { value: 'show', label: 'Show' },
    { value: 'hide', label: 'Hide' },
    { value: 'require', label: 'Require' },
    { value: 'optional', label: 'Make Optional' },
];

export const ActionListEditor: React.FC<ActionListEditorProps> = ({ actions, fields, onChange }) => {
    
    const addAction = () => {
        onChange([
            ...actions,
            { id: uuidv4(), type: 'show', targetFieldId: fields[0]?.id || '' }
        ]);
    };

    const updateAction = (index: number, updates: Partial<RuleAction>) => {
        const newActions = [...actions];
        newActions[index] = { ...newActions[index], ...updates };
        onChange(newActions);
    };

    const removeAction = (index: number) => {
        const newActions = [...actions];
        newActions.splice(index, 1);
        onChange(newActions);
    };

    return (
        <div className="space-y-2">
            {actions.map((action, index) => (
                <div key={action.id} className="flex gap-2 items-center bg-white/5 p-2 rounded-md">
                    <span className="text-zinc-400 text-sm font-medium w-12">THEN</span>
                    
                    <div className="w-[120px]">
                        <Select
                            value={action.type}
                            onChange={(e) => updateAction(index, { type: e.target.value as RuleActionType })}
                        >
                            {ACTION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Select
                            value={action.targetFieldId}
                            onChange={(e) => updateAction(index, { targetFieldId: e.target.value })}
                        >
                            <option value="" disabled>Select Field</option>
                            {fields.map(f => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                        </Select>
                    </div>

                    <Button plain onClick={() => removeAction(index)} className="text-red-400 hover:text-red-300">
                        &times;
                    </Button>
                </div>
            ))}
            
            <Button outline onClick={addAction} className="w-full text-zinc-400 border-dashed border-zinc-700 hover:border-zinc-500 hover:text-zinc-200">
                + Add Action
            </Button>
        </div>
    );
};
