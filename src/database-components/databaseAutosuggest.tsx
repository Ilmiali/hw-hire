import { BaseItem } from '../components/autosuggest';
import { Database } from '../types/database';
import { QueryOptions } from '../types/database';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

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
  ignoreList?: string[];
  availableItems?: T[];
}

export function DatabaseAutosuggest<T extends BaseItem>({
  collectionName,
  selectedItems,
  onSelect,
  onRemove,
  database,
  placeholder = 'Search team members...',
  renderItem,
  renderChip,
  className = '',
  queryOptions,
  searchField = 'name',
  defineRole = false,
  availableRoles = [],
  ignoreList = [],
  availableItems,
  onRoleChange,
}: DatabaseAutosuggestProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(defineRole && availableRoles.length > 0 ? availableRoles[0] : '');

  useEffect(() => {
    if (defineRole && availableRoles.length > 0 && !selectedRole) {
      setSelectedRole(availableRoles[0]);
    }
  }, [availableRoles, defineRole, selectedRole]);

  const filterItemsLocally = useCallback((search: string) => {
    if (!availableItems) return [];
    const lowerQuery = search.toLowerCase();
    return availableItems.filter(item => 
      (item.name?.toLowerCase().includes(lowerQuery) || 
       item.id?.toLowerCase().includes(lowerQuery) ||
       (item as any).email?.toLowerCase().includes(lowerQuery)) &&
      !selectedItems.some(selected => selected.id === item.id) &&
      !ignoreList.includes(item.id)
    );
  }, [availableItems, selectedItems, ignoreList]);

  const fetchItems = async (search: string) => {
    setLoading(true);
    try {
      const options: QueryOptions = {
        ...queryOptions,
        constraints: [
          ...(queryOptions?.constraints || []),
          {
            field: searchField,
            operator: '>=',
            value: search,
          },
          {
            field: searchField,
            operator: '<=',
            value: search + '\uf8ff',
          },
        ],
      };

      const documents = await database.getDocuments(collectionName, options);
      const mappedItems = documents
        .map(doc => ({
          id: doc.id,
          ...doc.data,
        })) as T[];
      
      const selectedIds = new Set(selectedItems.map(item => item.id));
      const ignoredIds = new Set(ignoreList);
      const filteredItems = mappedItems.filter(item => 
        !selectedIds.has(item.id) && !ignoredIds.has(item.id)
      );
      
      setItems(filteredItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (availableItems) {
      if (query.length > 0) {
        setItems(filterItemsLocally(query));
      } else {
        setItems([]);
      }
      return;
    }

    const timer = setTimeout(() => {
      if (query.length > 0) {
        fetchItems(query);
      } else {
        setItems([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, availableItems, filterItemsLocally]);

  const handleSelect = (item: T) => {
    onSelect({ ...item, role: selectedRole } as T & { role?: string });
    setQuery('');
    setOpen(false);
  };

  const renderDefaultChip = (item: T & { role?: string }, onRemove: (id: string) => void) => (
    <Badge 
      variant="secondary" 
      className="pl-1 pr-1 py-0.5 gap-1.5 font-normal h-8"
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={item.avatarUrl || undefined} alt={item.name} />
        <AvatarFallback className="text-[10px] bg-primary/10">
          {(item.name || 'U').substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight max-w-[150px]">
        <span className="truncate text-[11px] font-medium">{item.name}</span>
        {item.role && !defineRole && <span className="text-[9px] text-muted-foreground capitalize">{item.role}</span>}
      </div>
      
      {defineRole && onRoleChange && (
        <Select 
          value={item.role} 
          onValueChange={(value) => onRoleChange(item.id, value)}
        >
          <SelectTrigger className="h-6 w-auto border-none bg-transparent px-1 text-[9px] hover:bg-muted/50 focus:ring-0 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map(role => (
              <SelectItem key={role} value={role} className="text-[10px] capitalize">
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="rounded-full hover:bg-muted p-0.5"
      >
        <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </Badge>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map(item => (
          <div key={item.id}>
            {renderChip ? renderChip(item, onRemove) : renderDefaultChip(item, onRemove)}
          </div>
        ))}
      </div>
      
      <div className="relative flex items-center rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden">
        <div className="relative flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <input
                  className="flex h-9 w-full bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-text"
                  placeholder={loading ? 'Searching...' : placeholder}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.length > 0) setOpen(true);
                  }}
                  onFocus={() => {
                    if (query.length > 0) setOpen(true);
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="p-0 w-[--radix-popover-trigger-width]" 
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList className="max-h-[200px]">
                  {loading && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}
                  {!loading && items.length === 0 && query.length > 0 && (
                    <CommandEmpty>No members found.</CommandEmpty>
                  )}
                  {!loading && items.length > 0 && (
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => handleSelect(item)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {renderItem ? renderItem(item) : (
                            <div className="flex items-center gap-2 py-0.5">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={(item as any).avatarUrl} />
                                <AvatarFallback className="text-[10px]">
                                  {(item.name || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="text-xs text-muted-foreground">{(item as any).email}</span>
                              </div>
                            </div>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {defineRole && (
          <div className="border-l h-9 flex items-center bg-muted/20">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="border-none shadow-none focus:ring-0 h-full w-[110px] bg-transparent text-[11px] font-medium capitalize">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role} className="text-[11px] capitalize">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
} 
