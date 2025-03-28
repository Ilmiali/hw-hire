import React from 'react'
import clsx from 'clsx'

interface SplitTwoLayoutProps {
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
  className?: string
  leftColumnClassName?: string
  rightColumnClassName?: string
}

export function SplitTwoLayout({
  leftColumn,
  rightColumn,
  className,
  leftColumnClassName,
  rightColumnClassName,
}: SplitTwoLayoutProps) {
  return (
    <div className={clsx('flex h-full', className)}>
      <aside className={clsx('hidden lg:block shrink-0', leftColumnClassName)}>
        {leftColumn}
      </aside>
      <main className={clsx('flex-1 min-w-0', rightColumnClassName)}>
        <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
          {rightColumn}
        </div>
      </main>
    </div>
  )
}