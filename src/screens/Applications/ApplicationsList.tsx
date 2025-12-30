import { DataTable } from '../../data-components/dataTable'
import type { Field } from '../../data-components/dataTable'
import { Badge } from '../../components/badge'

type Application = {
  id: string
  subject: string
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired'
  access: string
  url: string
  appliedAt: Date
  candidate: string
}

const fields: Field<Application>[] = [
  { 
    key: 'subject', 
    label: 'Role',
    render: (item: Application) => (
      <div className="flex items-start gap-3">
        <Badge color={item.status === 'applied' ? 'zinc' : 'lime'}>
          {item.status}
        </Badge>
        <div className="flex flex-col">
          <span className="font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{item.subject}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] capitalize">{item.candidate}</span>
        </div>
      </div>
    )
  },
  { key: 'appliedAt', label: 'Applied', type: 'date' },
  { key: 'actions', label: '', type: 'actions' }
]

export function ApplicationsList({ list }: { list: Application[] }) {
  return (
    <DataTable<Application>
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