import { Dialog, DialogTitle, DialogBody, DialogActions } from '../components/dialog';
import { Button } from '../components/button';
import { BaseItem } from '../components/autosuggest';
import { DatabaseAutosuggest } from './databaseAutosuggest';
import { useState } from 'react';
import { DatabaseFactory } from '../services/factories/databaseFactory';
import { Entity } from './EntitiesTable';
import { QueryOptions } from '../types/database';

interface AddEntitiesDialogProps<T extends Entity & BaseItem> {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entities: T[]) => void;
  collectionName: string;
  searchField: string;
  title: string;
  renderItem: (entity: T) => React.ReactNode;
  queryOptions?: QueryOptions;
  defineRole?: boolean;
  availableRoles?: string[];
  ignoreList?: string[];
}

export function AddEntitiesDialog<T extends Entity & BaseItem>({
  isOpen,
  onClose,
  onAdd,
  collectionName,
  searchField,
  title,
  renderItem,
  queryOptions = {},
  defineRole = false,
  availableRoles = [],
  ignoreList = [],
}: AddEntitiesDialogProps<T>) {
  const [selectedEntities, setSelectedEntities] = useState<(T & { role?: string })[]>([]);
  const database = DatabaseFactory.getInstance().getDatabase('firestore');

  const handleSelect = (entity: T & { role?: string }) => {
    setSelectedEntities(prev => [...prev, entity]);
  };

  const handleRemove = (id: string) => {
    setSelectedEntities(prev => prev.filter(e => e.id !== id));
  };

  const handleRoleChange = (id: string, role: string) => {
    setSelectedEntities(prev => 
      prev.map(entity => 
        entity.id === id ? { ...entity, role } : entity
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEntities.length > 0) {
      onAdd(selectedEntities);
      setSelectedEntities([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatabaseAutosuggest<T & { role?: string }>
            collectionName={collectionName}
            database={database}
            selectedItems={selectedEntities}
            onSelect={handleSelect}
            onRemove={handleRemove}
            placeholder={`Type to search ${collectionName}...`}
            searchField={searchField}
            queryOptions={queryOptions}
            renderItem={renderItem}
            defineRole={defineRole}
            availableRoles={availableRoles}
            onRoleChange={handleRoleChange}
            ignoreList={ignoreList}
          />
          <DialogActions>
            <Button type="submit" disabled={selectedEntities.length === 0}>Add</Button>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
} 