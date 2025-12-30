
import React, { useState } from 'react';
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

export const RulesPanel: React.FC<{ onClose: () => void, isOpen: boolean }> = ({ onClose, isOpen }) => {
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
        <Dialog open={isOpen} onClose={onClose} size="3xl">
            <DialogTitle>{editingRuleId ? 'Edit Rule' : 'Manage Rules'}</DialogTitle>
            
            <DialogBody className="min-h-[60vh]">
                {editingRuleId && editingRule ? (
                    <div className="space-y-4">
                        <Button plain onClick={() => setEditingRuleId(null)} className="mb-4">
                            &larr; Back to Rules
                        </Button>
                        <RuleEditor
                            rule={editingRule}
                            fields={fields}
                            onChange={(updated) => updateRule(editingRuleId, updated)}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rules.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <p>No rules defined yet.</p>
                                <Button color="blue" onClick={handleCreateRule} className="mt-4">
                                    Create First Rule
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rules.map(rule => (
                                    <div key={rule.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                                        <div>
                                            <h4 className="font-semibold text-white">{rule.title || 'Untitled Rule'}</h4>
                                            <p className="text-xs text-zinc-400">
                                                {rule.actions?.length || 0} action(s)
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button outline onClick={() => setEditingRuleId(rule.id)}>
                                                Edit
                                            </Button>
                                            <Button plain onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-300">
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button color="blue" onClick={handleCreateRule} className="w-full mt-4">
                                    + Add New Rule
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </DialogBody>

            <DialogActions>
                {!editingRuleId && (
                    <Button plain onClick={onClose}>
                        Close
                    </Button>
                )}
                {editingRuleId && (
                    <Button color="blue" onClick={() => setEditingRuleId(null)}>
                        Done
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
