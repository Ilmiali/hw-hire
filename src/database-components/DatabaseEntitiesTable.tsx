import { useEffect, useState } from 'react';
import { EntitiesTable, Entity } from './EntitiesTable';
import { DatabaseService, QueryOptions } from '../services/databaseService';
import { Field } from '../data-components/dataTable';
import CheckboxList from '../loaders/CheckboxList';
import FadeIn from 'react-fade-in';
import { Button } from '../components/button';
import { toast } from 'react-toastify';
interface DatabaseEntitiesTableProps<T extends Entity> {
  collection: string;
  fields: Field<T>[];
  title: string;
  addButtonText?: string;
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
  queryOptions?: Omit<QueryOptions, 'limit' | 'startAfter'>;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function DatabaseEntitiesTable<T extends Entity>({
  collection,
  fields,
  title,
  addButtonText = 'Add',
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
  queryOptions = {},
  defaultSortField,
  defaultSortOrder = 'asc',
}: DatabaseEntitiesTableProps<T>) {
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField] = useState<string | null>(defaultSortField || null);
  const [sortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [pageCursors, setPageCursors] = useState<Record<number, string>>({});
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const databaseService = DatabaseService.getInstance();

  const handleDelete = async (entity: T) => {
    try {
      await databaseService.deleteDocument(collection, entity.id);
      // Remove the deleted entity from the local state
      setEntities(prevEntities => prevEntities.filter(e => e.id !== entity.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the item');
    }
  };

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const options: QueryOptions = {
        ...queryOptions,
        sortBy: sortField ? { field: sortField, order: sortOrder } : undefined,
        limit: pageSize,
        startAfter: page > 1 ? pageCursors[page - 1] : undefined,
      };
      const items = await databaseService.getDocuments<T>(collection, options);
      setEntities(items.map(item => {
        const entityData = {
          ...(item.data as any),
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        } as T;
        return entityData;
      }));
      setHasMore(items.length === pageSize);
      
      if (items.length > 0 && sortField) {
        setPageCursors(prev => ({
          ...prev,
          [page]: items[items.length - 1].id
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [collection, currentPage, queryOptions]);

  const handleEntitiesChange = async (newEntities: T[]) => {
    setEntities(newEntities);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(80vh)', marginTop: '30px'}}>
        <CheckboxList />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <FadeIn delay={100} transitionDuration={500}>
      <div className="space-y-4">
        <EntitiesTable<T>
          entities={entities}
          fields={fields}
          title={title}
          addButtonText={addButtonText}
          onEntitiesChange={handleEntitiesChange}
          onAdd={onAdd}
          onAction={(action, entity) => {
            if (action === 'delete') {
              handleDelete(entity);
              toast.success('Item deleted successfully');
            } else if (onAction) {
              onAction(action, entity);
            }
          }}
          dense={dense}
          selectable={selectable}
          isLink={isLink}
          sticky={sticky}
          rootPath={rootPath}
          actions={actions}
          onSelect={onSelect}
          showChips={showChips}
          nameField={nameField}
          avatarField={avatarField}
          maxChips={maxChips}
        />
        {!showChips && (
          <div className="flex justify-center gap-x-2 mt-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              plain
              aria-label="Previous page"
            >
              <svg className="stroke-current" data-slot="icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasMore}
              plain
              aria-label="Next page"
            >
              Next
              <svg className="stroke-current" data-slot="icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M13.25 8L2.75 8M13.25 8L10.75 10.5M13.25 8L10.75 5.5"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </FadeIn>
  );
} 