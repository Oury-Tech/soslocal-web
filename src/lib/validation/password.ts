import { z } from 'zod'

/**
 * Règles de mot de passe — cohérentes avec le diagramme « Valider règles
 * mot de passe (8+ car, 1 maj, 1 min, 1 chiffre) ».
 * Réutilisé par l'inscription, la réinitialisation et le changement de MDP.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')

export interface PasswordRule {
  label: string
  test: (v: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: '8 caractères minimum', test: (v) => v.length >= 8 },
  { label: 'Une majuscule', test: (v) => /[A-Z]/.test(v) },
  { label: 'Une minuscule', test: (v) => /[a-z]/.test(v) },
  { label: 'Un chiffre', test: (v) => /[0-9]/.test(v) },
]

/** Nombre de règles satisfaites (0-4) — pour un indicateur de robustesse. */
export function passwordStrength(value: string): number {
  return PASSWORD_RULES.reduce((n, r) => n + (r.test(value) ? 1 : 0), 0)
}
