'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  label?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, error, label, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-1.5 text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              'w-full h-11 rounded-lg bg-white dark:bg-muted border text-foreground placeholder:text-muted-foreground transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              icon ? 'pl-10' : 'pl-4',
              'pr-4',
              error ? 'border-red-500 focus:ring-red-500' : 'border-border',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-sm text-muted-foreground">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
