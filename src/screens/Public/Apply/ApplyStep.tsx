
import { FormPage } from '@/types/form-builder';
import { ApplyFieldRenderer } from './ApplyFieldRenderer';

interface ApplyStepProps {
    page: FormPage;
    values: Record<string, any>;
    onChange: (fieldId: string, value: any) => void;
    errors: Record<string, string>;
    visibleFieldIds: Set<string>;
    requiredFieldIds: Set<string>;
    disabled?: boolean;
    hideHeader?: boolean;
}

export function ApplyStep({
    page,
    values,
    onChange,
    errors,
    visibleFieldIds,
    requiredFieldIds,
    disabled = false,
    hideHeader = false
}: ApplyStepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!hideHeader && (
                <div className="space-y-2 mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {page.title}
                    </h2>
                    {page.description && (
                        <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {page.description}
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-8">
                {page.sections.map(section => (
                    <div key={section.id} className="space-y-6">
                        {(section.title || section.description) && (
                            <div className="pt-2">
                                {section.title && (
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                        {section.title}
                                    </h3>
                                )}
                                {section.description && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                                        {section.description}
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-6">
                            {section.rows.map(row => (
                                <div key={row.id} className="flex flex-col md:flex-row gap-6">
                                    {row.fields.map(field => {
                                        if (!visibleFieldIds.has(field.id)) return null;
                                        
                                        // Merge local required override with schema required
                                        const isRequired = requiredFieldIds.has(field.id) || field.required;
                                        const effectiveField = { ...field, required: isRequired };

                                        return (
                                            <ApplyFieldRenderer
                                                key={field.id}
                                                field={effectiveField}
                                                value={values[field.id]}
                                                onChange={(val) => onChange(field.id, val)}
                                                error={errors[field.id]}
                                                disabled={disabled}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
