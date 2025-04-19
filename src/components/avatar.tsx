import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { TouchTarget } from './button'
import { Link } from './link'

type AvatarProps = {
  src?: string | null
  variant?: 'square' | 'round' | 'pill' | 'squircle'
  initials?: string
  alt?: string
  className?: string
  light?: boolean
}

export function Avatar({
  src = null,
  variant = 'round',
  initials,
  alt = '',
  className,
  light = false,
  ...props
}: AvatarProps & React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="avatar"
      {...props}
      className={clsx(
        className,
        // Basic layout
        'inline-grid shrink-0 align-middle *:col-start-1 *:row-start-1',
        // Styling variants
        {
          'rounded-lg': variant === 'square',
          'rounded-full': variant === 'round',
          'rounded-[16px]': variant === 'pill',
          'rounded-[20px] sm:rounded-[24px]': variant === 'squircle',
          // Light variant
          'bg-gray-100 dark:bg-white/5 outline outline-1 -outline-offset-1 outline-gray-200 dark:outline-white/10': light,
          'outline -outline-offset-1 outline-black/10 dark:outline-white/10': !light,
        }
      )}
    >
      {initials && (
        <svg
          className={clsx(
            'size-full fill-current p-[5%] text-[48px] font-medium uppercase select-none',
            light && 'text-gray-600 dark:text-white/80'
          )}
          viewBox="0 0 100 100"
          aria-hidden={alt ? undefined : 'true'}
        >
          {alt && <title>{alt}</title>}
          <text x="50%" y="50%" alignmentBaseline="middle" dominantBaseline="middle" textAnchor="middle" dy=".125em">
            {initials}
          </text>
        </svg>
      )}
      {src && <img className={clsx('size-full', 
        variant === 'square' && 'rounded-lg',
        variant === 'pill' && 'rounded-[16px]',
        variant === 'round' && 'rounded-full',
        variant === 'squircle' && 'rounded-[20px] sm:rounded-[24px]'
      )} src={src} alt={alt} />}
    </span>
  )
}

export const AvatarButton = forwardRef(function AvatarButton(
  {
    src,
    variant = 'round',
    initials,
    alt,
    className,
    light,
    ...props
  }: AvatarProps &
    (Omit<Headless.ButtonProps, 'as' | 'className'> | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>),
  ref: React.ForwardedRef<HTMLElement>
) {
  const classes = clsx(
    className,
    {
      'rounded-lg': variant === 'square',
      'rounded-full': variant === 'round',
      'rounded-[16px]': variant === 'pill',
      'rounded-[20px] sm:rounded-[24px]': variant === 'squircle',
    },
    'relative inline-grid focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500'
  )

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
      <TouchTarget>
        <Avatar src={src} variant={variant} initials={initials} alt={alt} light={light} />
      </TouchTarget>
    </Link>
  ) : (
    <Headless.Button {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Avatar src={src} variant={variant} initials={initials} alt={alt} light={light} />
      </TouchTarget>
    </Headless.Button>
  )
})
