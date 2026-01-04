import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PipelineTemplate } from '../templates/types';
import { templates } from '../templates/index';

interface PipelineTemplateSelectorProps {
  open: boolean;
  onSelect: (template: PipelineTemplate) => void;
  onCancel: () => void;
}

export function PipelineTemplateSelector({ open, onSelect, onCancel }: PipelineTemplateSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Create a New Pipeline
          </DialogTitle>
          <DialogDescription>
            Choose a starting point for your recruitment workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelect(template)}
              className="group cursor-pointer relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-zinc-900/50 flex flex-col items-start gap-4"
            >
              <div className="flex w-full items-start justify-between">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 transition-colors">
                  {template.icon}
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                    {template.tags.map(tag => (
                    <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-normal hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    >
                        {tag}
                    </Badge>
                    ))}
                </div>
              </div>
              
              <div className="space-y-1.5 flex-1">
                <h3 className="font-semibold text-base leading-none tracking-tight text-zinc-900 dark:text-zinc-50">
                  {template.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-pretty">
                  {template.description}
                </p>
              </div>

              <div className="w-full pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                   <span className="font-medium text-zinc-900 dark:text-zinc-200">{template.stages.length} Stages:</span>
                   <span className="truncate">{template.stages.map(s => s.name).join(' → ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
