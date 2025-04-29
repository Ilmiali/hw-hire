import { Entity } from './entitiesTable';
import { Chip } from '../components/chips';

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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayedEntities.map((entity) => (
        <Chip
          key={entity.id}
          name={String(entity[nameField])}
          avatarUrl={avatarField && entity[avatarField] ? String(entity[avatarField]) : undefined}
          onRemove={onRemove ? () => onRemove(entity) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            +{remainingCount} more
          </span>
        </div>
      )}
    </div>
  );
} 