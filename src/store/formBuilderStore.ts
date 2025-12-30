import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { FormSchema, FormPage, FormSection, FormField, FieldType } from '../types/form-builder';

// Define the state interface
interface FormBuilderState {
  form: FormSchema;
  activePageId: string;
  selectedElementId: string | null;
  sidebarOpen: boolean;

  // Global Actions
  setForm: (form: FormSchema) => void;
  setTitle: (title: string) => void;
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

  // Section Actions
  addSection: () => void;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  reorderSection: (sectionId: string, targetIndex: number) => void;

  // Page Actions
  addPage: () => void;
  updatePage: (pageId: string, updates: Partial<FormPage>) => void;
  deletePage: (pageId: string) => void;
}

const initialForm: FormSchema = {
  id: uuidv4(),
  title: 'Untitled Form',
  description: 'Add a description to your form',
  pages: [
    {
      id: uuidv4(),
      title: 'Page 1',
      sections: [
        {
          id: uuidv4(),
          title: 'Section 1',
          description: '',
          rows: [],
        },
      ],
    },
  ],
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

      // --- Page Actions ---

      addPage: () =>
        set((state) => {
          const newPage: FormPage = {
            id: uuidv4(),
            title: `Page ${state.form.pages.length + 1}`,
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
