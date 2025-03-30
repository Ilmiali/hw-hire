import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../../components/dropdown'
import { Badge } from '../../components/badge'
import { Checkbox } from '../../components/checkbox'
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'

export function TicketsList({ tickets }: { tickets: any[] }) {
  return (
    <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
      <TableHead>
        <TableRow>
          <TableHeader>
            <span className="sr-only">Select</span>
          </TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader className="relative w-0">
            <span className="sr-only">Actions</span>
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id} href={ticket.url}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>
              {ticket.status === 'open' ? <Badge color="lime">Open</Badge> : <Badge color="zinc">{ticket.status}</Badge>}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-medium">{ticket.subject}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-zinc-500">{ticket.access}</TableCell>
            <TableCell>
              <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisHorizontalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem>View</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}