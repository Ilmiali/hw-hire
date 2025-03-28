import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../../components/dropdown'
import { Badge } from '../../components/badge'
import { Checkbox } from '../../components/checkbox'
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table'

export function TicketsList({ users }: { users: any[] }) {
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
        {users.map((user) => (
          <TableRow key={user.handle} href={user.url}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>
              {user.online ? <Badge color="lime">Online</Badge> : <Badge color="zinc">Offline</Badge>}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-medium">{user.name}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-zinc-500">{user.access}</TableCell>
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