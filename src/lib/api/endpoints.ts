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
  USER_BY_ID:      (id: number | string) => `/users/${id}`,

  // Technicians
  TECHNICIANS:        '/technicians',
  TECHNICIANS_NEARBY: '/technicians/nearby',
  TECHNICIAN_BY_ID:   (id: string | number) => `/technicians/${id}`,

  // Admin — technicians
  ADMIN_TECHNICIANS_ALL:    '/technicians/admin/all',
  ADMIN_TECHNICIAN_VERIFY:  (userId: string | number) => `/technicians/admin/${userId}/verify`,

  // Artisan (vue métier pour le technicien connecté)
  ARTISAN_ME:                '/technicians/me',
  ARTISAN_STATS:             '/technicians/me/stats',
  ARTISAN_AVAILABILITY:      '/technicians/availability',
  ARTISAN_MISSIONS:          '/requests/available-for-technician',
  ARTISAN_EARNINGS:          '/technicians/me/earnings',
  ARTISAN_PAYOUTS:           '/technicians/me/payouts',
  TECHNICIAN_PROFILE_CREATE: '/technicians/profile',

  // Services
  SERVICES: '/services',
  SERVICE_TECHNICIANS: (serviceId: number | string) => `/services/${serviceId}/technicians`,

  // Requests
  REQUESTS:          '/requests',
  REQUESTS_MY_JOBS:  '/requests/my-jobs',
  REQUEST_BY_ID:     (id: number | string) => `/requests/${id}`,
  REQUEST_ACCEPT:    (id: number | string) => `/requests/${id}/accept`,
  REQUEST_DECLINE:   (id: number | string) => `/requests/${id}/decline`,
  REQUEST_START:     (id: number | string) => `/requests/${id}/start`,
  REQUEST_COMPLETE:  (id: number | string) => `/requests/${id}/complete`,
  REQUEST_CANCEL:    (id: number | string) => `/requests/${id}/cancel`,

  // Chat
  CHAT_ROOMS:    '/chat/rooms',
  CHAT_MESSAGES: (roomId: number | string) => `/chat/rooms/${roomId}/messages`,

  // Payments
  PAYMENTS:      '/payments',
  PAYMENT_BY_ID: (id: number | string) => `/payments/${id}`,

  // Reviews
  REVIEWS:      '/reviews',
  REVIEW_BY_ID: (id: number | string) => `/reviews/${id}`,

  // Notifications
  NOTIFICATIONS:          '/notifications',
  NOTIFICATION_READ:      (id: number | string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Operator (supervision)
  OPERATOR_STATS:    '/operator/stats',
  OPERATOR_CHART:    '/operator/chart',
  OPERATOR_ACTIVITY: '/operator/activity',
  OPERATOR_ALERTS:   '/operator/alerts',
} as const
