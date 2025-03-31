import { useEffect, useState } from 'react';
import { DataTable, Field } from '../data-components/dataTable';
import { DatabaseService, QueryOptions, Document } from '../services/databaseService';
import { Pagination, PaginationList, PaginationPage, PaginationPrevious, PaginationNext } from '../components/pagination';

interface DatabaseTableProps<T extends Document> {
  collection: string;
  fields: Field<T>[];
  pageSize?: number;
  selectable?: boolean;
  isLink?: boolean;
  actions?: ('view' | 'edit' | 'delete')[];
  onSelect?: (selectedIds: string[]) => void;
  onAction?: (action: 'view' | 'edit' | 'delete', item: T) => void;
  queryOptions?: Omit<QueryOptions, 'limit'>;
}

export function DatabaseTable<T extends Document>({
  collection,
  fields,
  pageSize = 10,
  selectable = false,
  isLink = false,
  actions = ['view', 'edit', 'delete'],
  onSelect,
  onAction,
  queryOptions = {},
}: DatabaseTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const databaseService = DatabaseService.getInstance();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const options: QueryOptions = {
        ...queryOptions,
        sortBy: sortField ? { field: sortField, order: sortOrder } : undefined,
        limit: pageSize,
      };

      const items = await databaseService.getDocuments<T>(collection, options);
      setData(items);
      // Note: In a real implementation, you might want to get the total count from the database
      setTotalItems(items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [collection, currentPage, sortField, sortOrder, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

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
        isLink={isLink}
        actions={actions}
        onSelect={onSelect}
        onAction={onAction}
      />
      <Pagination>
        <PaginationPrevious
          href={currentPage > 1 ? `?page=${currentPage - 1}` : null}
        />
        <PaginationList>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationPage
              key={page}
              href={`?page=${page}`}
              current={page === currentPage}
            >
              {page}
            </PaginationPage>
          ))}
        </PaginationList>
        <PaginationNext
          href={currentPage < totalPages ? `?page=${currentPage + 1}` : null}
        />
      </Pagination>
    </div>
  );
}

