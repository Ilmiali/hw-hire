import { z } from 'zod';
import { FormField, TextValidationSpec, NumberValidationSpec, DateValidationSpec, CheckboxValidationSpec, SelectValidationSpec } from '../types/form-builder';

// Helper to determine if a field is visible
// In the schema generation, we assume we receive the set of visible IDs.
// If a field is NOT visible, it should be optional() (or omitted) in the schema, 
// effectively skipping validation for it.

export const buildZodSchema = (
    fields: FormField[], 
    requiredFieldIds: Set<string>, 
    visibleFieldIds: Set<string>
): z.ZodObject<any> => {
    const shape: Record<string, z.ZodTypeAny> = {};

    fields.forEach(field => {
        // If not visible, we can either exclude it from the schema or make it optional/any
        // Use optional().nullable() to be safe so it validates whatever junk is there as "ok" or strips it.
        // Actually best is to just not validate it if it's hidden, but we might want to ensure it's removed from data.
        // However, User req: "hidden fields are never required/validated".
        // So we will create a schema that ALLOWS anything (or nothing) if hidden.
        
        const isVisible = visibleFieldIds.has(field.id);
        const isRequired = requiredFieldIds.has(field.id);

        if (!isVisible) {
            shape[field.id] = z.any().optional(); 
            return;
        }

        shape[field.id] = fieldToZod(field, isRequired);
    });

    return z.object(shape);
};

