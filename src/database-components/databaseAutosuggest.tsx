import { BaseItem } from '../components/autosuggest';
import { Database } from '../types/database';
import { QueryOptions } from '../types/database';
import { useEffect, useState } from 'react';
import { Input } from '../components/input';
import { Chip } from '../components/chips';

interface DatabaseAutosuggestProps<T extends BaseItem> {
  collectionName: string;
  selectedItems: T[];
  onSelect: (item: T) => void;
  onRemove: (id: string) => void;
  database: Database;
  placeholder?: string;
  renderItem?: (item: T) => React.ReactNode;
  renderChip?: (item: T, onRemove: (id: string) => void) => React.ReactNode;
  className?: string;
  queryOptions?: QueryOptions;
  searchField?: string;
}

export function DatabaseAutosuggest<T extends BaseItem>({
  collectionName,
  selectedItems,
  onSelect,
  onRemove,
  database,
  placeholder = 'Type to search...',
  renderItem,
  renderChip,
  className = '',
  queryOptions,
  searchField = 'name',
}: DatabaseAutosuggestProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchItems = async (query: string) => {
    setLoading(true);
    try {
      const options: QueryOptions = {
        ...queryOptions,
        constraints: [
          ...(queryOptions?.constraints || []),
          {
            field: searchField,
            operator: '>=',
            value: query,
          },
          {
            field: searchField,
            operator: '<=',
            value: query + '\uf8ff',
          },
        ],
      };

      const documents = await database.getDocuments(collectionName, options);
      const mappedItems = documents
        .map(doc => ({
          id: doc.id,
          ...doc.data,
        })) as T[];
      
      // Filter out already selected items
      const selectedIds = new Set(selectedItems.map(item => item.id));
      const filteredItems = mappedItems.filter(item => !selectedIds.has(item.id));
      
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the query to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        fetchItems(query);
      } else {
        setItems([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery('');
    setDropdownOpen(false);
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map(item => (
          <div key={item.id}>
            {renderChip ? renderChip(item, onRemove) : (
              <Chip
                name={item.name}
                avatarUrl={item.avatarUrl}
                onRemove={() => onRemove(item.id)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="relative">
        <Input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
          placeholder={loading ? 'Loading...' : placeholder}
          className="w-full"
          autoComplete="off"
        />
        {dropdownOpen && items.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {items.map(item => (
              <button
                type="button"
                key={item.id}
                className="flex items-center w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                onMouseDown={() => handleSelect(item)}
              >
                {renderItem ? renderItem(item) : (
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium">{item.id}</div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
