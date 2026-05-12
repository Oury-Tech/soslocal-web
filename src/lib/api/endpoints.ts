export const API = {
  // Auth
  LOGIN:           '/auth/login',
  REGISTER:        '/auth/register',
  REFRESH:         '/auth/refresh',
  ME:              '/auth/me',
  LOGOUT:          '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD:  '/auth/reset-password',
  VERIFY_EMAIL:    '/auth/verify-email',

  // Users
  USERS:           '/users',

  // Technicians
  TECHNICIANS:     '/technicians',
  TECHNICIANS_NEARBY: '/technicians/nearby',

  // Services
  SERVICES:        '/services',

  // Requests
  REQUESTS:        '/requests',
  REQUEST_BY_ID:   (id: number | string) => `/requests/${id}`,
  REQUEST_ACCEPT:  (id: number | string) => `/requests/${id}/accept`,
  REQUEST_START:   (id: number | string) => `/requests/${id}/start`,
  REQUEST_COMPLETE:(id: number | string) => `/requests/${id}/complete`,
  REQUEST_CANCEL:  (id: number | string) => `/requests/${id}/cancel`,

  // Chat
  CHAT_ROOMS:      '/chat/rooms',
  CHAT_MESSAGES:   (roomId: number | string) => `/chat/rooms/${roomId}/messages`,

  // Payments
  PAYMENTS:        '/payments',

  // Reviews
  REVIEWS:         '/reviews',

  // Notifications
  NOTIFICATIONS:   '/notifications',
} as const
