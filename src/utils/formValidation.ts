import { FormSchema, FormField } from '../types/form-builder';
import { FormType } from '../types/forms';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateFormStructure = (schema: FormSchema, type: FormType): ValidationResult => {
  const errors: string[] = [];

  if (type !== 'application') {
    return { valid: true, errors: [] };
  }

  const allFields: FormField[] = [];
  
  schema.pages.forEach(page => {
    page.sections.forEach(section => {
      section.rows.forEach(row => {
        row.fields.forEach(field => {
          allFields.push(field);
          if (field.fields) { // Nested fields (e.g. repeat)
             allFields.push(...field.fields);
          }
        });
      });
    });
  });

  // Check for First Name
  const hasFirstName = allFields.some(f => 
    f.type === 'text' && 
    f.required && 
    f.attributeName === 'firstName'
  );

  if (!hasFirstName) {
    errors.push("Application forms must include a required 'First Name' field (attribute: 'firstName').");
  }

  // Check for Last Name
  const hasLastName = allFields.some(f => 
    f.type === 'text' && 
    f.required && 
    f.attributeName === 'lastName'
  );

  if (!hasLastName) {
    errors.push("Application forms must include a required 'Last Name' field (attribute: 'lastName').");
  }

  // Check for Email
  const hasEmail = allFields.some(f => 
    f.type === 'email' && 
    f.required &&
    f.attributeName === 'email'
  );

  if (!hasEmail) {
    errors.push("Application forms must include a required Email field (attribute: 'email').");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