export const fieldToZod = (field: FormField, isRequired: boolean): z.ZodTypeAny => {
    let schema: z.ZodTypeAny = z.any();

    switch (field.type) {
        case 'text':
        case 'email':
        case 'textarea':
            let stringSchema = z.string();
            
            // Apply Email format first if needed
            if (field.type === 'email') {
                stringSchema = stringSchema.email({ message: 'Invalid email address' });
            }

            // Apply ValidationSpec rules to the base string schema
            if (field.validation) {
                const rules = field.validation as TextValidationSpec;
                if (rules.minLength?.value !== undefined) {
                    stringSchema = stringSchema.min(rules.minLength.value, { message: rules.minLength.message || `Minimum ${rules.minLength.value} characters` });
                }
                if (rules.maxLength?.value !== undefined) {
                    stringSchema = stringSchema.max(rules.maxLength.value, { message: rules.maxLength.message || `Maximum ${rules.maxLength.value} characters` });
                }
                if (rules.pattern?.value && rules.pattern.value !== '') {
                    try {
                        const regex = new RegExp(rules.pattern.value, rules.pattern.flags);
                        stringSchema = stringSchema.regex(regex, { message: rules.pattern.message || 'Invalid format' });
                    } catch (e) {
                         console.warn('Invalid regex in field validation', field.id, rules.pattern.value);
                    }
                }
            }

            // Now handle isRequired and optionality
            if (isRequired) {
                schema = stringSchema.min(1, { message: 'This field is required' });
            } else {
                schema = stringSchema.optional().or(z.literal(''));
            }
            break;

        case 'number':
            let numberSchema = z.number({ message: 'Must be a number' });

            if (field.validation) {
                const rules = field.validation as NumberValidationSpec;
                if (rules.min?.value !== undefined) {
                    numberSchema = numberSchema.min(rules.min.value, { message: rules.min.message || `Minimum value is ${rules.min.value}` });
                }
                if (rules.max?.value !== undefined) {
                    numberSchema = numberSchema.max(rules.max.value, { message: rules.max.message || `Maximum value is ${rules.max.value}` });
                }
            }

            // Preprocess to handle empty strings
            schema = z.preprocess((val) => {
                if (val === '' || val === null || val === undefined) return undefined;
                return Number(val);
            }, isRequired ? numberSchema : numberSchema.optional());

            if (isRequired) {
                 schema = schema.refine((val) => val !== undefined, { message: 'This field is required' });
            }
            break;

        case 'date':
             // Dates are usually strings "YYYY-MM-DD".
             schema = z.string();

             if (isRequired) {
                schema = (schema as z.ZodString).min(1, { message: 'Date is required' });
             } else {
                schema = (schema as z.ZodString).optional().or(z.literal(''));
             }
             
             // Refine for date validity
             schema = (schema as z.ZodString).refine((val) => {
                 if (!val) return true; // allow empty if optional handled above
                 return !isNaN(Date.parse(val));
             }, { message: 'Invalid date' });

             if (field.validation) {
                 const rules = field.validation as DateValidationSpec;
                 schema = (schema as z.ZodType<any>).superRefine((val, ctx) => {
                     if (!val) return;
                     const date = new Date(val);
                     
                     if (rules.minDate?.value) {
                         const min = new Date(rules.minDate.value);
                         if (date < min) {
                             ctx.addIssue({
                                 code: z.ZodIssueCode.custom,
                                 message: rules.minDate.message || `Date must be after ${rules.minDate.value}`
                             });
                         }
                     }
                     if (rules.maxDate?.value) {
                         const max = new Date(rules.maxDate.value);
                         if (date > max) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: rules.maxDate.message || `Date must be before ${rules.maxDate.value}`
                            });
                        }
                     }
                     if (rules.disallowFuture?.value) {
                         const now = new Date();
                         now.setHours(23, 59, 59, 999); // End of today? Or strict now? Usually means "not in future".
                         // Simple comparison:
                         if (date > new Date()) {
                              ctx.addIssue({
                                 code: z.ZodIssueCode.custom,
                                 message: rules.disallowFuture.message || 'Future dates not allowed'
                             });
                         }
                     }
                 });
             }
             break;

        case 'checkbox':
            // Single checkbox: boolean. Multi checkbox not explicit in type usually, but field.options suggests group? 
            // In FormPreview.tsx: 'checkbox' renders CheckboxGroup -> array of values.
            // If field has options, it's a group (Array). If no options, maybe single boolean?
            // The existing types show `options` is optional.
            // Let's assume: if options exist -> Array of strings. If no options -> Boolean.

            if (field.options && field.options.length > 0) {
                // Multi-select checkbox group
                schema = z.array(z.string());
                if (isRequired) {
                    schema = (schema as z.ZodArray<any>).min(1, { message: 'Please select at least one option' });
                } else {
                    schema = (schema as z.ZodArray<any>).optional();
                }
            } else {
                // Single boolean checkbox (e.g. "I agree")
                schema = z.boolean();
                if (field.validation) {
                    const rules = field.validation as CheckboxValidationSpec;
                    if (rules.mustBeTrue?.value) {
                        schema = (schema as z.ZodBoolean).refine(val => val === true, {
                            message: rules.mustBeTrue.message || 'This must be checked'
                        });
                    }
                }
                if (isRequired) {
                     // If required but generic, maybe just needs to be true?
                     // Usually required checkbox = must be true.
                     schema = (schema as z.ZodBoolean).refine(val => val === true, { message: 'Required' });
                } 
            }
            break;
            
        case 'select':
        case 'radio':
             schema = z.string();
             if (isRequired) {
                 schema = (schema as z.ZodString).min(1, { message: 'Please select an option' });
             } else {
                 schema = (schema as z.ZodString).optional().or(z.literal(''));
             }

             if (field.validation) {
                 const rules = field.validation as SelectValidationSpec;
                 if (rules.allowedValues?.value) {
                      schema = (schema as z.ZodString).refine(val => {
                          if (!val) return true; // handled by required
                          return rules.allowedValues?.value.includes(val);
                      }, { message: rules.allowedValues?.message || 'Invalid selection' });
                 }
             }
             break;

        case 'multiselect':
             schema = z.array(z.string());
             if (isRequired) {
                 schema = (schema as z.ZodArray<any>).min(1, { message: 'Please select at least one option' });
             } else {
                 schema = (schema as z.ZodArray<any>).optional();
             }
             break;

        case 'file':
             schema = z.array(z.any());
             if (isRequired) {
                 schema = (schema as z.ZodArray<any>).min(1, { message: 'Please upload at least one file' });
             } else {
                 schema = (schema as z.ZodArray<any>).optional();
             }
             break;

        default:
            schema = z.any();
            if(!isRequired) schema = schema.optional();
            break;
    }

    return schema;
};
