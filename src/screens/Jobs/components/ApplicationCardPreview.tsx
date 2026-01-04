import { ApplicationCardConfig } from '../../../types/jobs';
import { FormField } from '../../../types/form-builder';
import { Avatar } from '../../../components/avatar';
import { UserIcon } from '@heroicons/react/24/solid';

interface ApplicationCardPreviewProps {
    config?: ApplicationCardConfig;
    fields: FormField[];
}

export const ApplicationCardPreview = ({ config, fields }: ApplicationCardPreviewProps) => {
    
    const getMockValue = (field?: FormField) => {
        if (!field) return '';
        switch (field.type) {
            case 'text': return 'Sample Text';
            case 'email': return 'candidate@example.com';
            case 'number': return 42;
            case 'date': return new Date().toLocaleDateString();
            case 'select': return field.options?.[0]?.label || 'Option 1';
            case 'checkbox': return 'Yes';
            case 'radio': return field.options?.[0]?.label || 'Choice A';
            case 'textarea': return 'This is a sample response for the textarea field.';
            case 'multiselect': return [field.options?.[0]?.label || 'Option 1', field.options?.[1]?.label || 'Option 2'].join(', ');
            default: return 'Value';
        }
    };

    const headlineField = fields.find(f => f.id === config?.headlineFieldId);
    const subtitleField = fields.find(f => f.id === config?.subtitleFieldId);
    const avatarField = fields.find(f => f.id === config?.avatarFieldId);
    
    // Fallbacks
    const headline = headlineField ? getMockValue(headlineField) : 'Candidate Name';
    const subtitle = subtitleField ? getMockValue(subtitleField) : 'Applied Role';

    const additionalFields = (config?.additionalFields || [])
        .map(id => fields.find(f => f.id === id))
        .filter(Boolean) as FormField[];

    return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 w-[280px]">
            <div className="flex items-center gap-3 mb-3">
                {avatarField && (avatarField.type === 'file' || avatarField.type === 'image') ? (
                     <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                        <UserIcon className="size-5 text-zinc-400" />
                     </div>
                ) : (
                    <Avatar initials={typeof headline === 'string' ? headline.charAt(0) : '?'} className="size-8" />
                )}
                
                <div className="min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {headline}
                    </h4>
                    <p className="text-xs text-zinc-500 truncate">
                        {subtitle}
                    </p>
                </div>
            </div>
            
            {additionalFields.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-700/50">
                    {additionalFields.map(field => (
                        <div key={field.id} className="text-xs flex justify-between gap-2">
                            <span className="text-zinc-500 shrink-0">{field.label}:</span>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate text-right">
                                {getMockValue(field)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
