import { DataTable } from '../../data-components/dataTable'
import type { Field } from '../../data-components/dataTable'

type Ticket = {
  id: string
  subject: string
  status: 'open' | 'closed'
  access: string
  url: string
}

const fields: Field<Ticket>[] = [
  { key: 'status', label: 'Status', type: 'badge' },
  { 
    key: 'subject', 
    label: 'Name',
    render: (item: Ticket) => (
      <div className="flex items-center gap-4">
        <div>
          <div className="font-medium">{item.subject}</div>
        </div>
      </div>
    )
  },
  { key: 'access', label: 'Role' },
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