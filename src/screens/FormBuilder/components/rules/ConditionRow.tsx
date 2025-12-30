
import React from 'react';
import { RuleCondition, RuleOperator, FormField } from '../../../../types/form-builder';
import { Select } from '../../../../components/select';
import { Input } from '../../../../components/input';
import { Button } from '../../../../components/button';

interface ConditionRowProps {
    condition: RuleCondition;
    fields: FormField[];
    onChange: (updates: Partial<RuleCondition>) => void;
    onRemove: () => void;
}

const OPERATORS: { value: RuleOperator; label: string }[] = [
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    // { value: 'in', label: 'In' }, // excluded for now
    { value: 'gt', label: 'Greater Than' },
    { value: 'gte', label: 'Greater/Equal' },
    { value: 'lt', label: 'Less Than' },
    { value: 'lte', label: 'Less/Equal' },
    { value: 'isEmpty', label: 'Is Empty' },
    { value: 'isNotEmpty', label: 'Is Not Empty' },
];

export const ConditionRow: React.FC<ConditionRowProps> = ({ condition, fields, onChange, onRemove }) => {
    const selectedField = fields.find(f => f.id === condition.fieldId);

    const handleValueChange = (val: any) => {
        onChange({ value: val });
    };

    const renderValueInput = () => {
        if (!selectedField) return null;
        if (['isEmpty', 'isNotEmpty'].includes(condition.operator)) return null;

        switch (selectedField.type) {
            case 'number':
                return (
                    <Input
                        type="number"
                        value={condition.value || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder="Value"
                        className="min-w-[150px]"
                    />
                );
            case 'select':
            case 'radio':
                return (
                    <Select
                        value={condition.value || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="min-w-[150px]"
                    >
                        <option value="">Select option</option>
                        {selectedField.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                );
            case 'checkbox':
                // Checkbox usually means boolean toggle context?
                // Or if it's a checkbox group...
                // existing types say: options for checkbox.
                // If it's single checkbox (boolean), options might be undefined?
                // Assuming it works like select for now if options exist.
                if (selectedField.options && selectedField.options.length > 0) {
                     return (
                        <Select
                            value={condition.value || ''}
                            onChange={(e) => handleValueChange(e.target.value)}
                            className="min-w-[150px]"
                        >
                            <option value="">Select option</option>
                             {selectedField.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                    );
                }
                 return (
                    <Select
                        value={String(condition.value)}
                        onChange={(e) => handleValueChange(e.target.value === 'true')}
                        className="min-w-[150px]"
                    >
                        <option value="true">Checked</option>
                        <option value="false">Unchecked</option>
                    </Select>
                );
            case 'date':
                return (
                    <Input
                        type="date"
                        value={condition.value || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="min-w-[150px]"
                    />
                );
            default:
                return (
                    <Input
                        type="text"
                        value={condition.value || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder="Value"
                        className="min-w-[150px]"
                    />
                );
        }
    };

    return (
        <div className="flex flex-wrap gap-2 items-center bg-white/5 p-2 rounded-md">
            <div className="w-1/3 min-w-[150px]">
                <Select
                    value={condition.fieldId}
                    onChange={(e) => onChange({ fieldId: e.target.value, value: undefined })} // reset value on field change
                >
                    <option value="" disabled>Select Field</option>
                    {fields.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                </Select>
            </div>

            <div className="w-[140px]">
                <Select
                    value={condition.operator}
                    onChange={(e) => onChange({ operator: e.target.value as RuleOperator })}
                >
                    {OPERATORS.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                </Select>
            </div>

            <div className="flex-1">
                {renderValueInput()}
            </div>

            <Button plain onClick={onRemove} className="text-red-400 hover:text-red-300">
                &times;
            </Button>
        </div>
    );
};
