import React from 'react'
import clsx from 'clsx'

interface SplitTwoLayoutProps {
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
  className?: string
  leftColumnClassName?: string
  rightColumnClassName?: string
  leftColumnWidth?: string
  hideColumn?: 'left' | 'right' | 'none'
}

export function SplitTwoLayout({
  leftColumn,
  rightColumn,
  className,
  leftColumnClassName,
  rightColumnClassName,
  leftColumnWidth,
  hideColumn = 'none',
}: SplitTwoLayoutProps) {
  return (
    <div className={clsx('flex h-full', className)}>
      {hideColumn !== 'left' && (
        <aside 
          style={{width: hideColumn === 'right' ? '100%' : leftColumnWidth, maxWidth: hideColumn === 'right' ? '100%' : '50%'}} 
          className={clsx('hidden lg:block shrink-0', leftColumnClassName)}
        >
          {leftColumn}
        </aside>
      )}
      {hideColumn !== 'right' && (
        <main 
          className={clsx('flex-1 min-w-0', rightColumnClassName, {
            'w-full': hideColumn === 'left'
          })}
        >
          {rightColumn}
        </main>
      )}
    </div>
  )
}