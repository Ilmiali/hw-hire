
import { FormField } from '@/types/form-builder';
import { Input } from '@/components/input';
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
                        placeholder={field.type === 'date' ? undefined : field.placeholder}
                        disabled={disabled}
                        className={error ? 'border-red-500' : ''}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={disabled}
                        className={`min-h-[120px] ${error ? 'border-red-500' : ''}`}
                    />
                );

            case 'select':
                return (
                    <Select
                        value={value || ''}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={`w-full ${error ? 'border-red-500' : ''}`}>
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
            
            case 'repeat':
                 const items = (Array.isArray(value) ? value : []) as Record<string, any>[];
                 return (
                     <div className="space-y-4">
                         {items.map((itemValue, index) => (
                             <div key={index} className="relative p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                 {!disabled && (
                                     <div className="absolute right-4 top-4">
                                          <button 
                                             type="button"
                                             onClick={() => {
                                                 const newItems = [...items];
                                                 newItems.splice(index, 1);
                                                 onChange(newItems);
                                             }}
                                             className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                             title="Remove item"
                                         >
                                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                         </button>
                                     </div>
                                 )}
                                 <div className="flex flex-col gap-4">
                                      {field.fields?.map(child => (
                                          <ApplyFieldRenderer
                                              key={child.id}
                                              field={{...child, required: child.required}} // effective field logic could be passed down if needed
                                              value={itemValue[child.id]}
                                              onChange={(childVal) => {
                                                  // if (disabled) return; // parent handles disabled
                                                  const newItems = [...items];
                                                  newItems[index] = { ...newItems[index], [child.id]: childVal };
                                                  onChange(newItems);
                                              }}
                                              disabled={disabled}
                                              // We might need to handle errors for nested fields specifically if we want deep validation reporting
                                          />
                                      ))}
                                 </div>
                             </div>
                         ))}
                         {!disabled && (
                             <button
                                 type="button" 
                                 onClick={() => onChange([...items, {}])}
                                 className="w-full border-dashed border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all duration-200 rounded-xl py-4 flex items-center justify-center gap-2 font-medium"
                             >
                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                 Add {field.label || 'Item'}
                             </button>
                         )}
                     </div>
                 );

            default:
                return null;
        }
    };

    if (['paragraph', 'divider', 'spacer', 'image'].includes(field.type)) {
        return <div className="py-2 flex-1 min-w-0">{renderContent()}</div>;
    }

    return (
        <div className="group animate-in fade-in duration-500 slide-in-from-bottom-2 flex-1 min-w-0">
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
