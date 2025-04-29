import { Button } from '../components/button';
import { DataTable, Field } from '../data-components/dataTable';
import { EntitiesChips } from './EntitiesChips';

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
  selectable?: boolean;
  isLink?: boolean;
  sticky?: boolean;
  rootPath?: string;
  actions?: ('view' | 'edit' | 'delete')[];
  onSelect?: (selectedIds: string[]) => void;
  showChips?: boolean;
  nameField?: keyof T;
  avatarField?: keyof T;
  maxChips?: number;
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
  selectable = false,
  isLink = false,
  sticky = false,
  rootPath,
  actions = ['view', 'edit', 'delete'],
  onSelect,
  showChips = false,
  nameField = 'name' as keyof T,
  avatarField = 'avatarUrl' as keyof T,
  maxChips,
}: EntitiesTableProps<T>) {
  const handleEntityAction = (action: 'view' | 'edit' | 'delete', entity: T) => {
    if (action === 'delete') {
      onEntitiesChange(entities.filter(e => e.id !== entity.id));
    }
    onAction?.(action, entity);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h3>
        {onAdd && (
          <Button onClick={onAdd} type="button" color="dark/zinc">
            {addButtonText}
          </Button>
        )}
      </div>
      {entities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="text-zinc-400 dark:text-zinc-500 mb-2">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No items added yet</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Click "{addButtonText}" to add new items</p>
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
        <DataTable
          data={entities}
          fields={fields}
          onAction={handleEntityAction}
          dense={dense}
          selectable={selectable}
          isLink={isLink}
          sticky={sticky}
          rootPath={rootPath}
          actions={actions}
          onSelect={onSelect}
        />
      )}
    </div>
  );
} 