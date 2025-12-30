import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { FormSchema, FormPage, FormSection, FormField, FieldType, Rule, ColorOption } from '../types/form-builder';

// Define the state interface
interface FormBuilderState {
  form: FormSchema;
  activePageId: string;
  selectedElementId: string | null;
  sidebarOpen: boolean;

  // Global Actions
  setForm: (form: FormSchema) => void;

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCover: (cover: ColorOption) => void;
  setActivePageId: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;

  // Field Actions
  addField: (
    type: FieldType,
    targetSectionId?: string,
    targetRowIndex?: number,
    targetColumnIndex?: number
  ) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  moveField: (fieldId: string, direction: 'up' | 'down') => void;
  reorderField: (
    fieldId: string,
    targetSectionId: string,
    targetRowIndex: number,
    targetColumnIndex?: number
  ) => void;
  duplicateField: (fieldId: string) => void;

  // Section Actions
  addSection: () => void;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  reorderSection: (sectionId: string, targetIndex: number) => void;
  duplicateSection: (sectionId: string) => void;

  // Page Actions
  addPage: () => void;
  updatePage: (pageId: string, updates: Partial<FormPage>) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;

  // Rule Actions
  addRule: (rule: Rule) => void;
  updateRule: (ruleId: string, updates: Partial<Rule>) => void;
  deleteRule: (ruleId: string) => void;
}

const initialForm: FormSchema = {
  id: uuidv4(),
  title: 'Job Application Form',
  description: 'Please complete the form below. This form demonstrates the new validation system.',
  pages: [
    {
      id: uuidv4(),
      title: 'Applicant Details',
      description: 'Please provide your personal details.',
      cover: { id: 'blue', type: 'solid', value: '#64B5F6' },
      sections: [
        {
          id: uuidv4(),
          title: 'Personal Information',
          description: 'Standard validation rules (Required, Email, etc.)',
          rows: [
            {
              id: uuidv4(),
              fields: [
                {
                  id: uuidv4(),
                  type: 'text',
                  label: 'Full Name',
                  placeholder: 'John Doe',
                  required: true,
                  validation: {
                    minLength: { value: 2, message: 'Name is too short' },
                    maxLength: { value: 50 },
                  },
                },
                {
                  id: uuidv4(),
                  type: 'email',
                  label: 'Email Address',
                  placeholder: 'john@company.com',
                  required: true,
                  validation: {
                    pattern: {
                      value: '^[a-zA-Z0-9._%+-]+@company\\.com$',
                      message: 'Must be a valid @company.com email',
                    },
                  },
                },
              ],
            },
            {
              id: uuidv4(),
              fields: [
                 {
                  id: uuidv4(),
                  type: 'number',
                  label: 'Years of Experience',
                  placeholder: 'e.g. 5',
                  required: true,
                  validation: {
                    min: { value: 0 },
                    max: { value: 50, message: 'That seems unlikely!' },
                  },
                },
                {
                   id: uuidv4(),
                   type: 'select',
                   label: 'Department',
                   required: true,
                   options: [
                       { label: 'Engineering', value: 'eng' },
                       { label: 'Design', value: 'des' },
                       { label: 'Product', value: 'prod' }
                   ],
                   validation: {
                       allowedValues: { value: ['eng', 'des'], message: 'Only Engineering or Design properly accepted right now' }
                   }
                }
              ]
            }
          ],
        },
        {
            id: uuidv4(),
             title: 'Additional Details',
             description: 'Complex validation (Textarea, Dates, Checkboxes)',
             rows: [
                 {
                     id: uuidv4(),
                     fields: [
                         {
                             id: uuidv4(),
                             type: 'textarea',
                             label: 'Cover Letter',
                             placeholder: 'Tell us why you fit...',
                             required: false,
                             validation: {
                                 minLength: { value: 50, message: 'Please write at least 50 characters' },
                                 maxLength: { value: 500 }
                             }
                         }
                     ]
                 },
                 {
                     id: uuidv4(),
                     fields: [
                         {
                             id: uuidv4(),
                             type: 'date',
                             label: 'Desired Start Date',
                             required: true,
                             validation: {
                                 disallowFuture: { value: false }, // we want future usually
                                 minDate: { value: '2024-01-01', message: 'Date cannot be before 2024' }
                                 // To test disallowFuture, set it to true. Let's set it to FALSE for start date, but let's add Birth Date?
                                 // Let's stick to Start Date but require it to be future? 
                                 // My ValidationSpec has disallowFuture.
                                 // Let's add "Date of Birth" for disallowFuture.
                             }
                         },
                         {
                             id: uuidv4(),
                             type: 'date',
                             label: 'Date of Birth',
                             required: true,
                             validation: {
                                 disallowFuture: { value: true, message: 'You cannot be born in the future' }
                             }
                         }
                     ]
                 },
                 {
                     id: uuidv4(),
                     fields: [
                         {
                             id: uuidv4(),
                             type: 'checkbox',
                             label: 'Agreements',
                             required: true,
                             options: [
                                 { label: 'I agree to the Terms of Service', value: 'terms' }
                             ],
                             // Checkbox group validation handles min(1) via required:true
                         }
                     ]
                 }
             ]
        }
      ],
    },
  ],

  rules: [],
  layout: {
    cover: { id: 'blue', type: 'solid', value: '#64B5F6' }
  }
};

