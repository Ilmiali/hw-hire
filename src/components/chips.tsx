import { Avatar } from './avatar';

interface ChipProps {
  name: string;
  secondaryText?: string;
  avatarUrl?: string | null;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Chip({ name, secondaryText, avatarUrl, onRemove, className = '', size = 'md' }: ChipProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  return (
    <div
      className={`flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full ${paddingClasses[size]} ${className}`}
    >
      <Avatar
        src={avatarUrl}
        initials={name.split(' ').map(n => n[0]).join('')}
        className={`${sizeClasses[size]} mr-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100`}
      />
      <div className="flex items-center">
        <span className={`capitalize text-zinc-900 dark:text-zinc-100 ${textSizeClasses[size]}`}>
          {name}
        </span>
        {secondaryText && (
          <span className={`ml-2 text-zinc-500 dark:text-zinc-400 ${textSizeClasses[size]}`}>
            {secondaryText}
          </span>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          className="ml-2 text-zinc-500 hover:text-red-500 focus:outline-none"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </div>
  );
} 