'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how-it-works' },
  { label: 'Pour qui', href: '#audience' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[rgb(var(--bg)/0.85)] backdrop-blur-xl border-b border-[rgb(var(--border))]'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <nav className="container-app flex items-center justify-between h-16 lg:h-18">
        <Link href="/" aria-label="Accueil SOSLocal">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))] rounded-lg hover:bg-[rgb(var(--muted))] transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))] transition-colors"
          >
            Se connecter
          </Link>
          <Link href="/register" className="hidden sm:block">
            <span className="inline-flex items-center px-5 py-2.5 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
              Commencer
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[rgb(var(--card))] border-t border-[rgb(var(--border))] animate-slide-up">
          <div className="container-app py-4 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[rgb(var(--fg))] hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-[rgb(var(--border))] space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-center text-[rgb(var(--muted-fg))] hover:bg-[rgb(var(--muted))] rounded-lg transition-colors"
              >
                Se connecter
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block">
                <span className="flex items-center justify-center py-3 rounded-full bg-[rgb(var(--fg))] text-[rgb(var(--bg))] text-sm font-semibold">
                  Commencer gratuitement
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
