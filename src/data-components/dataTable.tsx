import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../components/dropdown'
import { Badge } from '../components/badge'
import { Checkbox } from '../components/checkbox'
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'
import React from 'react'
import { formatTimeAgo } from '../utils/time'
import { useLocation } from 'react-router-dom'
export type Field<T = Record<string, unknown>> = {
  key: string
  label: string
  type?: 'text' | 'badge' | 'checkbox' | 'actions' | 'date',
  sortable?: boolean,
  sortDirection?: 'asc' | 'desc',
  onSort?: () => void,
  render?: (item: T) => React.ReactNode
}

type Action = 'view' | 'edit' | 'delete'

type DataTableProps<T extends { id: string }> = {
  data: T[]
  fields: Field<T>[]
  selectable?: boolean
  rootPath?: string,
  sticky?: boolean,
  isLink?: boolean
  actions?: Action[]
  onSelect?: (selectedIds: string[]) => void
  onAction?: (action: Action, item: T) => void
}

export function DataTable<T extends { id: string; url?: string }>({ 
  data, 
  fields,
  rootPath,
  selectable = false, 
  isLink = false,
  sticky = false,
  actions = ['view', 'edit', 'delete'],
  onSelect, 
  onAction 
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
      return field.render(item)
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
        return String(value)
    }
  }

  return (
    <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)] h-full" bleed sticky={sticky}>
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
            <TableHeader key={field.key} sortable={field.sortable} sortDirection={field.sortDirection} onSort={field.onSort}>{field.label}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id} href={isLink ? `/${rootPath}/${item.id}` : undefined}>
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