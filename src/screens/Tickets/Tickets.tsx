import { SplitTwoLayout } from '../../components/split-two-layout';
import { TicketsList } from './TicketsList';
import { TicketChat } from './TicketChat';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase/config'

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
  const mockMessages = [
    {
      id: 1,
      content: 'Hello, how are you?',
      sender: { name: 'John Doe', isCurrentUser: true },
      timestamp: '2021-01-01 12:00:00',
    },
    {
      id: 2,
      content: 'I am fine, thank you!',
      sender: { name: 'Jane Doe', isCurrentUser: false },
      timestamp: '2021-01-01 12:01:00',
    },

  ]
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const handleSendMessage = (content: string) => {
    setMessages([...messages, { id: Date.now(), content, sender: { name: 'John Doe', isCurrentUser: true }, timestamp: new Date().toISOString() }]);
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          console.log('User not authenticated')
          return
        }
        const token = await currentUser.getIdToken()
        const grantId = import.meta.env.VITE_NYLAS_GRANT_ID
        console.log(token)
        const response = await fetch(`https://us-central1-zanaa-desk.cloudfunctions.net/getMessages?grantId=${grantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            grantId: grantId
          })
        })
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please log in again')
          }
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        console.log(data)
      } catch (err) {
        console.log(err)
      }
    }

    fetchMessages()
  }, [])

  return (
    <SplitTwoLayout
      leftColumn={
        <div className="h-screen dark:bg-zinc-800 p-4 border-r border-zinc-200 dark:border-zinc-700">
          <TicketsList users={users} />
        </div>
      }
      rightColumn={
        <div className="h-full">
          <TicketChat messages={messages} onSendMessage={handleSendMessage} />
        </div>
      }
    />
  )
}