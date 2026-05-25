import {
  Wrench, Zap, Car, Hammer, Layers, Wind, Tv, Flame,
  Scissors, Paintbrush, TreePine, Droplets, Package, Settings,
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
  coiffure:        Scissors,
  peinture:        Paintbrush,
  jardinage:       TreePine,
}

export function getServiceIcon(slug?: string, name?: string): LucideIcon {
  if (slug) {
    const normalized = slug.toLowerCase().replace(/[-_\s]/g, '')
    for (const [key, icon] of Object.entries(SERVICE_ICON_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) return icon
    }
  }
  if (name) {
    const normalized = name.toLowerCase()
    if (normalized.includes('plomb') || normalized.includes('eau'))       return Droplets
    if (normalized.includes('elect') || normalized.includes('courant'))   return Zap
    if (normalized.includes('auto') || normalized.includes('mécan'))      return Car
    if (normalized.includes('menuis') || normalized.includes('bois'))     return Hammer
    if (normalized.includes('maçon') || normalized.includes('béton'))     return Layers
    if (normalized.includes('clim') || normalized.includes('froid'))      return Wind
    if (normalized.includes('élect') || normalized.includes('ménager'))   return Tv
    if (normalized.includes('soud') || normalized.includes('métal'))      return Flame
    if (normalized.includes('peint'))                                      return Paintbrush
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
