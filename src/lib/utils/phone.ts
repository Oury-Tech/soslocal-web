/**
 * Normalisation et validation des numéros de téléphone (Guinée, +224).
 *
 * Objectif : garantir qu'un même numéro saisi sous différentes formes
 * (« 627 30 60 60 », « +224627306060 », « 00224 627-30-60-60 ») produise
 * UNE SEULE forme canonique, indispensable pour faire respecter la règle
 * « 1 téléphone = 1 utilisateur ». L'unicité réelle doit être garantie par
 * une contrainte UNIQUE en base côté backend ; cette normalisation permet
 * de comparer et de détecter les doublons de façon fiable côté client.
 */

const GUINEA_CC = '224'

/** Garde uniquement les chiffres. */
function digitsOnly(input: string): string {
  return (input ?? '').replace(/\D/g, '')
}

/**
 * Forme canonique : `+224XXXXXXXXX` (9 chiffres nationaux).
 * Retourne la meilleure normalisation possible même si le format est imparfait.
 */
export function normalizePhone(input: string | undefined | null): string {
  let d = digitsOnly(input ?? '')
  if (!d) return ''
  // 00 224 ... → 224 ...
  if (d.startsWith('00' + GUINEA_CC)) d = d.slice(2)
  // Déjà préfixé par l'indicatif pays
  if (d.startsWith(GUINEA_CC)) d = d.slice(GUINEA_CC.length)
  // Certains saisissent un 0 national en tête
  if (d.length === 10 && d.startsWith('0')) d = d.slice(1)
  return `+${GUINEA_CC}${d}`
}

/** Numéro mobile guinéen valide : 9 chiffres nationaux commençant par 6. */
export function isValidGuineaPhone(input: string | undefined | null): boolean {
  const national = normalizePhone(input).replace(`+${GUINEA_CC}`, '')
  return /^6\d{8}$/.test(national)
}

/** Deux numéros désignent-ils la même ligne (après normalisation) ? */
export function isSamePhone(a: string | undefined | null, b: string | undefined | null): boolean {
  const na = normalizePhone(a)
  const nb = normalizePhone(b)
  return !!na && na === nb
}

/** Affichage lisible : `+224 6XX XX XX XX`. */
export function formatPhoneDisplay(input: string | undefined | null): string {
  const national = normalizePhone(input).replace(`+${GUINEA_CC}`, '')
  if (national.length !== 9) return input ?? '—'
  return `+${GUINEA_CC} ${national.slice(0, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7)}`
}

/**
 * Détecte les numéros utilisés par plusieurs comptes dans une liste donnée.
 * Retourne un Set des numéros canoniques en doublon.
 */
export function findDuplicatePhones(
  users: { phone?: string | null }[],
): Set<string> {
  const counts = new Map<string, number>()
  for (const u of users) {
    const n = normalizePhone(u.phone)
    if (!n) continue
    counts.set(n, (counts.get(n) ?? 0) + 1)
  }
  return new Set([...counts.entries()].filter(([, c]) => c > 1).map(([n]) => n))
}
