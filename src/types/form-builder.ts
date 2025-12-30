export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[]; // For select, radio, checkbox
  value?: string | number | boolean | string[]; // Default value or binding
}

export interface FormRow {
  id: string;
  fields: FormField[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  rows: FormRow[];
}

export interface FormPage {
  id: string;
  title: string;
  sections: FormSection[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  pages: FormPage[];
  rules: Rule[];
}

export type RuleOperator = 'eq' | 'neq' | 'contains' | 'in' | 'isEmpty' | 'isNotEmpty' | 'gt' | 'gte' | 'lt' | 'lte';

export interface RuleCondition {
  id: string;
  fieldId: string;
  operator: RuleOperator;
  value?: any; // Value to compare against
}

export interface RuleConditionGroup {
  id: string;
  combinator: 'and' | 'or';
  conditions: (RuleCondition | RuleConditionGroup)[];
}

export type RuleActionType = 'show' | 'hide' | 'require' | 'optional';

export interface RuleAction {
  id: string;
  type: RuleActionType;
  targetFieldId: string;
}

export interface Rule {
  id: string;
  title?: string; // Optional user-friendly name "Rule 1"
  conditions: RuleConditionGroup;
  actions: RuleAction[];
}
