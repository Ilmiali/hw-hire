import { BaseItem } from '../components/autosuggest';
import { Database } from '../types/database';
import { QueryOptions } from '../types/database';
import { useEffect, useState } from 'react';
import { Input } from '../components/input';
import { Chip } from '../components/chips';

interface DatabaseAutosuggestProps<T extends BaseItem> {
  collectionName: string;
  selectedItems: (T & { role?: string })[];
  onSelect: (item: T & { role?: string }) => void;
  onRemove: (id: string) => void;
  database: Database;
  placeholder?: string;
  renderItem?: (item: T) => React.ReactNode;
  renderChip?: (item: T & { role?: string }, onRemove: (id: string) => void) => React.ReactNode;
  className?: string;
  queryOptions?: QueryOptions;
  searchField?: string;
  defineRole?: boolean;
  availableRoles?: string[];
  onRoleChange?: (id: string, role: string) => void;
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
  defineRole = false,
  availableRoles = [],
}: DatabaseAutosuggestProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(defineRole && availableRoles.length > 0 ? availableRoles[0] : '');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

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
    onSelect({ ...item, role: selectedRole } as T & { role?: string });
    setQuery('');
    setDropdownOpen(false);
    setSelectedRole(defineRole && availableRoles.length > 0 ? availableRoles[0] : '');
  };

  const renderDefaultChip = (item: T & { role?: string }, onRemove: (id: string) => void) => (
    <div className="flex items-center gap-2">
      <Chip
        name={item.name}
        secondaryText={item.role}
        avatarUrl={item.avatarUrl}
        onRemove={() => onRemove(item.id)}
      />
    </div>
  );

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map(item => (
          <div key={item.id}>
            {renderChip ? renderChip(item, onRemove) : renderDefaultChip(item, onRemove)}
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="relative flex items-center rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus-within:border-zinc-500 dark:focus-within:border-zinc-400 transition-colors">
          <Input
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
            placeholder={loading ? 'Loading...' : placeholder}
            className="w-full border-0 focus:ring-0"
            autoComplete="off"
            rightButton={defineRole ? {
              type: 'dropdown',
              children: (
                <div className="flex items-center gap-1 text-sm">
                  <span className="whitespace-nowrap">{selectedRole}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              ),
              onClick: () => setRoleDropdownOpen(!roleDropdownOpen)
            } : undefined}
          />
        </div>
        {roleDropdownOpen && defineRole && (
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20">
            {availableRoles.map(role => (
              <button
                key={role}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg dark:text-zinc-100 text-zinc-900"
                onMouseDown={() => {
                  setSelectedRole(role);
                  setRoleDropdownOpen(false);
                }}
              >
                {role}
              </button>
            ))}
          </div>
        )}
        {dropdownOpen && items.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {items.map(item => (
              <button
                type="button"
                key={item.id}
                className="flex items-center w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left first:rounded-t-lg last:rounded-b-lg"
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
