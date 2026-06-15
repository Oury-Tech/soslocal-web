/**
 * Photos thématiques (Unsplash) par métier, pour enrichir les cartes de
 * services. Renvoie une URL optimisée. Fallback générique « outils » si le
 * métier n'est pas répertorié.
 */
const PHOTO_IDS: Record<string, string> = {
  plomberie: '1607472586893-edb57bdc0e39',
  electricite: '1621905251189-08b45d6a269e',
  mecanique: '1486262715619-67b85e0b08d3',
  menuiserie: '1504148455328-c376907d081c',
  maconnerie: '1581094794329-c8112a89af12',
  climatisation: '1635350736475-c8cef4b21906',
  electromenager: '1581578731548-c64695cc6952',
  soudure: '1530124566582-a618bc2615dc',
  informatique: '1517336714731-489689fd1ca8',
  peinture: '1562259949-e8e7689d7828',
  coiffure: '1503951914875-452162b0f3f1',
  jardinage: '1416879595882-3373a0480b5b',
}

const FALLBACK_ID = '1504148455328-c376907d081c'

export function getServicePhoto(slug?: string, name?: string, width = 600): string {
  let id = FALLBACK_ID
  const normalized = (slug ?? '').toLowerCase().replace(/[-_\s]/g, '')
  for (const [key, photoId] of Object.entries(PHOTO_IDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      id = photoId
      break
    }
  }
  if (id === FALLBACK_ID && name) {
    const n = name.toLowerCase()
    if (n.includes('plomb')) id = PHOTO_IDS.plomberie
    else if (n.includes('élec') || n.includes('elec')) id = PHOTO_IDS.electricite
    else if (n.includes('méca') || n.includes('meca') || n.includes('auto')) id = PHOTO_IDS.mecanique
    else if (n.includes('menuis') || n.includes('bois')) id = PHOTO_IDS.menuiserie
    else if (n.includes('maçon') || n.includes('macon')) id = PHOTO_IDS.maconnerie
    else if (n.includes('clim') || n.includes('froid')) id = PHOTO_IDS.climatisation
    else if (n.includes('ménager') || n.includes('menager')) id = PHOTO_IDS.electromenager
    else if (n.includes('soud')) id = PHOTO_IDS.soudure
    else if (n.includes('info') || n.includes('ordinat')) id = PHOTO_IDS.informatique
    else if (n.includes('peint')) id = PHOTO_IDS.peinture
    else if (n.includes('coiff')) id = PHOTO_IDS.coiffure
    else if (n.includes('jardin')) id = PHOTO_IDS.jardinage
  }
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=70&auto=format&fit=crop`
}
