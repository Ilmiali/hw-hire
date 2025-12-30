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

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
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
}
