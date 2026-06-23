/**
 * Photo de portrait déterministe par technicien.
 *
 * Objectif : éviter l'effet « image dupliquée » quand un technicien n'a pas
 * encore uploadé sa propre photo. Chaque technicien obtient TOUJOURS le même
 * portrait distinct (dérivé d'une graine stable : id / email / nom), parmi un
 * jeu de vraies photos hébergées localement (public/artisans/).
 *
 * La photo réelle (`avatar_url`) reste prioritaire : ce helper n'est utilisé
 * qu'en repli. Si l'image ne charge pas, l'`Avatar` retombe sur les initiales.
 */

// Vraies photos fournies, recadrées en carré et servies en statique depuis
// public/artisans/artisan-01.jpg … artisan-29.jpg.
const PORTRAIT_COUNT = 29

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
 * Renvoie une URL de portrait stable pour un technicien donné.
 * @param seed identifiant stable (id, email ou nom)
 */
export function getTechnicianPhoto(
  seed: string | number | undefined | null,
  _width = 240,
): string {
  const key = String(seed ?? 'soslocal')
  const n = (hashSeed(key) % PORTRAIT_COUNT) + 1
  return `/artisans/artisan-${String(n).padStart(2, '0')}.jpg`
}

/**
 * Résout la source d'image d'un technicien : sa vraie photo si elle existe,
 * sinon un portrait distinct déterministe (jeu de photos local).
 */
export function resolveTechnicianAvatar(
  tech: { avatar_url?: string | null; id?: string | number; user_id?: string | number; email?: string; name?: string },
  width = 240,
): string {
  if (tech.avatar_url) return tech.avatar_url
  const seed = tech.id ?? tech.user_id ?? tech.email ?? tech.name
  return getTechnicianPhoto(seed, width)
}
