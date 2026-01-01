import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { EntitiesChips } from './EntitiesChips';
import { Field } from '../data-components/dataTable';
import { PlusIcon, TrashIcon, EyeIcon, PencilIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

export interface Entity {
  id: string;
  [key: string]: unknown;
}

interface EntitiesTableProps<T extends Entity> {
  entities: T[];
  fields: Field<T>[];
  title: string;
  addButtonText?: string;
  onEntitiesChange: (entities: T[]) => void;
  onAdd?: () => void;
  onAction?: (action: 'view' | 'edit' | 'delete', entity: T) => void;
  dense?: boolean;
  actions?: ('view' | 'edit' | 'delete')[];
  showChips?: boolean;
  nameField?: keyof T;
  avatarField?: keyof T;
  maxChips?: number;
  isActionDisabled?: (action: 'view' | 'edit' | 'delete', entity: T) => boolean;
}

export function EntitiesTable<T extends Entity>({
  entities,
  fields,
  title,
  addButtonText = 'Add',
  onEntitiesChange,
  onAdd,
  onAction,
  dense = false,
  actions = ['view', 'edit', 'delete'],
  showChips = false,
  nameField = 'name' as keyof T,
  avatarField = 'avatarUrl' as keyof T,
  maxChips,
  isActionDisabled,
}: EntitiesTableProps<T>) {
  const handleEntityAction = (action: 'view' | 'edit' | 'delete', entity: T) => {
    if (action === 'delete') {
      onEntitiesChange(entities.filter(e => e.id !== entity.id));
    }
    onAction?.(action, entity);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {onAdd && (
          <Button onClick={onAdd} size="sm" variant="outline" className="h-8 gap-1">
            <PlusIcon className="h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>

      {entities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center border rounded-lg bg-muted/20 border-dashed">
          <div className="text-muted-foreground mb-3 bg-muted p-3 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-sm font-medium">No items added yet</p>
          <p className="text-xs text-muted-foreground mt-1">Click "{addButtonText}" to get started</p>
        </div>
      ) : showChips ? (
        <EntitiesChips
          entities={entities}
          nameField={nameField}
          avatarField={avatarField}
          onRemove={(entity) => handleEntityAction('delete', entity)}
          maxChips={maxChips}
        />
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
                {fields.map((field) => (
                  <TableHead key={field.key} className={cn(dense ? "h-9 py-0" : "h-11")}>
                    {field.label}
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead className="w-[100px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((entity) => (
                <TableRow key={entity.id} className="group border-t last:border-b-0">
                  {fields.map((field) => (
                    <TableCell key={field.key} className={cn(dense ? "py-2 px-3" : "py-3 px-4")}>
                      {field.render ? field.render(entity) : String(entity[field.key as keyof T] || '')}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {actions.includes('view') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEntityAction('view', entity)}
                            disabled={isActionDisabled?.('view', entity)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes('edit') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEntityAction('edit', entity)}
                            disabled={isActionDisabled?.('edit', entity)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.includes('delete') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleEntityAction('delete', entity)}
                            disabled={isActionDisabled?.('delete', entity)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 