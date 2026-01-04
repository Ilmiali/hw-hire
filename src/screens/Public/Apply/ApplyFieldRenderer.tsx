
import { FormField } from '@/types/form-builder';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/checkbox';
import { FileUploadField } from './FileUploadField';

interface ApplyFieldRendererProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    disabled?: boolean;
}

export function ApplyFieldRenderer({
    field,
    value,
    onChange,
    error,
    disabled = false
}: ApplyFieldRendererProps) {
    
    const renderContent = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                return (
                    <Input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        className={`bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 ${error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100'}`}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        className={`bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[120px] ${error ? 'border-red-500' : 'focus:ring-zinc-900 dark:focus:ring-zinc-100'}`}
                    />
                );

            case 'select':
                return (
                    <Select
                        value={value || ''}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={`bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 w-full ${error ? 'border-red-500 ring-red-500' : 'focus:ring-zinc-900 dark:focus:ring-zinc-100'}`}>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            {field.options?.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-zinc-900 dark:text-zinc-100 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'radio':
                return (
                    <RadioGroup
                        value={value || ''}
                        onValueChange={onChange}
                        disabled={disabled}
                        className="space-y-3"
                    >
                        {field.options?.map(opt => {
                             const isSelected = value === opt.value;
                             return (
                                <div key={opt.value} className={`flex items-center space-x-3 p-4 border rounded-xl transition-all duration-200 ${isSelected ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
                                    <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} className="dark:border-zinc-100" />
                                    <Label 
                                        htmlFor={`${field.id}-${opt.value}`}
                                        className="text-base font-normal cursor-pointer flex-grow text-zinc-900 dark:text-zinc-100"
                                    >
                                        {opt.label}
                                    </Label>
                                </div>
                             );
                        })}
                    </RadioGroup>
                );

            case 'checkbox':
                return (
                    <CheckboxGroup>
                        {field.options?.map(opt => {
                             const isChecked = Array.isArray(value) ? value.includes(opt.value) : value === opt.value;
                             return (
                                <CheckboxField key={opt.value} className={`p-4 border rounded-xl transition-all duration-200 ${isChecked ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
                                    <Checkbox 
                                        color="dark/white"
                                        checked={isChecked}
                                        onChange={(checked: boolean) => {
                                            const currentArr = Array.isArray(value) ? [...value] : [];
                                            if (checked) {
                                                currentArr.push(opt.value);
                                            } else {
                                                const idx = currentArr.indexOf(opt.value);
                                                if (idx > -1) currentArr.splice(idx, 1);
                                            }
                                            onChange(currentArr);
                                        }}
                                        disabled={disabled}
                                    />
                                    <Label className="text-base font-normal cursor-pointer text-zinc-900 dark:text-zinc-100">{opt.label}</Label>
                                </CheckboxField>
                             );
                        })}
                    </CheckboxGroup>
                );

            case 'file':
                return (
                    <FileUploadField
                        value={value}
                        onChange={onChange}
                        multiple={field.multiple}
                        maxSizeMb={(field.validation as any)?.maxSizeMb?.value || 10}
                        disabled={disabled}
                    />
                );
            case 'paragraph':
                return (
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400">
                        {field.content}
                    </div>
                );
            case 'divider':
                return <hr className="border-t border-zinc-200 dark:border-zinc-800 my-8" />;
            case 'spacer':
                return <div className="h-8" />;
            case 'image':
                return field.imageUrl ? (
                    <img src={field.imageUrl} alt={field.altText || ''} className="rounded-xl w-full h-auto" />
                ) : null;
            
            default:
                return null;
        }
    };

    if (['paragraph', 'divider', 'spacer', 'image'].includes(field.type)) {
        return <div className="py-2">{renderContent()}</div>;
    }

    return (
        <div className="group animate-in fade-in duration-500 slide-in-from-bottom-2">
            <Label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 ml-1">
                {field.label} {field.required && <span className="text-red-500 text-xs ml-0.5">*</span>}
            </Label>
            {renderContent()}
            {error && (
                <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {error}
                </p>
            )}
        </div>
    );
}
