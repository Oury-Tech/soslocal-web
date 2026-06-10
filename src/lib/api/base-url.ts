/**
 * Résolution centralisée de l'URL du backend.
 *
 * Contexte : une ancienne variable `NEXT_PUBLIC_API_URL` pointant vers Render
 * (`soslocal-backend.onrender.com`) peut subsister dans le tableau de bord
 * Vercel et écraser le `.env.production` au build. Ce backend est obsolète et
 * renvoie « Not Found » sur les routes récentes (admin, médias…).
 *
 * Garde-fou : on ignore toute URL pointant vers Render et on route toujours
 * vers le backend FastAPI Cloud, source de vérité unique.
 */

const CANONICAL_API = 'https://soslocal-backend.fastapicloud.dev/api/v1'
const CANONICAL_WS = 'wss://soslocal-backend.fastapicloud.dev/ws'

/** Hôtes obsolètes à ne jamais utiliser, même s'ils sont configurés ailleurs. */
const STALE_HOSTS = ['onrender.com']

function isStale(url: string | undefined | null): boolean {
  if (!url) return true
  return STALE_HOSTS.some((h) => url.includes(h))
}

/** URL de base de l'API REST (`…/api/v1`). */
export function resolveApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL
  return isStale(raw) ? CANONICAL_API : (raw as string)
}

/** URL du WebSocket (`wss://…/ws`). */
export function resolveWsUrl(): string {
  const raw = process.env.NEXT_PUBLIC_WS_URL
  if (!isStale(raw)) return raw as string
  // Dérive du REST si une URL API valide est fournie, sinon valeur canonique.
  const api = process.env.NEXT_PUBLIC_API_URL
  if (api && !isStale(api)) {
    return api.replace(/^http/, 'ws').replace(/\/api\/v1$/, '') + '/ws'
  }
  return CANONICAL_WS
}
