import { Avatar } from '../../components/avatar'
import { Button } from '../../components/button'
import { Textarea } from '../../components/textarea'
import { PaperAirplaneIcon } from '@heroicons/react/16/solid'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  sender: {
    name: string
    avatar?: string
    isCurrentUser: boolean
  }
  timestamp: string
}

interface TicketChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
}

export function TicketChat({ messages, onSendMessage }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] items-start gap-3 ${
                message.sender.isCurrentUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <Avatar
                src={message.sender.avatar || null}
                alt={message.sender.name}
                className="size-8 bg-blue-500 text-white"
                initials={message.sender.name.split(' ').map(n => n[0]).join('')}
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {message.sender.name}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {message.timestamp}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender.isCurrentUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px]"
            resizable={false}
          />
          <Button type="submit" color="blue" className="self-end">
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
} 