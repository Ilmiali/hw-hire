import React from 'react';
import { FormField, ValidationRule, TextValidationSpec, NumberValidationSpec, DateValidationSpec, CheckboxValidationSpec } from '../../../../types/form-builder';
import { Input } from '../../../../components/input';
import { Switch } from '../../../../components/switch';
import { Label, Field } from '../../../../components/fieldset';

interface ValidationPanelProps {
    field: FormField;
    onUpdate: (updates: Partial<FormField>) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ field, onUpdate }) => {
    
    // Helper to update specific validation rule
    const updateRule = (key: string, rulePart: Partial<ValidationRule<any>> | undefined) => {
        // rulePart undefined means remove it
        const currentValidation = field.validation || {};
        const currentRule = (currentValidation as any)[key] || {};

        let newRule: any = undefined;
        
        if (rulePart !== undefined) {
             newRule = { ...currentRule, ...rulePart };
             // If value is empty/undefined and we are not just setting message, might want to remove?
             // But let's rely on strict passing.
        }

        const newValidation = {
            ...currentValidation,
            [key]: newRule
        };

        // specialized handling for pattern which is not ValidationRule<T> exactly but similar
        if (key === 'pattern' && rulePart) {
             // ensure pattern matches structure
        }

        onUpdate({ validation: newValidation });
    };

    const RuleField = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
        <Field className="flex flex-col gap-1 mb-2">
            <Label className="text-xs text-zinc-500 font-medium">{label}</Label>
            <Input 
                type={type} 
                value={value ?? ''} 
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="!text-sm !py-1"
            />
        </Field>
    );
     
    const RuleSwitch = ({ label, checked, onChange }: any) => (
        <Field className="flex items-center justify-between mb-2">
            <Label className="text-xs text-zinc-500 font-medium">{label}</Label>
            <Switch checked={checked || false} onChange={onChange} />
        </Field>
    );
    
    const MessageInput = ({ value, onChange }: any) => (
         <Input 
            placeholder="Custom error message..." 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            className="!text-xs !py-1 !mt-1 opacity-70 hover:opacity-100 transition-opacity"
        />
    );

    const renderTextValidation = () => {
        const rules = (field.validation as TextValidationSpec) || {};
        return (
            <div className="space-y-4">
                 <div>
                    <div className="grid grid-cols-2 gap-2">
                         <div>
                            <RuleField 
                                label="Min Length" 
                                type="number" 
                                value={rules.minLength?.value} 
                                onChange={(val: number) => updateRule('minLength', { value: val })} 
                            />
                            {rules.minLength?.value !== undefined && (
                                <MessageInput value={rules.minLength?.message} onChange={(val: string) => updateRule('minLength', { value: rules.minLength?.value, message: val })} />
                            )}
                         </div>
                         <div>
                            <RuleField 
                                label="Max Length" 
                                type="number" 
                                value={rules.maxLength?.value} 
                                onChange={(val: number) => updateRule('maxLength', { value: val })} 
                            />
                            {rules.maxLength?.value !== undefined && (
                                <MessageInput value={rules.maxLength?.message} onChange={(val: string) => updateRule('maxLength', { value: rules.maxLength?.value, message: val })} />
                            )}
                         </div>
                    </div>
                 </div>

                 <div className="border-t border-zinc-100 dark:border-white/5 pt-2">
                     <RuleField 
                        label="Regex Pattern" 
                        placeholder="^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"
                        value={rules.pattern?.value} 
                        onChange={(val: string) => {
                             if (!val) updateRule('pattern', undefined);
                             else updateRule('pattern', { value: val });
                        }} 
                    />
                    {rules.pattern?.value && (
                        <MessageInput value={rules.pattern?.message} onChange={(val: string) => updateRule('pattern', { value: rules.pattern?.value, message: val })} />
                    )}
                 </div>
            </div>
        );
    };

    const renderNumberValidation = () => {
        const rules = (field.validation as NumberValidationSpec) || {};
        return (
             <div className="grid grid-cols-2 gap-2">
                <div>
                    <RuleField 
                        label="Min Value" 
                        type="number" 
                        value={rules.min?.value} 
                        onChange={(val: number) => updateRule('min', { value: val })} 
                    />
                     {rules.min?.value !== undefined && (
                        <MessageInput value={rules.min?.message} onChange={(val: string) => updateRule('min', { value: rules.min?.value, message: val })} />
                    )}
                </div>
                <div>
                    <RuleField 
                        label="Max Value" 
                        type="number" 
                        value={rules.max?.value} 
                        onChange={(val: number) => updateRule('max', { value: val })} 
                    />
                     {rules.max?.value !== undefined && (
                        <MessageInput value={rules.max?.message} onChange={(val: string) => updateRule('max', { value: rules.max?.value, message: val })} />
                    )}
                </div>
            </div>
        );
    };

    const renderDateValidation = () => {
         const rules = (field.validation as DateValidationSpec) || {};
         return (
             <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-2">
                    <div>
                        <RuleField 
                            label="Min Date" 
                            type="date" 
                            value={rules.minDate?.value} 
                            onChange={(val: string) => updateRule('minDate', { value: val })} 
                        />
                         {rules.minDate?.value && (
                            <MessageInput value={rules.minDate?.message} onChange={(val: string) => updateRule('minDate', { value: rules.minDate?.value, message: val })} />
                        )}
                    </div>
                    <div>
                         <RuleField 
                            label="Max Date" 
                            type="date" 
                            value={rules.maxDate?.value} 
                            onChange={(val: string) => updateRule('maxDate', { value: val })} 
                        />
                         {rules.maxDate?.value && (
                            <MessageInput value={rules.maxDate?.message} onChange={(val: string) => updateRule('maxDate', { value: rules.maxDate?.value, message: val })} />
                        )}
                    </div>
                 </div>
                 <div className="border-t border-zinc-100 dark:border-white/5 pt-2">
                     <RuleSwitch 
                        label="Disallow Future Dates"
                        checked={rules.disallowFuture?.value}
                        onChange={(checked: boolean) => updateRule('disallowFuture', { value: checked })}
                     />
                 </div>
             </div>
         );
    };

    const renderCheckboxValidation = () => {
         const rules = (field.validation as CheckboxValidationSpec) || {};
         // Only relevant for single checkbox usually
         return (
             <div>
                  <RuleSwitch 
                        label="Must Be Checked"
                        checked={rules.mustBeTrue?.value}
                        onChange={(checked: boolean) => updateRule('mustBeTrue', { value: checked })}
                     />
                 {rules.mustBeTrue?.value && (
                    <MessageInput value={rules.mustBeTrue?.message} onChange={(val: string) => updateRule('mustBeTrue', { value: rules.mustBeTrue?.value, message: val })} />
                 )}
             </div>
         );
    };

    const renderContent = () => {
        switch (field.type) {
            case 'text':
            case 'textarea':
            case 'email':
                return renderTextValidation();
            case 'number':
                return renderNumberValidation();
            case 'date':
                return renderDateValidation();
            case 'checkbox':
                // Only show if not a group? 
                if (!field.options || field.options.length === 0) {
                     return renderCheckboxValidation();
                }
                return <div className="text-xs text-zinc-500">Validation not available for checkbox groups yet.</div>;
            default:
                return <div className="text-xs text-zinc-500">No specific validation options for this field type.</div>;
        }
    };

    return (
        <div className="mt-6 border-t border-zinc-200 dark:border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Validation Rules</h3>
            {renderContent()}
        </div>
    );
};
