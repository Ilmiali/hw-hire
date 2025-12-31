import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../components/dropdown'
import clsx from 'clsx'
import { Badge } from '../components/badge'
import { Checkbox } from '../components/checkbox'
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'
import React from 'react'
import { formatTimeAgo } from '../utils/time'
export type Field<T = Record<string, unknown>> = {
  key: string
  label: string
  type?: 'text' | 'badge' | 'checkbox' | 'actions' | 'date',
  sortable?: boolean,
  isLink?: boolean,
  render?: (item: T) => React.ReactNode
}

type Action = 'view' | 'edit' | 'delete'

type DataTableProps<T extends { id: string }> = {
  data: T[]
  fields: Field<T>[]
  selectable?: boolean,
  sortField?: string,
  sortOrder?: 'asc' | 'desc',
  onSort?: (field: string) => void,
  rootPath?: string,
  sticky?: boolean,
  isLink?: boolean
  actions?: Action[]
  onSelect?: (selectedIds: string[]) => void
  onAction?: (action: Action, item: T) => void
  selectedId?: string | null
  dense?: boolean
}

export function DataTable<T extends { id: string; url?: string }>({ 
  data, 
  fields,
  selectable = false,
  sticky = false,
  isLink = false,
  sortField,
  sortOrder,
  onSort,
  actions = ['view', 'edit', 'delete'],
  onSelect, 
  onAction,
  selectedId = null,
  dense = false
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const handleSelect = (id: string) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id]
    setSelectedIds(newSelectedIds)
    onSelect?.(newSelectedIds)
  }

  const handleSelectAll = () => {
    const newSelectedIds = selectedIds.length === data.length
      ? []
      : data.map((item) => item.id)
    setSelectedIds(newSelectedIds)
    onSelect?.(newSelectedIds)
  }

  const renderCell = (field: Field<T>, item: T) => {
    if (field.render) {
      const content = field.render(item)
      return field.isLink ? (
        <div 
          onClick={(e) => {
            e.stopPropagation()
            onAction?.('view', item)
          }}
          className="cursor-pointer hover:underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-500"
        >
          {content}
        </div>
      ) : content
    }

    const value = item[field.key as keyof T]

    switch (field.type) {
      case 'badge':
        return (
          <Badge color={value === 'open' ? 'lime' : 'zinc'}>
            {String(value)}
          </Badge>
        )
      case 'checkbox':
        return (
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onChange={() => handleSelect(item.id)}
          />
        )
      case 'date':
        return <span className="text-sm text-zinc-500 dark:text-zinc-400">{formatTimeAgo(value as Date)}</span>
      case 'actions':
        return (
          <div className="-mx-3 -my-1.5 sm:-mx-2.5">
            <Dropdown>
              <DropdownButton plain aria-label="More options">
                <EllipsisHorizontalIcon />
              </DropdownButton>
              <DropdownMenu anchor="bottom end">
                {actions.includes('view') && (
                  <DropdownItem onClick={() => onAction?.('view', item)}>View</DropdownItem>
                )}
                {actions.includes('edit') && (
                  <DropdownItem onClick={() => onAction?.('edit', item)}>Edit</DropdownItem>
                )}
                {actions.includes('delete') && (
                  <DropdownItem onClick={() => onAction?.('delete', item)}>Delete</DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </div>
        )
      default:
        const content = String(value)
        return field.isLink ? (
          <span 
            onClick={(e) => {
              e.stopPropagation()
              onAction?.('view', item)
            }}
            className="cursor-pointer hover:underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-500 font-medium"
          >
            {content}
          </span>
        ) : content
    }
  }

  return (
    <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)] h-full" bleed sticky={sticky} sortField={sortField} sortOrder={sortOrder} onSort={onSort} dense={dense}>   
      <TableHead>
        <TableRow>
          {selectable && (
            <TableHeader>
              <Checkbox
                checked={selectedIds.length === data.length}
                onChange={handleSelectAll}
              />
            </TableHeader>
          )}
          {fields.map((field) => (
            <TableHeader key={field.key} sortable={field.sortable} field={field.key}>{field.label}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item) => (
          <TableRow 
            key={item.id} 
            onClick={isLink ? () => onAction?.('view', item) : undefined}
            className={clsx(
              selectedId === item.id ? 'bg-zinc-100 dark:bg-zinc-700' : '',
              isLink ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : ''
            )}
          >
            {selectable && (
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                />
              </TableCell>
            )}
            {fields.map((field) => (
              <TableCell key={field.key}>
                {renderCell(field, item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}