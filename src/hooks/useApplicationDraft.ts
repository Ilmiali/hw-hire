import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setDraft, updateDraft, removeDraft, ApplicationDraft } from '../store/slices/applicationDraftsSlice';

export interface UseApplicationDraftResult {
    draft: ApplicationDraft | null;
    answers: Record<string, any>;
    stepIndex: number;
    touched: Record<string, boolean>;
    errors: Record<string, string>;
    isSaving: boolean;
    lastSavedAt: Date | null;
    setStepIndex: (index: number) => void;
    setAnswer: (fieldId: string, value: any) => void;
    setAnswers: (next: Record<string, any>) => void;
    setTouched: (fieldId: string, isTouched: boolean) => void;
    setError: (fieldId: string, error: string | null) => void;
    clearDraft: () => void;
    saveNow: () => void;
    hasSavedDraft: boolean;
}

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useApplicationDraft(publicPostingId: string | undefined): UseApplicationDraftResult {
    const dispatch = useDispatch();
    const reduxDraft = useSelector((state: RootState) => 
        publicPostingId ? state.applicationDrafts.drafts[publicPostingId] : undefined
    );
    
    // We keep local state for immediate UI feedback and debounce updates to Redux
    const [answers, setAnswersState] = useState<Record<string, any>>({});
    const [stepIndex, setStepIndexState] = useState(0);
    const [touched, setTouchedState] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Status
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [hasSavedDraft, setHasSavedDraft] = useState(false);

    const draftRef = useRef<ApplicationDraft | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    // Initial draft setup for new drafts
    if (isInitialMount.current && !reduxDraft && !draftRef.current && publicPostingId) {
        draftRef.current = {
            draftId: generateId(),
            publicPostingId,
            stepIndex: 0,
            answers: {},
            touched: {},
            updatedAt: new Date().toISOString()
        };
    }

    // Initialize / Sync from Redux
    useEffect(() => {
        if (!publicPostingId) return;

        if (reduxDraft) {
            // Priority: Initial Load
            if (isInitialMount.current) {
                setAnswersState(reduxDraft.answers || {});
                setStepIndexState(reduxDraft.stepIndex || 0);
                setTouchedState(reduxDraft.touched || {});
                setLastSavedAt(new Date(reduxDraft.updatedAt));
                setHasSavedDraft(true);
                draftRef.current = reduxDraft;
                isInitialMount.current = false;
            } else {
                 // Sync status if Redux changes (e.g. from our own save or cross-tab)
                 const nextDate = new Date(reduxDraft.updatedAt);
                 if (!lastSavedAt || lastSavedAt.getTime() !== nextDate.getTime()) {
                    setLastSavedAt(nextDate);
                 }
                 setHasSavedDraft(true);

                 // If local state is empty but Redux has values (e.g. late rehydration), sync
                 if (Object.keys(answers).length === 0 && Object.keys(reduxDraft.answers || {}).length > 0) {
                     setAnswersState(reduxDraft.answers || {});
                     setStepIndexState(reduxDraft.stepIndex || 0);
                     setTouchedState(reduxDraft.touched || {});
                     draftRef.current = reduxDraft;
                 }
            }
        } else if (isInitialMount.current) {
             // No draft in Redux yet, but we have established our initial state in draftRef
             // We set isInitialMount to false now to prevent overwriting with an empty reduxDraft later
             isInitialMount.current = false;
        }
    }, [publicPostingId, reduxDraft, answers, lastSavedAt]);


    const performSave = useCallback(() => {
        if (!publicPostingId || !draftRef.current) return;
        
        setIsSaving(true);

        // Sanitize answers to remove non-serializable values (like File objects)
        const sanitize = (val: any): any => {
            if (val instanceof File) {
                return undefined; // Do not persist files
            }
            if (Array.isArray(val)) {
                return val.map(sanitize).filter(v => v !== undefined);
            }
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                const next: any = {};
                for (const key in val) {
                    const sanitized = sanitize(val[key]);
                    if (sanitized !== undefined) {
                        next[key] = sanitized;
                    }
                }
                return next;
            }
            return val;
        };

        const toSave = {
            ...draftRef.current,
            answers: sanitize(draftRef.current.answers),
            updatedAt: new Date().toISOString()
        };
        
        if (reduxDraft) {
             dispatch(updateDraft({ publicPostingId, updates: toSave }));
        } else {
             dispatch(setDraft(toSave));
        }
        
        // Update draftRef with the LATEST data (but keep original for local state)
        // Note: draftRef.current still has the Files because we didn't sanitize it in-place.
        
        setTimeout(() => setIsSaving(false), 300); 
    }, [publicPostingId, dispatch, reduxDraft]);



    const scheduleSave = useCallback(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setIsSaving(true);
        saveTimeoutRef.current = setTimeout(() => {
            performSave();
        }, 1000); // 1s debounce
    }, [performSave]);

    const setAnswers = useCallback((nextAnswers: Record<string, any>) => {
        setAnswersState(nextAnswers);
        if (draftRef.current) {
            draftRef.current = { ...draftRef.current, answers: nextAnswers };
            scheduleSave();
        }
    }, [scheduleSave]);

    const setAnswer = useCallback((fieldId: string, value: any) => {
        setAnswersState(prev => {
            const next = { ...prev, [fieldId]: value };
            if (draftRef.current) {
                draftRef.current = { ...draftRef.current, answers: next };
                scheduleSave();
            }
            return next;
        });
    }, [scheduleSave]);
    
    const setStepIndex = useCallback((index: number) => {
        setStepIndexState(index);
        if (draftRef.current) {
             draftRef.current = { ...draftRef.current, stepIndex: index };
            scheduleSave();
        }
    }, [scheduleSave]);

    const setTouched = useCallback((fieldId: string, isTouched: boolean) => {
        setTouchedState(prev => {
            const next = { ...prev, [fieldId]: isTouched };
            if (draftRef.current) {
                draftRef.current = { ...draftRef.current, touched: next };
                scheduleSave();
            }
            return next;
        });
    }, [scheduleSave]);

    const setError = useCallback((fieldId: string, error: string | null) => {
        setErrors(prev => {
            if (error === null) {
                 const { [fieldId]: _, ...rest } = prev;
                 return rest;
            }
            return { ...prev, [fieldId]: error };
        });
    }, []);

    const clearDraft = useCallback(() => {
        if (publicPostingId) {
            dispatch(removeDraft(publicPostingId));
        }
        setAnswersState({});
        setStepIndexState(0);
        setTouchedState({});
        setErrors({});
        draftRef.current = null;
        setHasSavedDraft(false);
        setLastSavedAt(null);
        isInitialMount.current = true; // Allow re-initialization

    }, [publicPostingId, dispatch]);

    // Save on unmount
    const onUnmountSaveRef = useRef(performSave);
    useEffect(() => {
        onUnmountSaveRef.current = performSave;
    }, [performSave]);

    useEffect(() => {
        return () => {
             if (saveTimeoutRef.current) {
                 clearTimeout(saveTimeoutRef.current);
                 onUnmountSaveRef.current?.();
             }
        };
    }, []); 

    return {
        draft: reduxDraft || null,
        answers,
        stepIndex,
        touched,
        errors,
        isSaving,
        lastSavedAt,
        setStepIndex,
        setAnswer,
        setAnswers,
        setTouched,
        setError,
        clearDraft,
        saveNow: performSave,
        hasSavedDraft
    };
}
