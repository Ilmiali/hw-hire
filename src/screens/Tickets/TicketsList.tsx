import { DataTable } from '../../data-components/dataTable'
import type { Field } from '../../data-components/dataTable'
import { Badge } from '../../components/badge'

type Ticket = {
  id: string
  subject: string
  status: 'open' | 'closed'
  access: string
  url: string
  requestedAt: Date
  requestedBy: string
}

const fields: Field<Ticket>[] = [
  { 
    key: 'subject', 
    label: 'Subject',
    render: (item: Ticket) => (
      <div className="flex items-start gap-3">
        <Badge color={item.status === 'open' ? 'lime' : 'zinc'}>
          {item.status}
        </Badge>
        <div className="flex flex-col">
          <span className="font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{item.subject}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] capitalize">{item.requestedBy}</span>
        </div>
      </div>
    )
  },
  { key: 'requestedAt', label: 'Requested', type: 'date' },
  { key: 'actions', label: '', type: 'actions' }
]

export function TicketsList({ list }: { list: Ticket[] }) {
  return (
    <DataTable<Ticket>
      data={list}
      fields={fields}
      selectable
      isLink
      actions={['view', 'delete']}
      onAction={(action, item) => {
        switch (action) {
          case 'view':
            window.location.href = item.url
            break
          case 'delete':
            // Handle delete
            break
        }
      }}
    />
  )
}