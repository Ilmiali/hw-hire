import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

export function InputGroup({ children }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="control"
      className={clsx(
        'relative isolate block',
        'has-[[data-slot=icon]:first-child]:[&_input]:pl-10 has-[[data-slot=icon]:last-child]:[&_input]:pr-10 sm:has-[[data-slot=icon]:first-child]:[&_input]:pl-8 sm:has-[[data-slot=icon]:last-child]:[&_input]:pr-8',
        '*:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-3 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:top-2.5 sm:*:data-[slot=icon]:size-4',
        '[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5',
        '*:data-[slot=icon]:text-zinc-500 dark:*:data-[slot=icon]:text-zinc-400'
      )}
    >
      {children}
    </span>
  )
}

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week']
type DateType = (typeof dateTypes)[number]

type InputButtonProps = {
  type?: 'button' | 'dropdown'
  children?: React.ReactNode
  onClick?: () => void
}

export const Input = forwardRef(function Input(
  {
    className,
    rightButton,
    ...props
  }: {
    className?: string
    type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | DateType
    rightButton?: InputButtonProps
  } & Omit<Headless.InputProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        'relative block w-full',
      ])}
    >
      <div className="relative flex items-center">
        <Headless.Input
          ref={ref}
          {...props}
          className={clsx([
            // Date classes
            props.type &&
              dateTypes.includes(props.type) && [
                '[&::-webkit-datetime-edit-fields-wrapper]:p-0',
                '[&::-webkit-date-and-time-value]:min-h-[1.5em]',
                '[&::-webkit-datetime-edit]:inline-flex',
                '[&::-webkit-datetime-edit]:p-0',
                '[&::-webkit-datetime-edit-year-field]:p-0',
                '[&::-webkit-datetime-edit-month-field]:p-0',
                '[&::-webkit-datetime-edit-day-field]:p-0',
                '[&::-webkit-datetime-edit-hour-field]:p-0',
                '[&::-webkit-datetime-edit-minute-field]:p-0',
                '[&::-webkit-datetime-edit-second-field]:p-0',
                '[&::-webkit-datetime-edit-millisecond-field]:p-0',
                '[&::-webkit-datetime-edit-meridiem-field]:p-0',
              ],
            // Basic layout
            'relative block w-full appearance-none rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
            // Typography
            'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
            // Border
            'border border-zinc-200 dark:border-zinc-800',
            // Background color
            'bg-white dark:bg-zinc-900',
            // Focus state
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200',
            // Invalid state
            'data-invalid:border-red-500 data-invalid:focus:border-red-500 data-invalid:focus:ring-red-500/20',
            // Disabled state
            'disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50',
            // System icons
            'dark:[color-scheme:dark]',
            // Right button padding
            rightButton && 'pr-10',
          ])}
        />
        {rightButton && (
          <div className="absolute right-0 flex items-center pr-3">
            {rightButton.type === 'dropdown' ? (
              <Headless.Menu as="div" className="relative">
                <Headless.Menu.Button
                  onClick={rightButton.onClick}
                  className="flex items-center justify-center rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  {rightButton.children}
                </Headless.Menu.Button>
              </Headless.Menu>
            ) : (
              <button
                type="button"
                onClick={rightButton.onClick}
                className="flex items-center justify-center rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {rightButton.children}
              </button>
            )}
          </div>
        )}
      </div>
    </span>
  )
})
