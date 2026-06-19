/**
 * Photo de portrait déterministe par technicien.
 *
 * Objectif : éviter l'effet « image dupliquée » quand un technicien n'a pas
 * encore uploadé sa propre photo. Chaque technicien obtient TOUJOURS le même
 * portrait distinct (dérivé d'une graine stable : id / email / nom), parmi un
 * jeu de vraies photos de portrait libres de droits (Unsplash).
 *
 * La photo réelle (`avatar_url`) reste prioritaire : ce helper n'est utilisé
 * qu'en repli. Si l'image distante ne charge pas, l'`Avatar` retombe sur les
 * initiales.
 */

// Jeu de portraits Unsplash (libres de droits, hotlink autorisé).
// Hommes & femmes mélangés pour varier les visages d'un technicien à l'autre.
const PORTRAIT_IDS: string[] = [
  '1507003211169-0a1dd7228f2d', // homme
  '1494790108377-be9c29b29330', // femme
  '1500648767791-00dcc994a43e', // homme
  '1438761681033-6461ffad8d80', // femme
  '1472099645785-5658abf4ff4e', // homme
  '1544005313-94ddf0286df2',   // femme
  '1506794778202-cad84cf45f1d', // homme
  '1534528741775-53994a69daeb', // femme
  '1519085360753-af0119f7cbe7', // homme
  '1573497019940-1c28c88b4f3e', // femme
  '1492562080023-ab3db95bfbce', // homme
  '1487412720507-e7ab37603c6f', // femme
  '1599566150163-29194dcaad36', // homme
  '1551836022-d5d88e9218df',   // femme
  '1545167622-3a6ac756afa4',   // homme
  '1607746882042-944635dfe10e', // femme
]

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
  width = 240,
): string {
  const key = String(seed ?? 'soslocal')
  const id = PORTRAIT_IDS[hashSeed(key) % PORTRAIT_IDS.length]
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${width}&q=70&auto=format&fit=crop&crop=faces`
}

/**
 * Résout la source d'image d'un technicien : sa vraie photo si elle existe,
 * sinon un portrait distinct déterministe.
 */
export function resolveTechnicianAvatar(
  tech: { avatar_url?: string | null; id?: string | number; user_id?: string | number; email?: string; name?: string },
  width = 240,
): string {
  if (tech.avatar_url) return tech.avatar_url
  const seed = tech.id ?? tech.user_id ?? tech.email ?? tech.name
  return getTechnicianPhoto(seed, width)
}
