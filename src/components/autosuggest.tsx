import { Input } from './input';
import { Avatar } from './avatar';
import { useRef, useState } from 'react';

// Base type that all items must have
export interface BaseItem {
  id: string;
}

// Type for items that have name, email, and avatarUrl
interface WithUserDetails {
  name: string;
  email?: string;
  avatarUrl?: string;
}

// Type guard to check if an item has user details
function hasUserDetails(item: BaseItem): item is BaseItem & WithUserDetails {
  return 'name' in item;
}

interface AutosuggestProps<T extends BaseItem> {
  items: T[];
  selectedItems: T[];
  onSelect: (item: T) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
  renderItem?: (item: T) => React.ReactNode;
  renderChip?: (item: T, onRemove: (id: string) => void) => React.ReactNode;
  filterItem?: (item: T, query: string) => boolean;
  className?: string;
}

export function Autosuggest<T extends BaseItem>({
  items,
  selectedItems,
  onSelect,
  onRemove,
  placeholder = 'Type to search...',
  renderItem,
  renderChip,
  filterItem,
  className = '',
}: AutosuggestProps<T>) {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default filter function if none provided
  const defaultFilterItem = (item: T, query: string) => {
    const searchableFields = Object.values(item).filter(
      value => typeof value === 'string'
    ) as string[];
    return searchableFields.some(field =>
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter items based on query and exclude already selected items
  const filteredItems = items.filter(
    item =>
      !selectedItems.some(selected => selected.id === item.id) &&
      (filterItem ? filterItem(item, query) : defaultFilterItem(item, query))
  );

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery('');
    setDropdownOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputFocus = () => {
    setDropdownOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing dropdown to allow click
    setTimeout(() => setDropdownOpen(false), 100);
  };

  // Default item renderer that assumes name, email, and avatarUrl properties
  const defaultRenderItem = (item: T) => {
    if (!hasUserDetails(item)) {
      return <div>{item.id}</div>;
    }

    return (
      <div className="flex items-center">
        {item.avatarUrl && (
          <Avatar
            src={item.avatarUrl}
            initials={item.name[0]}
            className="w-6 h-6 mr-2"
          />
        )}
        <div>
          <div className="font-medium">{item.name}</div>
          {item.email && (
            <div className="text-xs text-zinc-500">{item.email}</div>
          )}
        </div>
      </div>
    );
  };

  // Default chip renderer that assumes name and avatarUrl properties
  const defaultRenderChip = (item: T, onRemove: (id: string) => void) => {
    if (!hasUserDetails(item)) {
      return (
        <span className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm">
          <span>{item.id}</span>
          <button
            type="button"
            className="ml-2 text-zinc-500 hover:text-red-500 focus:outline-none"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.id}`}
          >
            ×
          </button>
        </span>
      );
    }

    return (
      <span className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm">
        {item.avatarUrl && (
          <Avatar
            src={item.avatarUrl}
            initials={item.name[0]}
            className="w-5 h-5 mr-2"
          />
        )}
        <span>{item.name}</span>
        <button
          type="button"
          className="ml-2 text-zinc-500 hover:text-red-500 focus:outline-none"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          ×
        </button>
      </span>
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map(item => (
          <div key={item.id}>
            {renderChip ? renderChip(item, onRemove) : defaultRenderChip(item, onRemove)}
          </div>
        ))}
      </div>
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full"
          autoComplete="off"
        />
        {dropdownOpen && filteredItems.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredItems.map(item => (
              <button
                type="button"
                key={item.id}
                className="flex items-center w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                onMouseDown={() => handleSelect(item)}
              >
                {renderItem ? renderItem(item) : defaultRenderItem(item)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 