export const useFormBuilderStore = create<FormBuilderState>()(
  temporal(
    immer((set) => ({
      form: initialForm,
      activePageId: initialForm.pages[0].id,
      selectedElementId: null,
      sidebarOpen: true,

      setForm: (form) =>
        set((state) => {
          state.form = form;
          // Reset active page if current not in new form, or just set to first
          if (!form.pages.find((p) => p.id === state.activePageId)) {
            state.activePageId = form.pages[0]?.id || '';
          }
        }),

      setTitle: (title) =>
        set((state) => {
          state.form.title = title;
        }),

      setDescription: (description) =>
        set((state) => {
          state.form.description = description;
        }),

      setCover: (cover) =>
        set((state) => {
          if (!state.form.layout) state.form.layout = {};
          state.form.layout.cover = cover;
        }),

      setActivePageId: (id) =>
        set((state) => {
          state.activePageId = id;
        }),

      setSelectedElementId: (id) =>
        set((state) => {
          state.selectedElementId = id;
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      setSidebarOpen: (isOpen) =>
        set((state) => {
          state.sidebarOpen = isOpen;
        }),

      // --- Field Actions ---

      addField: (type, targetSectionId, targetRowIndex, targetColumnIndex) =>
        set((state) => {
          const newField: FormField = {
            id: uuidv4(),
            type,
            label: `New ${type} field`,
            required: false,
            placeholder: '',
            // Initialize options for choice-based fields
            options: ['select', 'radio', 'checkbox'].includes(type)
              ? [
                  { label: 'Option 1', value: 'option-1' },
                  { label: 'Option 2', value: 'option-2' },
                ]
              : undefined,
          };

          const page = state.form.pages.find((p) => p.id === state.activePageId);
          if (!page) return;

          let section = page.sections.find((s) => s.id === targetSectionId);
          // If no specific section target, default to first section
          if (!section && page.sections.length > 0) {
            section = page.sections[0];
          }

          if (section) {
            if (targetColumnIndex !== undefined && targetRowIndex !== undefined) {
              // Insert into existing row
              const row = section.rows[targetRowIndex];
              if (row && row.fields.length < 4) {
                row.fields.splice(targetColumnIndex, 0, newField);
              } else {
                // If column provided but row issue, create new row at index
                section.rows.splice(targetRowIndex, 0, {
                  id: uuidv4(),
                  fields: [newField],
                });
              }
            } else {
              // Insert as new row
              const rowIndex =
                targetRowIndex !== undefined ? targetRowIndex : section.rows.length;
              section.rows.splice(rowIndex, 0, {
                id: uuidv4(),
                fields: [newField],
              });
            }
          }
          state.selectedElementId = newField.id;
          state.sidebarOpen = true;
        }),

      updateField: (fieldId, updates) =>
        set((state) => {
          state.form.pages.forEach((page) => {
            page.sections.forEach((section) => {
              section.rows.forEach((row) => {
                const fieldIndex = row.fields.findIndex(
                  (f) => f.id === fieldId
                );
                if (fieldIndex !== -1) {
                  row.fields[fieldIndex] = {
                    ...row.fields[fieldIndex],
                    ...updates,
                  };
                }
              });
            });
          });
        }),

      deleteField: (fieldId) =>
        set((state) => {
          state.form.pages.forEach((page) => {
            page.sections.forEach((section) => {
              section.rows.forEach((row) => {
                row.fields = row.fields.filter((f) => f.id !== fieldId);
              });
              // Cleanup empty rows
              section.rows = section.rows.filter(
                (row) => row.fields.length > 0
              );
            });
          });
          if (state.selectedElementId === fieldId) {
            state.selectedElementId = null;
          }
        }),

      moveField: (fieldId, direction) =>
        set((state) => {
          // Simple move within rows logic (replicated from original)
          let sourceRowIdx = -1;
          let sourceColIdx = -1;
          let targetSection: FormSection | undefined;

          // Find the field
          state.form.pages.forEach((page) => {
            page.sections.forEach((s) => {
              s.rows.forEach((row, rIdx) => {
                const cIdx = row.fields.findIndex((f) => f.id === fieldId);
                if (cIdx !== -1) {
                  sourceRowIdx = rIdx;
                  sourceColIdx = cIdx;
                  targetSection = s;
                }
              });
            });
          });

          if (targetSection) {
            const newRowIndex =
              direction === 'up' ? sourceRowIdx - 1 : sourceRowIdx + 1;
            if (
              newRowIndex >= 0 &&
              newRowIndex < targetSection.rows.length
            ) {
              const field = targetSection.rows[sourceRowIdx].fields.splice(
                sourceColIdx,
                1
              )[0];
              targetSection.rows[newRowIndex].fields.push(field);

              // Cleanup source row if empty
              if (targetSection.rows[sourceRowIdx].fields.length === 0) {
                targetSection.rows.splice(sourceRowIdx, 1);
              }
            }
          }
        }),

      reorderField: (
        fieldId,
        targetSectionId,
        targetRowIndex,
        targetColumnIndex
      ) =>
        set((state) => {
          let sourceField: FormField | null = null;

          // Remove from source
          state.form.pages.forEach((page) => {
            page.sections.forEach((section) => {
              section.rows.forEach((row) => {
                const idx = row.fields.findIndex((f) => f.id === fieldId);
                if (idx !== -1) {
                  sourceField = row.fields.splice(idx, 1)[0];
                }
              });
              // Cleanup
              section.rows = section.rows.filter(
                (row) => row.fields.length > 0
              );
            });
          });

          if (!sourceField) return;

          // Insert into target
          state.form.pages.forEach((page) => {
            const section = page.sections.find(
              (s) => s.id === targetSectionId
            );
            if (section) {
              if (targetColumnIndex !== undefined) {
                if (!section.rows[targetRowIndex]) {
                  section.rows.splice(targetRowIndex, 0, {
                    id: uuidv4(),
                    fields: [sourceField!],
                  });
                } else {
                  const row = section.rows[targetRowIndex];
                  if (row.fields.length < 4) {
                    row.fields.splice(targetColumnIndex, 0, sourceField!);
                  } else {
                    // Row full, insert new row
                    section.rows.splice(targetRowIndex + 1, 0, {
                      id: uuidv4(),
                      fields: [sourceField!],
                    });
                  }
                }
              } else {
                // Insert as new row
                section.rows.splice(targetRowIndex, 0, {
                  id: uuidv4(),
                  fields: [sourceField!],
                });
              }
            }
          });
        }),

      duplicateField: (fieldId) =>
        set((state) => {
          let found = false;
          state.form.pages.forEach((page) => {
            page.sections.forEach((section) => {
              section.rows.forEach((row, rowIndex) => {
                const fieldIndex = row.fields.findIndex((f) => f.id === fieldId);
                if (fieldIndex !== -1 && !found) {
                  const original = row.fields[fieldIndex];
                  const clone: FormField = {
                    ...original,
                    id: uuidv4(),
                    label: `${original.label} (Copy)`,
                  };

                  if (row.fields.length < 4) {
                    row.fields.splice(fieldIndex + 1, 0, clone);
                  } else {
                    section.rows.splice(rowIndex + 1, 0, {
                      id: uuidv4(),
                      fields: [clone],
                    });
                  }
                  state.selectedElementId = clone.id;
                  found = true;
                }
              });
            });
          });
        }),

      // --- Section Actions ---

      addSection: () =>
        set((state) => {
          const newSection: FormSection = {
            id: uuidv4(),
            title: 'New Section',
            rows: [],
          };
          const page = state.form.pages.find((p) => p.id === state.activePageId);
          if (page) {
            page.sections.push(newSection);
            state.selectedElementId = newSection.id;
          }
        }),

      updateSection: (sectionId, updates) =>
        set((state) => {
          state.form.pages.forEach((page) => {
            const section = page.sections.find((s) => s.id === sectionId);
            if (section) {
              Object.assign(section, updates);
            }
          });
        }),

      deleteSection: (sectionId) =>
        set((state) => {
          state.form.pages.forEach((page) => {
            page.sections = page.sections.filter((s) => s.id !== sectionId);
          });
          if (state.selectedElementId === sectionId) {
            state.selectedElementId = null;
          }
        }),

      moveSection: (sectionId, direction) =>
        set((state) => {
          state.form.pages.forEach((page) => {
            const sectionIndex = page.sections.findIndex(
              (s) => s.id === sectionId
            );
            if (sectionIndex !== -1) {
              const newIndex =
                direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
              if (newIndex >= 0 && newIndex < page.sections.length) {
                const temp = page.sections[sectionIndex];
                page.sections[sectionIndex] = page.sections[newIndex];
                page.sections[newIndex] = temp;
              }
            }
          });
        }),

      reorderSection: (sectionId, targetIndex) =>
        set((state) => {
          let sourceSection: FormSection | null = null;

          // Find and remove
          state.form.pages.forEach((page) => {
            const idx = page.sections.findIndex((s) => s.id === sectionId);
            if (idx !== -1) {
              sourceSection = page.sections.splice(idx, 1)[0];
            }
          });

          if (!sourceSection) return;

          // Insert into active page
          const page = state.form.pages.find((p) => p.id === state.activePageId);
          if (page) {
            page.sections.splice(targetIndex, 0, sourceSection);
          }
        }),

      duplicateSection: (sectionId) =>
        set((state) => {
          let found = false;
          state.form.pages.forEach((page) => {
            const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
            if (sectionIndex !== -1 && !found) {
              const original = page.sections[sectionIndex];
              const clone: FormSection = {
                ...original,
                id: uuidv4(),
                title: `${original.title} (Copy)`,
                rows: original.rows.map((row) => ({
                  id: uuidv4(),
                  fields: row.fields.map((field) => ({
                    ...field,
                    id: uuidv4(),
                  })),
                })),
              };
              page.sections.splice(sectionIndex + 1, 0, clone);
              state.selectedElementId = clone.id;
              found = true;
            }
          });
        }),

      // --- Page Actions ---

      addPage: () =>
        set((state) => {
          const newPage: FormPage = {
            id: uuidv4(),
            title: `Page ${state.form.pages.length + 1}`,
            description: '',
            cover: { id: 'blue', type: 'solid', value: '#64B5F6' },
            sections: [
              {
                id: uuidv4(),
                title: 'Section 1',
                rows: [],
              },
            ],
          };
          state.form.pages.push(newPage);
          state.activePageId = newPage.id;
        }),

      updatePage: (pageId, updates) =>
        set((state) => {
          const page = state.form.pages.find((p) => p.id === pageId);
          if (page) {
            Object.assign(page, updates);
          }
        }),

      deletePage: (pageId) =>
        set((state) => {
          if (state.form.pages.length <= 1) return; // Prevent deleting last page

          const pageIndex = state.form.pages.findIndex((p) => p.id === pageId);
          state.form.pages = state.form.pages.filter((p) => p.id !== pageId);

          if (pageId === state.activePageId) {
            const newActiveIndex = Math.max(0, pageIndex - 1);
            if (state.form.pages[newActiveIndex]) {
              state.activePageId = state.form.pages[newActiveIndex].id;
            }
          }
          if (state.selectedElementId === pageId) {
            state.selectedElementId = null;
          }
        }),

      duplicatePage: (pageId) =>
        set((state) => {
          const index = state.form.pages.findIndex(p => p.id === pageId);
          if (index !== -1) {
            const original = state.form.pages[index];
            const clone: FormPage = {
              ...original,
              id: uuidv4(),
              title: `${original.title} (Copy)`,
              sections: original.sections.map(section => ({
                ...section,
                id: uuidv4(),
                rows: section.rows.map(row => ({
                  ...row,
                  id: uuidv4(),
                  fields: row.fields.map(field => ({
                    ...field,
                    id: uuidv4()
                  }))
                }))
              }))
            };
            state.form.pages.splice(index + 1, 0, clone);
            state.activePageId = clone.id;
            state.selectedElementId = clone.id;
          }
        }),

      // --- Rule Actions ---
      addRule: (rule) =>
        set((state) => {
           state.form.rules = state.form.rules || [];
           state.form.rules.push(rule);
        }),

      updateRule: (ruleId, updates) =>
        set((state) => {
           state.form.rules = state.form.rules || [];
           const index = state.form.rules.findIndex(r => r.id === ruleId);
           if (index !== -1) {
               Object.assign(state.form.rules[index], updates);
           }
        }),

      deleteRule: (ruleId) =>
        set((state) => {
           state.form.rules = (state.form.rules || []).filter(r => r.id !== ruleId);
        }),
    })),
    {
      // Zundo config
      limit: 100, // Limit history
      partialize: (state) => ({
        form: state.form,
        activePageId: state.activePageId,
        selectedElementId: state.selectedElementId,
      }),
    }
  )
);
