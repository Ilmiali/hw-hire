import { Dropdown, DropdownButton, DropdownItem, DropdownMenu, DropdownLabel } from './dropdown'
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon } from '@heroicons/react/16/solid'
import React from 'react'

export interface ActionItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  className?: string
}

interface ActionDropdownProps {
  onEdit?: () => void
  onDelete?: () => void
  customItems?: ActionItem[]
  className?: string
}

export function ActionDropdown({ onEdit, onDelete, customItems = [], className }: ActionDropdownProps) {
  const hasDefaultActions = onEdit || onDelete
  const hasCustomItems = customItems.length > 0
  const showDivider = hasDefaultActions && hasCustomItems

  return (
    <div className={className}>
      <Dropdown>
        <DropdownButton 
          as="button" 
          className="!bg-transparent !border-0 !shadow-none hover:!bg-gray-100 hover:dark:!bg-gray-700 p-1 rounded-md transition-all"
          onMouseEnter={(e) => {
            e.stopPropagation();
            const parent = e.currentTarget.closest('.group');
            if (parent) {
              parent.classList.add('bg-zinc-950/5', 'dark:bg-white/5', 'rounded-lg');
            }
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            const parent = e.currentTarget.closest('.group');
            if (parent) {
              parent.classList.remove('bg-zinc-950/5', 'dark:bg-white/5', 'rounded-lg');
            }
          }}
        >
          <EllipsisHorizontalIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
        </DropdownButton>
        <DropdownMenu 
          className="min-w-48" 
          anchor="bottom end"
          onMouseEnter={(e) => {
            e.stopPropagation();
            const parent = e.currentTarget.closest('.group');
            if (parent) {
              parent.classList.add('bg-zinc-950/5', 'dark:bg-white/5');
            }
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            const parent = e.currentTarget.closest('.group');
            if (parent) {
              parent.classList.remove('bg-zinc-950/5', 'dark:bg-white/5');
            }
          }}
        >
          {onEdit && (
            <DropdownItem onClick={onEdit}>
              <PencilIcon className="h-4 w-4" />
              <DropdownLabel>Edit</DropdownLabel>
            </DropdownItem>
          )}
          {onDelete && (
            <DropdownItem onClick={onDelete}>
              <TrashIcon className="h-4 w-4" />
              <DropdownLabel>Delete</DropdownLabel>
            </DropdownItem>
          )}
          {showDivider && <div className="my-1 border-t border-gray-200 dark:border-gray-700" />}
          {customItems.map((item, index) => (
            <DropdownItem 
              key={index} 
              onClick={item.onClick}
              className={item.className}
            >
              {item.icon}
              <DropdownLabel>{item.label}</DropdownLabel>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  )
} 