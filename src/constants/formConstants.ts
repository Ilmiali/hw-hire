import { FieldType } from "../types/form-builder";

export interface PredefinedAttribute {
  label: string;
  value: string;
  types: FieldType[];
}

export const PREDEFINED_ATTRIBUTES: PredefinedAttribute[] = [
  { label: 'First Name', value: 'firstName', types: ['text'] },
  { label: 'Last Name', value: 'lastName', types: ['text'] },
  { label: 'Email', value: 'email', types: ['email', 'text'] },
  { label: 'Phone', value: 'phone', types: ['text', 'number'] },
  { label: 'LinkedIn Profile', value: 'linkedin', types: ['text'] },
  { label: 'Portfolio / Website', value: 'website', types: ['text'] },
  { label: 'Resume / CV', value: 'resume', types: ['file'] },
  { label: 'Cover Letter', value: 'coverLetter', types: ['file', 'textarea'] },
  { label: 'Avatar', value: 'avatar', types: ['image', 'file'] },
  { label: 'Desired Salary', value: 'desiredSalary', types: ['number', 'text'] },
  { label: 'Earliest Start Date', value: 'startDate', types: ['date', 'text'] },
];
