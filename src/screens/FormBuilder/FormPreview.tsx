
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormBuilderStore } from '../../store/formBuilderStore';
import { FormRenderer } from './components/FormRenderer';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchResourceById, fetchResourceDraft } from '../../store/slices/resourceSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Text } from '../../components/text';

export const FormPreview = () => {
    const { orgId, formId } = useParams<{ orgId: string; formId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const { activeResource: currentForm, activeDraft: currentVersion } = useSelector((state: RootState) => state.resource);
    const form = useFormBuilderStore(state => state.form);
    const setForm = useFormBuilderStore(state => state.setForm);

    // Load form data if navigation was direct
    useEffect(() => {
        if (orgId && formId && (!currentForm || currentForm.id !== formId)) {
            dispatch(fetchResourceById({ orgId, moduleId: 'hire', resourceType: 'forms', resourceId: formId }));
        }
    }, [dispatch, orgId, formId, currentForm]);

    useEffect(() => {
        if (orgId && formId) {
            dispatch(fetchResourceDraft({ orgId, moduleId: 'hire', resourceType: 'forms', resourceId: formId }));
        }
    }, [dispatch, orgId, formId]);

    useEffect(() => {
        if (currentVersion?.data && (form.id !== formId || !form.pages || form.pages.length === 0)) {
            setForm(currentVersion.data);
        }
    }, [currentVersion, setForm, formId, form.id, form.pages]);

    if (!form || !form.pages || form.pages.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <Text>Loading form preview...</Text>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
            {/* Preview Banner */}
            <div className="bg-blue-50 dark:bg-blue-600/10 border-b border-blue-200 dark:border-blue-500/20 px-6 py-3 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <span className="bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-500/30">Preview Mode</span>
                    <Text className="text-sm text-blue-700 dark:text-blue-200">This is how your form will look to users.</Text>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => navigate(`/orgs/${orgId}/forms/${formId}`)}
                    className="bg-white dark:bg-zinc-800 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all rounded-lg"
                >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Editor
                </Button>
            </div>

            <div className="flex-1 flex justify-center p-8 overflow-y-auto">
                <FormRenderer 
                    schema={form} 
                    onSuccess={(values) => console.log('Form Submission:', values)}
                />
            </div>
        </div>
    );
};

export default FormPreview;
