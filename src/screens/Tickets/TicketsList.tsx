import { DataTable } from '../../data-components/dataTable'
import type { Field } from '../../data-components/dataTable'

type Ticket = {
  id: string
  subject: string
  status: 'open' | 'closed'
  access: string
  url: string
  requestedAt: Date
}

const fields: Field<Ticket>[] = [
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'subject', label: 'Name' },
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