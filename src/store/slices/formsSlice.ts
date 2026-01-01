import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../utils/serialization';
import { getDatabaseService } from '../../services/databaseService';
import { Form, FormVersion } from '../../types/forms';
import { FormSchema } from '../../types/form-builder';
import { grantAccess, revokeAccess } from './shareSlice';

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
const getAccessPath = (orgId: string, formId: string) => `orgs/${orgId}/modules/hire/forms/${formId}/access`;

// Helpers to map Database Document to our types
const mapDocumentToForm = (doc: any): Form => ({
  id: doc.id,
  name: doc.data?.name || '',
  description: doc.data?.description || '',
  status: doc.data?.status || 'active',
  visibility: doc.data?.visibility || 'private',
  ownerIds: doc.data?.ownerIds || [],
  createdBy: doc.data?.createdBy || '',
  publishedVersionId: doc.data?.publishedVersionId,
  createdAt: serializeDate(doc.createdAt) || (serializeDate(doc.data?.createdAt) as string) || new Date().toISOString(),
  updatedAt: serializeDate(doc.updatedAt) || (serializeDate(doc.data?.updatedAt) as string) || new Date().toISOString(),
});

const mapDocumentToVersion = (doc: any): FormVersion => ({
  id: doc.id,
  data: doc.data?.data || doc.data || {} as FormSchema, // Handle case where it's mistakenly flat or nested
  createdAt: serializeDate(doc.createdAt) || (serializeDate(doc.data?.createdAt) as string) || new Date().toISOString(),
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
  }
});

export const { setCurrentForm, clearCurrentForm } = formsSlice.actions;
export default formsSlice.reducer;
