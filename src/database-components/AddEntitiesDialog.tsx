import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BaseItem } from '../components/autosuggest';
import { DatabaseAutosuggest } from './databaseAutosuggest';
import { useState, useEffect } from 'react';
import { DatabaseFactory } from '../services/factories/databaseFactory';
import { getDatabaseService } from '../services/databaseService';
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
  orgId?: string;
  moduleId?: string;
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
  orgId,
  moduleId = 'hire',
}: AddEntitiesDialogProps<T>) {
  const [selectedEntities, setSelectedEntities] = useState<(T & { role?: string })[]>([]);
  const [availableMembers, setAvailableMembers] = useState<T[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const database = DatabaseFactory.getInstance().getDatabase('firestore');
  const db = getDatabaseService();

  useEffect(() => {
    async function fetchModuleMembers() {
      if (!orgId || !isOpen) return;
      setLoadingMembers(true);
      try {
        const membersPath = `orgs/${orgId}/modules/${moduleId}/members`;
        const membersDocs = await db.getDocuments<any>(membersPath);

        const populated = await Promise.all(
          membersDocs.map(async (mDoc) => {
            const userDoc = await db.getDocument<any>('users', mDoc.id);
            const userData = userDoc?.data || {};
            return {
              id: mDoc.id,
              name: userData.fullName || userData.name || 'Unknown User',
              email: userData.email || '',
              avatarUrl: userData.avatarUrl || userData.photoURL,
              role: mDoc.data?.role || 'Member',
            } as unknown as T;
          })
        );
        setAvailableMembers(populated);
      } catch (error) {
        console.error('Error fetching module members:', error);
      } finally {
        setLoadingMembers(false);
      }
    }

    fetchModuleMembers();
  }, [orgId, moduleId, isOpen]);

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <DatabaseAutosuggest<T & { role?: string }>
            collectionName={collectionName}
            database={database}
            selectedItems={selectedEntities}
            onSelect={handleSelect}
            onRemove={handleRemove}
            placeholder={loadingMembers ? 'Loading team members...' : `Type to search members...`}
            searchField={searchField}
            queryOptions={queryOptions}
            renderItem={renderItem}
            defineRole={defineRole}
            availableRoles={availableRoles}
            onRoleChange={handleRoleChange}
            ignoreList={ignoreList}
            availableItems={orgId ? (availableMembers as any) : undefined}
          />
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={selectedEntities.length === 0}>Add Candidates</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 