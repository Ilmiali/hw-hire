import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketsList } from './TicketsList';

export default function Tickets() {
  const users = [
    {
      id: 1,
      name: 'New message from John Doe',
      email: 'john.doe@example.com',
      access: 'Admin',
      online: true,
      url: '/tickets/1',
    },
    {
      id: 2,
      name: 'New message from Jane Doe',
      email: 'jane.doe@example.com',
      access: 'User',
      online: false,
      url: '/tickets/2',
    },
    {
      id: 3,
      name: 'New message from Jim Doe',
      email: 'jim.doe@example.com',
      access: 'User',
      online: true,
      url: '/tickets/3',
    },
  ];  
  return (
    <SplitTwoLayout
      leftColumn={
        <div className="h-screen dark:bg-zinc-800 p-4">
          <TicketsList users={users} />
        </div>
      }
      rightColumn={<div>Right Column</div>}
    />
  )
}