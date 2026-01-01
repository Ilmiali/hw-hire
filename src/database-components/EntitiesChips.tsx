import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import type { Entity } from './EntitiesTable';

interface EntitiesChipsProps<T extends Entity> {
  entities: T[];
  nameField: keyof T;
  avatarField?: keyof T;
  className?: string;
  onRemove?: (entity: T) => void;
  maxChips?: number;
}

export function EntitiesChips<T extends Entity>({
  entities,
  nameField,
  avatarField,
  className = '',
  onRemove,
  maxChips,
}: EntitiesChipsProps<T>) {
  const displayedEntities = maxChips ? entities.slice(0, maxChips) : entities;
  const remainingCount = maxChips ? entities.length - maxChips : 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayedEntities.map((entity) => (
        <Badge
          key={entity.id}
          variant="secondary"
          className="pl-1 pr-1 py-0.5 gap-1.5 font-normal h-7"
        >
          {avatarField && entity[avatarField] ? (
            <Avatar className="h-5 w-5">
              <AvatarImage src={String(entity[avatarField])} alt={String(entity[nameField])} />
              <AvatarFallback className="text-[10px] bg-primary/10">
                {String(entity[nameField]).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-5 w-4" /> 
          )}
          <span className="max-w-[120px] truncate">{String(entity[nameField])}</span>
          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(entity);
              }}
              className="rounded-full outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 hover:bg-muted p-0.5"
            >
              <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="font-normal text-muted-foreground h-7">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
} 