export const API = {
  // Auth
  LOGIN:           '/auth/login',
  REGISTER:        '/auth/register',
  REFRESH:         '/auth/refresh',
  ME:              '/auth/me',
  LOGOUT:          '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD:  '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE_UPDATE:  '/auth/profile',          // PATCH — nom, téléphone, bio, adresse
  ACCOUNT_DELETE:  '/auth/me',               // DELETE — suppression de son propre compte
  VERIFY_EMAIL:    '/auth/verify-email',
  RESEND_CODE:     '/auth/send-verification-code',
  VERIFY_RESET_CODE: '/auth/verify-reset-code',
  PUSH_TOKEN:      '/auth/push-token',

  // Users
  USERS:           '/users',
  USER_BY_ID:      (id: number | string) => `/users/${id}`,
  USER_LOCATION:   '/users/location',       // Mettre à jour géolocalisation (POST)
  USER_AVATAR:     '/users/me/avatar',      // Upload photo de profil (multipart)

  // Media (upload d'images persistées en base)
  MEDIA_UPLOAD:    '/media/upload',         // POST multipart → { id, url }
  REQUEST_IMAGES:  (id: number | string) => `/requests/${id}/upload-images`,

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
  REQUESTS:           '/requests',
  REQUESTS_MY_JOBS:   '/requests/my-jobs',
  REQUEST_BY_ID:      (id: number | string) => `/requests/${id}`,
  REQUEST_ACCEPT:     (id: number | string) => `/requests/${id}/accept`,
  REQUEST_DECLINE:    (id: number | string) => `/requests/${id}/decline`,
  REQUEST_START:      (id: number | string) => `/requests/${id}/start`,
  REQUEST_COMPLETE:   (id: number | string) => `/requests/${id}/complete`,
  REQUEST_CANCEL:     (id: number | string) => `/requests/${id}/cancel`,
  REQUEST_RESCHEDULE: (id: number | string) => `/requests/${id}/reschedule`,
  REQUEST_WORKLOG:    (id: number | string) => `/requests/${id}/work-log`,   // Travaux + pièces
  REQUEST_FOLLOWUP:   (id: number | string) => `/requests/${id}/follow-up`,  // Planifier suivi

  // Chat
  CHAT_ROOMS:        '/chat/rooms',
  CHAT_MESSAGES:     (roomId: number | string) => `/chat/rooms/${roomId}/messages`,
  CHAT_READ:         (roomId: number | string) => `/chat/rooms/${roomId}/read`,
  CHAT_UPLOAD:       '/chat/upload',   // image / vidéo / fichier

  // Payments
  PAYMENTS:                '/payments',
  PAYMENT_BY_ID:           (id: number | string) => `/payments/${id}`,
  PAYMENT_MOBILE_MONEY:    '/payments/mobile-money',
  PAYMENT_CARD:            '/payments/card',
  PAYMENT_CASH:            '/payments/cash',
  PAYMENT_STATUS:          (id: number | string) => `/payments/${id}/status`,
  PAYMENT_BY_REQUEST:      (requestId: number | string) => `/payments/request/${requestId}`,
  PAYMENT_HISTORY:         '/payments',
  PAYMENT_RECEIPT:         (id: number | string) => `/payments/${id}/receipt`,

  // Promo codes
  PROMO_VALIDATE:  '/promo-codes/validate',
  PROMO_CODES:     '/promo-codes',                                  // admin CRUD

  // Disputes (litiges)
  DISPUTES:        '/disputes',
  DISPUTE_BY_ID:   (id: number | string) => `/disputes/${id}`,

  // Payouts & refunds (admin / finance)
  PAYOUTS:         '/payouts',
  PAYOUT_TRIGGER:  (techId: number | string) => `/payouts/${techId}/trigger`,
  REFUNDS:         '/refunds',

  // Reviews
  REVIEWS:           '/reviews',
  REVIEW_BY_ID:      (id: number | string) => `/reviews/${id}`,
  REVIEW_HELPFUL:    (id: number | string) => `/reviews/${id}/helpful`,    // Voter utile / pas utile
  REVIEW_RESPOND:    (id: number | string) => `/reviews/${id}/response`,   // Réponse du technicien
  REVIEW_REPORT:     (id: number | string) => `/reviews/${id}/report`,     // Signaler abus
  TECHNICIAN_REVIEWS:(techId: number | string) => `/reviews/technician/${techId}`,

  // Notifications
  NOTIFICATIONS:          '/notifications',
  NOTIFICATION_READ:      (id: number | string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
  NOTIFICATION_PREFS:     '/notifications/preferences',

  // Operator (supervision)
  OPERATOR_STATS:      '/operator/stats',
  OPERATOR_CHART:      '/operator/chart',
  OPERATOR_ACTIVITY:   '/operator/activity',
  OPERATOR_ALERTS:     '/operator/alerts',
  OPERATOR_STATISTICS: '/operator/statistics',

  // Admin console
  ADMIN_USERS:        '/admin/users',
  ADMIN_USER_BY_ID:   (id: number | string) => `/admin/users/${id}`,
  ADMIN_USER_BAN:     (id: number | string) => `/admin/users/${id}/ban`,
  ADMIN_USER_STATUS:  (id: number | string) => `/admin/users/${id}/status`,
  ADMIN_USER_ROLE:    (id: number | string) => `/admin/users/${id}/role`,
  ADMIN_USER_VERIFY:  (id: number | string) => `/admin/users/${id}/verify`,
  ADMIN_PHONE_CHECK:  '/admin/users/check-phone',
  ADMIN_REPORTS:      '/admin/reports',
  ADMIN_REPORT_ACTION:(id: number | string) => `/admin/reports/${id}/action`,
  ADMIN_SERVICES:     '/admin/services',
  ADMIN_SERVICE_BY_ID:(id: number | string) => `/admin/services/${id}`,
  ADMIN_FAQ:          '/admin/faq',
  ADMIN_BROADCAST:    '/admin/broadcast',
  ADMIN_ACTIVITY_LOGS:'/admin/activity-logs',
  ADMIN_COMMISSION:   '/admin/commission-rate',

  // Back-office avancé — Finance & Promo
  ADMIN_PAYOUTS:          '/admin/payouts',
  ADMIN_PAYOUTS_PENDING:  '/admin/payouts/pending',
  ADMIN_PAYOUT_TRIGGER:   (techId: number | string) => `/admin/payouts/${techId}/trigger`,
  ADMIN_REFUNDS:          '/admin/refunds',

  // Back-office avancé — Modération
  ADMIN_REVIEWS:          '/admin/reviews',
  ADMIN_REVIEW_MODERATE:  (id: number | string) => `/admin/reviews/${id}/moderate`,
  ADMIN_CHAT_MESSAGES:    '/admin/chat-messages',
  ADMIN_CHAT_MODERATE:    (id: number | string) => `/admin/chat-messages/${id}/moderate`,

  // Back-office avancé — Contenu & Support
  ADMIN_FAQ_BY_ID:        (id: number | string) => `/admin/faq/${id}`,
  ADMIN_FAQ_CATEGORIES:   '/admin/faq/categories',
  ADMIN_FAQ_CATEGORY_BY_ID: (id: number | string) => `/admin/faq/categories/${id}`,
  ADMIN_SUBSCRIPTIONS:    '/admin/subscriptions',
  ADMIN_SUBSCRIPTION_BY_ID: (id: number | string) => `/admin/subscriptions/${id}`,
} as const
