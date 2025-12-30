
import { useState } from 'react';
import { useFormBuilderStore } from '../../../../store/formBuilderStore';
import { Rule, FormPage, FormField } from '../../../../types/form-builder';
import { RuleEditor } from './RuleEditor';
import { Button } from '../../../../components/button';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '../../../../components/dialog';

// Helper to flatten fields
const getAllFields = (pages: FormPage[]): FormField[] => {
    const fields: FormField[] = [];
    pages.forEach(page => {
        page.sections.forEach(section => {
            section.rows.forEach(row => {
                row.fields.forEach(field => {
                    fields.push(field);
                });
            });
        });
    });
    return fields;
};

export const RulesSidebar = () => {
    const pages = useFormBuilderStore(state => state.form.pages);
    const rules = useFormBuilderStore(state => state.form.rules) || [];
    const addRule = useFormBuilderStore(state => state.addRule);
    const updateRule = useFormBuilderStore(state => state.updateRule);
    const deleteRule = useFormBuilderStore(state => state.deleteRule);

    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

    const fields = getAllFields(pages);

    const handleCreateRule = () => {
        const newRule: Rule = {
            id: uuidv4(),
            title: `Rule ${rules.length + 1}`,
            conditions: {
                id: uuidv4(),
                combinator: 'and',
                conditions: []
            },
            actions: []
        };
        addRule(newRule);
        setEditingRuleId(newRule.id);
    };

    const editingRule = rules.find(r => r.id === editingRuleId);

    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {rules.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500">
                            <p>No rules defined yet.</p>
                            <Button color="blue" onClick={handleCreateRule} className="mt-4">
                                Create First Rule
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {rules.map(rule => (
                                <div key={rule.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                                    <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={() => setEditingRuleId(rule.id)}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate font-medium group-hover:text-zinc-900 dark:group-hover:text-white">
                                            {rule.title || 'Untitled Rule'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                        <button 
                                            onClick={() => setEditingRuleId(rule.id)}
                                            className="p-1 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                            title="Edit Rule"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => deleteRule(rule.id)}
                                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            title="Delete Rule"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="p-4 border-t border-zinc-200 dark:border-white/10">
                    <Button color="blue" onClick={handleCreateRule} className="w-full">
                        + Add New Rule
                    </Button>
                </div>
            </div>

            <Dialog open={!!editingRuleId} onClose={() => setEditingRuleId(null)} size="3xl">
                <DialogTitle>Edit Rule</DialogTitle>
                <DialogBody className="min-h-[60vh]">
                     {editingRule && (
                        <RuleEditor
                            rule={editingRule}
                            fields={fields}
                            onChange={(updated) => updateRule(editingRuleId!, updated)}
                        />
                     )}
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => setEditingRuleId(null)}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
