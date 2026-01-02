
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { fetchResourceById, fetchResourceVersionById } from '../../../store/slices/resourceSlice';
import { FormRenderer } from '../../FormBuilder/components/FormRenderer';
import { Spinner } from '../../../components/ui/spinner';
import { FormSchema } from '../../../types/form-builder';

interface FormPreviewBoxProps {
    orgId: string;
    formId: string;
    versionId?: string;
}

export const FormPreviewBox = ({ orgId, formId, versionId }: FormPreviewBoxProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [schema, setSchema] = useState<FormSchema | null>(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const loadForm = async () => {
            if (!orgId || !formId) return;
            setLoading(true);
            try {
                let resourceData: any;

                if (versionId) {
                    const res = await dispatch(fetchResourceVersionById({ 
                        orgId, 
                        moduleId: 'hire', 
                        resourceType: 'forms', 
                        resourceId: formId,
                        versionId
                    })).unwrap();
                    resourceData = res.data;
                } else {
                    const res = await dispatch(fetchResourceById({ 
                        orgId, 
                        moduleId: 'hire', 
                        resourceType: 'forms', 
                        resourceId: formId 
                    })).unwrap();
                    resourceData = res;
                }

                if (resourceData.data) {
                    setSchema(resourceData.data);
                } else if (resourceData.pages) {
                    setSchema(resourceData);
                }
            } catch (error) {
                console.error("Failed to load form preview", error);
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [dispatch, orgId, formId, versionId]);

    if (loading) return <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800"><Spinner /></div>;
    if (!formId) return <div className="h-64 flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-sm italic">Select a form to see preview</div>;
    if (!schema) return <div className="h-64 flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-sm">No form definition found</div>;

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Application Form Preview</span>
                <span className="text-[10px] text-zinc-400 italic">Read-only view</span>
            </div>
            <div className="p-8 max-h-[600px] overflow-y-auto bg-zinc-50/30 dark:bg-zinc-900/5 shadow-inner">
                <div className="scale-90 origin-top transform">
                    <FormRenderer schema={schema} readOnly={true} />
                </div>
            </div>
        </div>
    );
};
