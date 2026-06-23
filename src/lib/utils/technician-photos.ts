/**
 * Photo de portrait déterministe par technicien, COHÉRENTE AVEC LE GENRE.
 *
 * Objectif : chaque technicien sans avatar uploadé obtient TOUJOURS le même
 * portrait distinct, pris dans le pool de son genre (les artisanes reçoivent des
 * photos de femmes, les artisans des photos d'hommes). On évite les doublons
 * tant que le pool du genre n'est pas épuisé.
 *
 * La photo réelle (`avatar_url`) reste prioritaire : ce helper n'est utilisé
 * qu'en repli. Si l'image ne charge pas, l'`Avatar` retombe sur les initiales.
 *
 * Photos réelles fournies, recadrées et servies depuis public/artisans/.
 */

const photo = (n: number) => `/artisans/artisan-${String(n).padStart(2, '0')}.jpg`

// Classement manuel des 29 photos par genre (cf. planche-contact).
const FEMALE_PHOTOS = [12, 13, 16, 17, 19].map(photo)
const MALE_PHOTOS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 18,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
].map(photo)

// Prénoms féminins guinéens courants (normalisés sans accents) → permet de
// router une artisane vers une photo de femme. Tout le reste = pool masculin.
const FEMALE_FIRST_NAMES = new Set([
  'fatoumata', 'fatim', 'fatima', 'mariama', 'mariam', 'aissatou', 'aicha', 'aisha',
  'hadja', 'binta', 'kadiatou', 'kadidiatou', 'hawa', 'aminata', 'khadija', 'kadija',
  'fanta', 'nene', 'oumou', 'salimatou', 'saran', 'djenabou', 'mabinty', 'ramatoulaye',
  'hassanatou', 'mamou', 'sira', 'kankou', 'maimouna', 'safiatou', 'rouguiatou',
  'kadiatu', 'aissata', 'neneh', 'houleymatou', 'djamilatou', 'fatoumatta',
])

function normalizeFirstName(name?: string | null): string {
  if (!name) return ''
  return name.trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function isFemaleName(name?: string | null): boolean {
  return FEMALE_FIRST_NAMES.has(normalizeFirstName(name))
}

/** Hash déterministe simple (FNV-1a) → entier positif. */
function hashSeed(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Renvoie une URL de portrait stable pour un technicien, dans le pool de son
 * genre (déduit du prénom). Sans nom → pool masculin (majoritaire).
 */
export function getTechnicianPhoto(
  seed: string | number | undefined | null,
  name?: string | null,
  _width = 240,
): string {
  const pool = isFemaleName(name) ? FEMALE_PHOTOS : MALE_PHOTOS
  const key = String(seed ?? 'soslocal')
  return pool[hashSeed(key) % pool.length]
}

/**
 * Résout la source d'image d'un technicien : sa vraie photo si elle existe,
 * sinon un portrait distinct, cohérent avec son genre.
 */
export function resolveTechnicianAvatar(
  tech: { avatar_url?: string | null; id?: string | number; user_id?: string | number; email?: string; name?: string },
  width = 240,
): string {
  if (tech.avatar_url) return tech.avatar_url
  const seed = tech.id ?? tech.user_id ?? tech.email ?? tech.name
  return getTechnicianPhoto(seed, tech.name, width)
}
