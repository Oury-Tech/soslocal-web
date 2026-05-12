'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, FileText, MessageCircle, User, Wrench, Wallet,
  BarChart3, Users, Shield, X, Plus, Settings, LogOut,
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
    { href: '/beneficiaire',           label: 'Accueil',        icon: Home },
    { href: '/beneficiaire/nouvelle',  label: 'Nouvelle demande', icon: Plus,        badge: 'Vite' },
    { href: '/beneficiaire/demandes',  label: 'Mes demandes',   icon: FileText },
    { href: '/chat',                   label: 'Messages',       icon: MessageCircle },
    { href: '/profile',                label: 'Profil',         icon: User },
  ],
  technician: [
    { href: '/artisan',           label: 'Tableau de bord', icon: Home },
    { href: '/artisan/missions',  label: 'Mes missions',    icon: Wrench },
    { href: '/artisan/revenus',   label: 'Revenus',         icon: Wallet },
    { href: '/chat',              label: 'Messages',        icon: MessageCircle },
    { href: '/profile',           label: 'Profil pro',      icon: User },
  ],
  operator: [
    { href: '/operateur',              label: 'Supervision',   icon: BarChart3 },
    { href: '/operateur/artisans',     label: 'Artisans',      icon: Users },
    { href: '/operateur/statistiques', label: 'Statistiques',  icon: BarChart3 },
    { href: '/profile',                label: 'Profil',        icon: User },
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
    if (href !== '/beneficiaire' && href !== '/artisan' && href !== '/operateur' && pathname?.startsWith(href)) return true
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link href="/" onClick={onClose}>
            <Logo size="md" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-900/30 dark:to-accent-900/30 border border-brand-200/30 dark:border-brand-800/30">
            <Shield className="h-4 w-4 text-accent-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Connecté en tant que</div>
              <div className="text-sm font-semibold capitalize truncate">
                {user?.role === 'client'      && 'Bénéficiaire'}
                {user?.role === 'technician'  && 'Artisan certifié'}
                {user?.role === 'operator'    && 'Opérateur Allô Maître'}
                {user?.role === 'admin'       && 'Administrateur'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all',
                      active
                        ? 'bg-brand-700 text-white shadow-soft'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', active ? 'text-white' : 'text-muted-foreground')} />
                    <span className="flex-1">{item.label}</span>
                    {(item as any).badge && (
                      <span className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded-full',
                        active ? 'bg-white/20' : 'bg-accent-600 text-white'
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
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Paramètres</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
