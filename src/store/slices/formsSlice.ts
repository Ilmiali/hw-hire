import { createSlice } from '@reduxjs/toolkit';
import { Form, FormVersion } from '../../types/forms';

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
