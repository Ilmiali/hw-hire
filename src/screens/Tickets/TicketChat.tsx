import { Menu, MenuItem, MenuItems, MenuButton } from '@headlessui/react'
import { Avatar } from '../../components/avatar'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
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
        <div className="relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full min-h-[60px] pr-32 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
            rows={8}
          />
          <div className="absolute right-4 bottom-4 inline-flex rounded-md shadow-xs">
            <button
              type="submit"
              className="relative inline-flex items-center rounded-l-md bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-white ring-1 ring-zinc-300 dark:ring-zinc-700 ring-inset hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-10"
            >
              Submit
            </button>
            <Menu as="div" className="relative -ml-px block">
              <MenuButton className="relative inline-flex items-center rounded-r-md bg-white dark:bg-zinc-900 px-2 py-2 text-zinc-400 dark:text-zinc-500 ring-1 ring-zinc-300 dark:ring-zinc-700 ring-inset hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-10">
                <span className="sr-only">Open options</span>
                <ChevronDownIcon aria-hidden="true" className="size-5" />
              </MenuButton>
              <MenuItems
                transition
                className="absolute bottom-full right-0 z-10 mb-2 -mr-1 w-56 origin-bottom-right rounded-md bg-white dark:bg-zinc-900 ring-1 shadow-lg ring-black/5 dark:ring-white/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href=""
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 data-focus:bg-zinc-100 dark:data-focus:bg-zinc-800 data-focus:text-zinc-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      Test
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </form>
    </div>
  )
} 