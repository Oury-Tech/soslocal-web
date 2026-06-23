import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '../auth/token'
import { resolveApiUrl } from './base-url'

const API_URL = resolveApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
})

/** Request interceptor : injection JWT */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/** Response interceptor : auto-refresh sur 401 */
let isRefreshing = false
let pendingRequests: Array<() => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push(() => resolve(apiClient(originalRequest)))
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = tokenStorage.getRefreshToken()
        // Aucune session → un 401 est NORMAL (page publique appelant un endpoint
        // protégé). On rejette sans rediriger : sinon la landing publique éjecte
        // le visiteur vers /login. Le composant appelant gère l'absence de data.
        if (!refreshToken) {
          isRefreshing = false
          return Promise.reject(error)
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        tokenStorage.setTokens(data.access_token, data.refresh_token)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        }

        pendingRequests.forEach((cb) => cb())
        pendingRequests = []

        return apiClient(originalRequest)
      } catch (refreshError) {
        tokenStorage.clearTokens()
        // Session expirée → retour au login, SAUF sur les pages publiques
        // (landing, login, register…) pour ne pas casser la navigation publique.
        if (typeof window !== 'undefined') {
          const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/verify-email']
          if (!PUBLIC.includes(window.location.pathname)) {
            window.location.href = '/login'
          }
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
