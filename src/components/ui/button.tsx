'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white hover:bg-brand-600 shadow-soft hover:shadow-soft-lg',
        accent:
          'bg-brand-500 text-white hover:bg-brand-600 shadow-soft hover:shadow-glow',
        outline:
          'border-2 border-brand-500 text-brand-500 dark:border-brand-300 dark:text-brand-300 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-300 dark:hover:text-brand-900',
        ghost:
          'text-[rgb(var(--fg))] hover:bg-muted',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-soft',
        link:
          'text-brand-600 dark:text-brand-300 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
