
import { useCallback, useState } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface FileUploadFieldProps {
    value?: File[];
    onChange: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
    maxSizeMb?: number;
    disabled?: boolean;
}

export function FileUploadField({
    value = [],
    onChange,
    multiple = false,
    accept,
    maxSizeMb = 10,
    disabled = false
}: FileUploadFieldProps) {
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (disabled) return;
        setIsDragging(true);
    }, [disabled]);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, [disabled]);
    
    const handleFiles = (newFiles: File[]) => {
        // Filter by size
        const validFiles = newFiles.filter(file => {
             const sizeMb = file.size / 1024 / 1024;
             return sizeMb <= maxSizeMb;
        });

        if (validFiles.length < newFiles.length) {
            console.warn("Some files were too large");
        }

        if (multiple) {
            onChange([...value, ...validFiles]);
        } else {
            onChange(validFiles.slice(0, 1));
        }
    };

    const removeFile = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                    "relative group border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer",
                    isDragging 
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50" 
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/20",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    multiple={multiple}
                    accept={accept}
                    onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                    disabled={disabled}
                />
                
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        isDragging ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                    )}>
                        <CloudArrowUpIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <span className="text-zinc-900 dark:text-zinc-100 underline underline-offset-4 decoration-zinc-200 dark:decoration-zinc-700">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                            {accept ? accept.replace(/,/g, ', ') : 'Any file'} (max {maxSizeMb}MB)
                        </p>
                    </div>
                </div>
            </div>

            {value.length > 0 && (
                <ul className="space-y-2">
                    {value.map((file, idx) => (
                        <li key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                    <DocumentIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{file.name}</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Simple internal cn utility is no longer needed since we use @/lib/utils
