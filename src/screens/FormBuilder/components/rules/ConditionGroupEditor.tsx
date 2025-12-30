
import React from 'react';
import { RuleConditionGroup, RuleCondition, FormField } from '../../../../types/form-builder';
import { ConditionRow } from './ConditionRow';
import { Select } from '../../../../components/select';
import { Button } from '../../../../components/button';
import { v4 as uuidv4 } from 'uuid';

interface ConditionGroupEditorProps {
    group: RuleConditionGroup;
    fields: FormField[];
    onChange: (group: RuleConditionGroup) => void;
    onRemove?: () => void;
    isRoot?: boolean;
}

export const ConditionGroupEditor: React.FC<ConditionGroupEditorProps> = ({ 
    group, 
    fields, 
    onChange, 
    onRemove,
    isRoot = false 
}) => {
    
    const handleAddCondition = () => {
        const newCondition: RuleCondition = {
            id: uuidv4(),
            fieldId: fields[0]?.id || '',
            operator: 'eq',
            value: ''
        };
        onChange({
            ...group,
            conditions: [...group.conditions, newCondition]
        });
    };

    const handleAddGroup = () => {
        const newGroup: RuleConditionGroup = {
            id: uuidv4(),
            combinator: 'and',
            conditions: []
        };
        onChange({
            ...group,
            conditions: [...group.conditions, newGroup]
        });
    };

    const updateItem = (index: number, newItem: RuleCondition | RuleConditionGroup) => {
        const newConditions = [...group.conditions];
        newConditions[index] = newItem;
        onChange({ ...group, conditions: newConditions });
    };

    const removeItem = (index: number) => {
        const newConditions = [...group.conditions];
        newConditions.splice(index, 1);
        onChange({ ...group, conditions: newConditions });
    };

    return (
        <div className={`space-y-3 ${!isRoot ? 'border-l-2 border-zinc-700 pl-4 ml-1 my-2' : ''}`}>
            {/* Group Header */}
            <div className="flex items-center gap-2">
                <div className="w-[80px]">
                    <Select
                        value={group.combinator}
                        onChange={(e) => onChange({ ...group, combinator: e.target.value as 'and' | 'or' })}
                        className={group.combinator === 'and' ? 'bg-blue-900/20 text-blue-300' : 'bg-orange-900/20 text-orange-300'}
                    >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                    </Select>
                </div>
                
                {!isRoot && onRemove && (
                    <Button plain onClick={onRemove} className="text-red-400 hover:text-red-300 ml-auto">
                        Remove Group
                    </Button>
                )}
            </div>

            {/* Conditions List */}
            <div className="space-y-2">
                {group.conditions.map((item, index) => {
                    if ('combinator' in item) {
                        // It's a group
                        return (
                            <ConditionGroupEditor
                                key={item.id}
                                group={item}
                                fields={fields}
                                onChange={(updatedGroup) => updateItem(index, updatedGroup)}
                                onRemove={() => removeItem(index)}
                            />
                        );
                    } else {
                        // It's a condition
                        return (
                            <ConditionRow
                                key={item.id}
                                condition={item}
                                fields={fields}
                                onChange={(updates) => updateItem(index, { ...item, ...updates })}
                                onRemove={() => removeItem(index)}
                            />
                        );
                    }
                })}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2">
                <Button outline onClick={handleAddCondition} className="text-xs py-1">
                    + Condition
                </Button>
                <Button outline onClick={handleAddGroup} className="text-xs py-1">
                    + Group
                </Button>
            </div>
        </div>
    );
};
