import {
  Wrench, Zap, Car, Hammer, Layers, Wind, Tv, Flame,
  Scissors, Paintbrush, TreePine, Droplets, Laptop,
  LayoutGrid, AppWindow, KeyRound, Snowflake, Smartphone,
  SprayCan, Truck, Shirt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  plomberie:       Droplets,
  electricite:     Zap,
  mecanique:       Car,
  menuiserie:      Hammer,
  maconnerie:      Layers,
  climatisation:   Wind,
  electromenager:  Tv,
  soudure:         Flame,
  informatique:    Laptop,
  coiffure:        Scissors,
  peinture:        Paintbrush,
  jardinage:       TreePine,
  carrelage:       LayoutGrid,
  vitrerie:        AppWindow,
  serrurerie:      KeyRound,
  froid:           Snowflake,
  refrigeration:   Snowflake,
  telephone:       Smartphone,
  nettoyage:       SprayCan,
  menage:          SprayCan,
  demenagement:    Truck,
  manutention:     Truck,
  couture:         Shirt,
  retouche:        Shirt,
}

export function getServiceIcon(slug?: string, name?: string): LucideIcon {
  if (slug) {
    const normalized = slug.toLowerCase().replace(/[-_\s]/g, '')
    for (const [key, icon] of Object.entries(SERVICE_ICON_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) return icon
    }
  }
  if (name) {
    const n = name.toLowerCase()
    if (n.includes('plomb') || n.includes('tuyau') || n.includes('eau'))         return Droplets
    if (n.includes('élec') || n.includes('elec') || n.includes('courant') || n.includes('câbl'))  return Zap
    if (n.includes('auto') || n.includes('mécan') || n.includes('meca') || n.includes('moto'))    return Car
    if (n.includes('menuis') || n.includes('bois') || n.includes('ébén'))        return Hammer
    if (n.includes('maçon') || n.includes('macon') || n.includes('béton') || n.includes('ciment'))  return Layers
    if (n.includes('carrel') || n.includes('faïence') || n.includes('faience')) return LayoutGrid
    if (n.includes('vitr') || n.includes('verre') || n.includes('fenêtre'))     return AppWindow
    if (n.includes('serrur') || n.includes('clé') || n.includes('clef'))         return KeyRound
    if (n.includes('froid') || n.includes('réfrig') || n.includes('refrig') || n.includes('frigo'))  return Snowflake
    if (n.includes('clim') || n.includes('ventil'))                              return Wind
    if (n.includes('ménager') || n.includes('menager') || n.includes('lave'))    return Tv
    if (n.includes('téléphone') || n.includes('telephone') || n.includes('mobile') || n.includes('smartphone'))  return Smartphone
    if (n.includes('soud') || n.includes('métal') || n.includes('fer'))          return Flame
    if (n.includes('info') || n.includes('ordinat') || n.includes('laptop') || n.includes('bureautique') || n.includes('pc'))  return Laptop
    if (n.includes('peint') || n.includes('pinceau'))                             return Paintbrush
    if (n.includes('coiff') || n.includes('cheveu') || n.includes('esthét') || n.includes('esthet'))  return Scissors
    if (n.includes('jardin') || n.includes('arbre') || n.includes('espaces verts'))  return TreePine
    if (n.includes('nettoy') || n.includes('ménage') || n.includes('menage') || n.includes('propreté'))  return SprayCan
    if (n.includes('déménag') || n.includes('demenag') || n.includes('manuten') || n.includes('transport'))  return Truck
    if (n.includes('coutur') || n.includes('retouche') || n.includes('tissu'))   return Shirt
  }
  return Wrench
}

/** Renders the Lucide icon for a service slug/name */
export function ServiceIcon({
  slug,
  name,
  className = 'h-4 w-4',
}: {
  slug?: string
  name?: string
  className?: string
}) {
  const Icon = getServiceIcon(slug, name)
  return <Icon className={className} />
}

/*
 * Teinte plate par métier — couleurs sobres, compatibles mode sombre.
 * (Classes écrites en toutes lettres pour rester détectables par Tailwind.)
 */
const SERVICE_COLOR_MAP: Record<string, string> = {
  plomberie:      'bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-800',
  electricite:    'bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800',
  mecanique:      'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-800',
  menuiserie:     'bg-yellow-50 text-yellow-700 ring-yellow-200/70 dark:bg-yellow-900/20 dark:text-yellow-300 dark:ring-yellow-800',
  maconnerie:     'bg-stone-100 text-stone-700 ring-stone-300/70 dark:bg-stone-800/40 dark:text-stone-300 dark:ring-stone-700',
  climatisation:  'bg-cyan-50 text-cyan-700 ring-cyan-200/70 dark:bg-cyan-900/20 dark:text-cyan-300 dark:ring-cyan-800',
  electromenager: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70 dark:bg-indigo-900/20 dark:text-indigo-300 dark:ring-indigo-800',
  soudure:        'bg-red-50 text-red-700 ring-red-200/70 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800',
  informatique:   'bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-800',
  coiffure:       'bg-pink-50 text-pink-700 ring-pink-200/70 dark:bg-pink-900/20 dark:text-pink-300 dark:ring-pink-800',
  peinture:       'bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-800',
  jardinage:      'bg-green-50 text-green-700 ring-green-200/70 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-800',
  carrelage:      'bg-teal-50 text-teal-700 ring-teal-200/70 dark:bg-teal-900/20 dark:text-teal-300 dark:ring-teal-800',
  vitrerie:       'bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-800',
  serrurerie:     'bg-zinc-100 text-zinc-700 ring-zinc-300/70 dark:bg-zinc-800/40 dark:text-zinc-300 dark:ring-zinc-700',
  froid:          'bg-blue-50 text-blue-700 ring-blue-200/70 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800',
  refrigeration:  'bg-blue-50 text-blue-700 ring-blue-200/70 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800',
  telephone:      'bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-800',
  nettoyage:      'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800',
  menage:         'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800',
  demenagement:   'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-800',
  manutention:    'bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-800',
  couture:        'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:ring-fuchsia-800',
  retouche:       'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/70 dark:bg-fuchsia-900/20 dark:text-fuchsia-300 dark:ring-fuchsia-800',
}

const DEFAULT_SERVICE_COLOR =
  'bg-brand-50 text-brand-700 ring-brand-200/70 dark:bg-brand-900/20 dark:text-brand-300 dark:ring-brand-800'

/** Classe de teinte plate (bg + text + ring) pour un métier donné. */
export function getServiceColorClasses(slug?: string, name?: string): string {
  if (slug) {
    const normalized = slug.toLowerCase().replace(/[-_\s]/g, '')
    for (const [key, cls] of Object.entries(SERVICE_COLOR_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) return cls
    }
  }
  if (name) {
    const n = name.toLowerCase().replace(/[-_\s]/g, '')
    for (const [key, cls] of Object.entries(SERVICE_COLOR_MAP)) {
      if (n.includes(key)) return cls
    }
  }
  return DEFAULT_SERVICE_COLOR
}

/**
 * Badge métier — icône + libellé, teinté par service.
 * Marque clairement chaque carte artisan par son métier.
 */
export function ServiceTag({
  slug,
  name,
  size = 'md',
  className = '',
}: {
  slug?: string
  name?: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const Icon = getServiceIcon(slug, name)
  const color = getServiceColorClasses(slug, name)
  const label = name || 'Service'
  const sizing = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full font-semibold ring-1 ring-inset ${sizing} ${color} ${className}`}
      title={label}
    >
      <Icon className={`${iconSize} flex-shrink-0`} aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  )
}
