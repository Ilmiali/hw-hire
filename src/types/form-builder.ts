export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'multiselect' | 'paragraph' | 'divider' | 'spacer' | 'image' | 'repeat';

export interface ColorOption {
  id: string;
  type: 'solid' | 'gradient';
  value: string;
}

export interface FormLayout {
  cover?: ColorOption;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[]; // For select, radio, checkbox
  value?: string | number | boolean | string[]; // Default value or binding
  validation?: ValidationSpec;
  multiple?: boolean; // For file inputs
  content?: string; // For paragraph fields
  imageUrl?: string; // For image fields
  altText?: string;
  width?: string;
  height?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fields?: FormField[]; // For repeat fields
}

export type ValidationSpec = 
  | TextValidationSpec 
  | NumberValidationSpec 
  | DateValidationSpec 
  | FileValidationSpec 
  | CheckboxValidationSpec 
  | SelectValidationSpec;

export interface ValidationRule<T> {
  value: T;
  message?: string;
}

export interface TextValidationSpec {
  minLength?: ValidationRule<number>;
  maxLength?: ValidationRule<number>;
  pattern?: {
    value: string;
    flags?: string;
    message?: string;
  };
}

export interface NumberValidationSpec {
  min?: ValidationRule<number>;
  max?: ValidationRule<number>;
}

export interface DateValidationSpec {
  minDate?: ValidationRule<string>; // ISO string
  maxDate?: ValidationRule<string>; // ISO string
  disallowFuture?: ValidationRule<boolean>;
  disallowPast?: ValidationRule<boolean>;
}

export interface FileValidationSpec {
  maxSizeMb?: ValidationRule<number>;
  allowedExtensions?: ValidationRule<string[]>; // e.g. ['.jpg', '.pdf']
  allowedMimeTypes?: ValidationRule<string[]>; // e.g. ['image/jpeg']
  maxFiles?: ValidationRule<number>;
}

export interface CheckboxValidationSpec {
  mustBeTrue?: ValidationRule<boolean>;
}

export interface SelectValidationSpec {
  // Usually select options limit this, but can enforce subset
  allowedValues?: ValidationRule<string[]>; 
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
  description?: string;
  cover?: ColorOption;
  sections: FormSection[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  pages: FormPage[];
  rules: Rule[];
  layout?: FormLayout;
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
