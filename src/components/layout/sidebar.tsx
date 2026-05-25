'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, FileText, MessageCircle, User, Wrench, Wallet,
  BarChart3, Users, Shield, X, Plus, Settings, LogOut, Bell, Map, HardHat,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

const NAVIGATION = {
  client: [
    { href: '/beneficiaire',            label: 'Accueil',          icon: Home },
    { href: '/beneficiaire/artisans',   label: 'Artisans',         icon: HardHat },
    { href: '/beneficiaire/nouvelle',   label: 'Nouvelle demande', icon: Plus,        badge: 'Vite' },
    { href: '/beneficiaire/demandes',   label: 'Mes demandes',     icon: FileText },
    { href: '/beneficiaire/carte',      label: 'Carte',            icon: Map },
    { href: '/chat',                    label: 'Messages',         icon: MessageCircle },
    { href: '/notifications',           label: 'Notifications',    icon: Bell },
    { href: '/profile',                 label: 'Profil',           icon: User },
  ],
  technician: [
    { href: '/artisan',           label: 'Tableau de bord', icon: Home },
    { href: '/artisan/missions',  label: 'Mes missions',    icon: Wrench },
    { href: '/artisan/revenus',   label: 'Revenus',         icon: Wallet },
    { href: '/chat',              label: 'Messages',        icon: MessageCircle },
    { href: '/notifications',     label: 'Notifications',   icon: Bell },
    { href: '/profile',           label: 'Profil pro',      icon: User },
  ],
  operator: [
    { href: '/operateur',              label: 'Supervision',    icon: BarChart3 },
    { href: '/operateur/artisans',     label: 'Artisans',       icon: Users },
    { href: '/operateur/statistiques', label: 'Statistiques',   icon: BarChart3 },
    { href: '/notifications',          label: 'Notifications',  icon: Bell },
    { href: '/profile',                label: 'Profil',         icon: User },
  ],
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const nav = user?.role === 'technician'
    ? NAVIGATION.technician
    : user?.role === 'operator' || user?.role === 'admin'
    ? NAVIGATION.operator
    : NAVIGATION.client

  const isActive = (href: string) => {
    if (href === pathname) return true
    if (href === '/beneficiaire' || href === '/artisan' || href === '/operateur') return false
    if (pathname?.startsWith(href)) return true
    return false
  }

  const handleLogout = async () => {
    await logout()
    toast.success('À bientôt !')
    router.push('/')
  }

  return (
    <>
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <Link href="/" onClick={onClose}>
            <Logo size="md" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Role indicator */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/30">
            <Shield className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[rgb(var(--muted-fg))] uppercase tracking-wide font-medium">Connecté en tant que</div>
              <div className="text-sm font-semibold text-[rgb(var(--fg))] truncate">
                {user?.role === 'client'      && 'Bénéficiaire'}
                {user?.role === 'technician'  && 'Artisan'}
                {user?.role === 'operator'    && 'Opérateur'}
                {user?.role === 'admin'       && 'Administrateur'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="text-[10px] font-semibold text-[rgb(var(--muted-fg))] uppercase tracking-wider px-3 mb-2">Navigation</p>
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                      active
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-[rgb(var(--fg))] hover:bg-muted'
                    )}
                  >
                    <item.icon className={cn('h-[18px] w-[18px] flex-shrink-0', active ? 'text-white' : 'text-[rgb(var(--muted-fg))]')} />
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge && (
                      <span className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded-full',
                        active ? 'bg-white/20 text-white' : 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300'
                      )}>
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-border space-y-0.5">
          <Link
            href="/parametres"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors',
              pathname === '/parametres' ? 'bg-brand-500 text-white' : 'text-[rgb(var(--fg))] hover:bg-muted'
            )}
          >
            <Settings className={cn('h-[18px] w-[18px]', pathname === '/parametres' ? 'text-white' : 'text-[rgb(var(--muted-fg))]')} />
            <span>Paramètres</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
