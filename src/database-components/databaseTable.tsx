import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable, Field } from '../data-components/dataTable';
import { DatabaseService, QueryOptions, Document } from '../services/databaseService';
import { Button } from '../components/button';

interface DatabaseTableProps<T extends Document> {
  collection: string;
  fields: Field<T>[];
  pageSize?: number;
  selectable?: boolean;
  isLink?: boolean;
  rootPath?: string;
  actions?: ('view' | 'edit' | 'delete')[];
  onSelect?: (selectedIds: string[]) => void;
  onAction?: (action: 'view' | 'edit' | 'delete', item: T) => void;
  queryOptions?: Omit<QueryOptions, 'limit' | 'startAfter'>;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

export function DatabaseTable<T extends Document>({
  collection,
  fields,
  pageSize = 10,
  selectable = false,
  isLink = false,
  rootPath,
  actions = ['view', 'edit', 'delete'],
  onSelect,
  onAction,
  queryOptions = {},
  defaultSortField,
  defaultSortOrder = 'asc',
}: DatabaseTableProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(defaultSortField || null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [pageCursors, setPageCursors] = useState<Record<number, T>>({});
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  const databaseService = DatabaseService.getInstance();

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
      setData(items);
      setHasMore(items.length === pageSize);
      
      if (items.length > 0) {
        setPageCursors(prev => ({
          ...prev,
          [page]: items[items.length - 1]?.[sortField]
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
  }, [collection, currentPage, sortField, sortOrder, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
    setPageCursors({}); // Reset cursors when sorting changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        fields={fields.map(field => ({
          ...field,
          onClick: () => handleSort(field.key)
        }))}
        selectable={selectable}
        rootPath={rootPath}
        isLink={isLink}
        actions={actions}
        onSelect={onSelect}
        onAction={onAction}
      />
      <div className="flex gap-x-2">
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
    </div>
  );
}

