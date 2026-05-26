import {
  Wrench, Zap, Car, Hammer, Layers, Wind, Tv, Flame,
  Scissors, Paintbrush, TreePine, Droplets, Laptop, Cpu,
  Package, Settings, Bolt,
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
    if (n.includes('elect') || n.includes('courant') || n.includes('câbl'))      return Zap
    if (n.includes('auto') || n.includes('mécan') || n.includes('moto'))         return Car
    if (n.includes('menuis') || n.includes('bois') || n.includes('ébén'))        return Hammer
    if (n.includes('maçon') || n.includes('béton') || n.includes('ciment'))      return Layers
    if (n.includes('clim') || n.includes('froid') || n.includes('ventil'))       return Wind
    if (n.includes('ménager') || n.includes('frigo') || n.includes('lave'))      return Tv
    if (n.includes('soud') || n.includes('métal') || n.includes('fer'))          return Flame
    if (n.includes('info') || n.includes('ordinat') || n.includes('laptop') || n.includes('pc'))  return Laptop
    if (n.includes('peint') || n.includes('pinceau'))                             return Paintbrush
    if (n.includes('coiff') || n.includes('cheveu'))                              return Scissors
    if (n.includes('jardin') || n.includes('arbre'))                              return TreePine
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
