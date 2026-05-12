'use client'

import * as React from 'react'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!mounted) {
    return <div className={cn('h-10 w-10 rounded-lg bg-muted animate-pulse', className)} />
  }

  const Icon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Changer de thème"
      >
        <Icon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
          {([
            { v: 'light', label: 'Clair', icon: Sun },
            { v: 'dark', label: 'Sombre', icon: Moon },
            { v: 'system', label: 'Système', icon: Monitor },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              onClick={() => {
                setTheme(opt.v)
                setOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors',
                theme === opt.v && 'text-brand-700 dark:text-brand-300 font-medium'
              )}
            >
              <opt.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{opt.label}</span>
              {theme === opt.v && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
