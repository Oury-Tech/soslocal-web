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
