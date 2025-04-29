import { Avatar } from '../components/avatar';
import { Entity } from './EntitiesTable';

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
        <div
          key={entity.id}
          className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1 text-sm"
        >
          <Avatar
            src={entity.avatarUrl}
            initials={entity[nameField].split(' ').map(name => name[0]).join('')}
            className="w-6 h-6 mr-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <span className="capitalize text-zinc-900 dark:text-zinc-100">
            {String(entity[nameField])}
          </span>
          {onRemove && (
            <button
              type="button"
              className="ml-2 text-zinc-500 hover:text-red-500 focus:outline-none"
              onClick={() => onRemove(entity)}
              aria-label={`Remove ${entity[nameField]}`}
            >
              ×
            </button>
          )}
        </div>
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