
import React from 'react';
import { Rule, FormField } from '../../../../types/form-builder';
import { ConditionGroupEditor } from './ConditionGroupEditor';
import { ActionListEditor } from './ActionListEditor';
import { Input } from '../../../../components/input';
import { Heading } from '../../../../components/heading';

interface RuleEditorProps {
    rule: Rule;
    fields: FormField[];
    onChange: (updatedRule: Rule) => void;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ rule, fields, onChange }) => {
    
    return (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-white/5">
            <div className="space-y-2">
                <Heading level={3} className="text-zinc-900 dark:text-white">Rule Name</Heading>
                <Input
                    value={rule.title || ''}
                    onChange={(e) => onChange({ ...rule, title: e.target.value })}
                    placeholder="e.g. Show License Field"
                />
            </div>

            <div className="space-y-2">
                <Heading level={4} className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider font-semibold">When</Heading>
                <div className="bg-zinc-50 dark:bg-black/20 p-4 rounded-md border border-zinc-200 dark:border-white/5">
                    <ConditionGroupEditor
                        group={rule.conditions}
                        fields={fields}
                        onChange={(group) => onChange({ ...rule, conditions: group })}
                        isRoot
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Heading level={4} className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider font-semibold">Then</Heading>
                <div className="bg-zinc-50 dark:bg-black/20 p-4 rounded-md border border-zinc-200 dark:border-white/5">
                    <ActionListEditor
                        actions={rule.actions}
                        fields={fields}
                        onChange={(actions) => onChange({ ...rule, actions })}
                    />
                </div>
            </div>
        </div>
    );
};
