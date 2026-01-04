import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ApplicationDraft {
    draftId: string;
    publicPostingId: string;
    stepIndex: number;
    answers: Record<string, any>;
    touched: Record<string, boolean>;
    updatedAt: string;
    schemaVersionHash?: string;
    uploads?: Array<{
        uploadId: string;
        path: string;
        name: string;
        contentType: string;
        size: number;
    }>;
}

interface ApplicationDraftsState {
    drafts: Record<string, ApplicationDraft>;
}

const initialState: ApplicationDraftsState = {
    drafts: {},
};

export const applicationDraftsSlice = createSlice({
    name: 'applicationDrafts',
    initialState,
    reducers: {
        setDraft: (state, action: PayloadAction<ApplicationDraft>) => {
            state.drafts[action.payload.publicPostingId] = action.payload;
        },
        updateDraft: (state, action: PayloadAction<{ publicPostingId: string; updates: Partial<ApplicationDraft> }>) => {
            const { publicPostingId, updates } = action.payload;
            if (state.drafts[publicPostingId]) {
                 state.drafts[publicPostingId] = {
                    ...state.drafts[publicPostingId],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
            }
        },
        removeDraft: (state, action: PayloadAction<string>) => {
            delete state.drafts[action.payload];
        },
    },
});

export const { setDraft, updateDraft, removeDraft } = applicationDraftsSlice.actions;

export default applicationDraftsSlice.reducer;
