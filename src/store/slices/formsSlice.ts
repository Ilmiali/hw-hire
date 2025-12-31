import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService } from '../../services/databaseService';
import { Form, FormVersion } from '../../types/forms';
import { FormSchema } from '../../types/form-builder';

interface FormsState {
  forms: Form[];
  currentForm: Form | null;
  currentVersion: FormVersion | null;
  loading: boolean;
  error: string | null;
}

const initialState: FormsState = {
  forms: [],
  currentForm: null,
  currentVersion: null,
  loading: false,
  error: null,
};

const getFormsPath = (orgId: string) => `orgs/${orgId}/modules/hire/forms`;
const getDraftPath = (orgId: string, formId: string) => `orgs/${orgId}/modules/hire/forms/${formId}/draft`;
const getVersionsPath = (orgId: string, formId: string) => `orgs/${orgId}/modules/hire/forms/${formId}/versions`;

// Helpers to map Database Document to our types
const mapDocumentToForm = (doc: any): Form => ({
  id: doc.id,
  name: doc.data?.name || '',
  description: doc.data?.description || '',
  status: doc.data?.status || 'active',
  publishedVersionId: doc.data?.publishedVersionId,
  createdAt: doc.createdAt?.toISOString?.() || doc.data?.createdAt || new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() || doc.data?.updatedAt || new Date().toISOString(),
});

const mapDocumentToVersion = (doc: any): FormVersion => ({
  id: doc.id,
  data: doc.data?.data || doc.data || {} as FormSchema, // Handle case where it's mistakenly flat or nested
  createdAt: doc.createdAt?.toISOString?.() || doc.data?.createdAt || new Date().toISOString(),
});

// Helper to sanitize data for Firestore (remove undefined values)
const sanitizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  } else if (data !== null && typeof data === 'object') {
    return Object.entries(data).reduce((acc: any, [key, value]) => {
      if (value !== undefined) {
        acc[key] = sanitizeData(value);
      }
      return acc;
    }, {});
  }
  return data;
};

export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (orgId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const forms = await db.getDocuments(getFormsPath(orgId), {
        sortBy: { field: 'updatedAt', order: 'desc' }
      });
      return forms.map(mapDocumentToForm);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch forms');
    }
  }
);

export const fetchFormById = createAsyncThunk(
  'forms/fetchFormById',
  async ({ orgId, formId }: { orgId: string; formId: string }, { rejectWithValue }) => {
    try {
      const form = await db.getDocument(getFormsPath(orgId), formId);
      if (!form) return rejectWithValue('Form not found');
      return mapDocumentToForm(form);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch form');
    }
  }
);

export const fetchLatestVersion = createAsyncThunk(
  'forms/fetchLatestVersion',
  async ({ orgId, formId, versionId }: { orgId: string; formId: string; versionId: string }, { rejectWithValue }) => {
    try {
      const version = await db.getDocument(getVersionsPath(orgId, formId), versionId);
      if (!version) return null;
      return mapDocumentToVersion(version);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch version');
    }
  }
);

export const fetchFormDraft = createAsyncThunk(
  'forms/fetchFormDraft',
  async ({ orgId, formId }: { orgId: string; formId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      // Always fetch the 'current' draft
      const draft = await db.getDocument(getDraftPath(orgId, formId), 'current');
      // If no draft exists (should exist after create, but safeguards), 
      // we might fallback or return null.
      return draft ? mapDocumentToVersion(draft) : null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch form draft');
    }
  }
);

export const createForm = createAsyncThunk(
  'forms/createForm',
  async ({ orgId, name, description }: { orgId: string; name: string; description: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const docId = await db.addDocument(getFormsPath(orgId), {
        name,
        description,
        status: 'active',
      });
      
      const actualFormId = typeof docId === 'string' ? docId : (docId as any).id;

      // Create initial draft
      const initialData: FormSchema = {
          id: actualFormId,
          title: name,
          pages: [{ id: 'page-1', title: 'Page 1', sections: [] }],
          rules: []
      };

      // Write to draft/current
      await db.setDocument(getDraftPath(orgId, actualFormId), 'current', {
        data: sanitizeData(initialData),
      });

      // Fetch the created form to return mapped version
      const createdForm = await db.getDocument(getFormsPath(orgId), actualFormId);
      return mapDocumentToForm(createdForm);

    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create form');
    }
  }
);

export const saveFormDraft = createAsyncThunk(
  'forms/saveFormDraft',
  async ({ orgId, formId, data }: { orgId: string; formId: string; data: FormSchema }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      // Write to draft/current
      await db.setDocument(getDraftPath(orgId, formId), 'current', {
        data: sanitizeData(data),
      });

      // Update form metadata (name and updatedAt)
      const updatedFormDoc = await db.updateDocument(getFormsPath(orgId), formId, {
        name: data.title,
        updatedAt: new Date() as any 
      });

      // Return the updated draft as a version object and the updated form metadata
      const draft = await db.getDocument(getDraftPath(orgId, formId), 'current');
      return {
          version: mapDocumentToVersion(draft),
          form: mapDocumentToForm(updatedFormDoc)
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save draft');
    }
  }
);

export const publishForm = createAsyncThunk(
  'forms/publishForm',
  async ({ orgId, formId }: { orgId: string; formId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      
      // 1. Fetch current draft
      const draft = await db.getDocument(getDraftPath(orgId, formId), 'current');
      if (!draft) throw new Error('No draft to publish');

      // 2. Create immutable version from draft
      const versionId = `v_${Date.now()}`;
      await db.setDocument(getVersionsPath(orgId, formId), versionId, {
        data: (draft.data as any).data, // Access nested data from draft doc
        publishedAt: new Date()
      });

      // 3. Update form metadata
      await db.updateDocument(getFormsPath(orgId), formId, {
        publishedVersionId: versionId,
        updatedAt: new Date().toISOString(),
      });
      return versionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to publish form');
    }
  }
);

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
      state.currentVersion = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.currentForm = action.payload;
      })
      .addCase(fetchLatestVersion.fulfilled, (state, action) => {
        state.currentVersion = action.payload;
      })
      .addCase(fetchFormDraft.fulfilled, (state, action) => {
        state.currentVersion = action.payload; // mapped draft is essentially a version
      })
      .addCase(saveFormDraft.fulfilled, (state, action) => {
          state.currentVersion = action.payload.version;
          state.currentForm = action.payload.form;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.forms.unshift(action.payload);
      });
  },
});

export const { setCurrentForm, clearCurrentForm } = formsSlice.actions;
export default formsSlice.reducer;
