/**
 * Gestion des tokens JWT
 *
 * « Se souvenir de moi » :
 *   • coché  → localStorage   (la session survit à la fermeture du navigateur)
 *   • décoché → sessionStorage (la session se termine à la fermeture de l'onglet)
 * La lecture interroge les deux stockages, peu importe l'origine.
 */

const ACCESS_TOKEN_KEY = 'soslocal_access_token'
const REFRESH_TOKEN_KEY = 'soslocal_refresh_token'

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setTokens(access: string, refresh: string, remember = true) {
    if (typeof window === 'undefined') return
    const store = remember ? window.localStorage : window.sessionStorage
    const other = remember ? window.sessionStorage : window.localStorage
    // Évite tout doublon entre les deux stockages.
    other.removeItem(ACCESS_TOKEN_KEY)
    other.removeItem(REFRESH_TOKEN_KEY)
    store.setItem(ACCESS_TOKEN_KEY, access)
    store.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clearTokens() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  hasTokens(): boolean {
    return !!this.getAccessToken()
  },
}
