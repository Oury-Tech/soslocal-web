import type { ServiceRequest, Technician, Service, Review } from '@/types'

// ─── Chat mock types ──────────────────────────────────────────────────────────

export interface MockChatParticipant {
  id: number
  name: string
  avatar: string
  profession?: string
  is_online: boolean
}

export interface MockChatMessage {
  id: string
  room_id: string
  sender_id: number
  content: string
  read: boolean
  created_at: string
}

export interface MockChatRoom {
  id: string
  request_id: string
  request_title: string
  other_participant: MockChatParticipant
  last_message?: MockChatMessage
  unread_count: number
  created_at: string
}

export const SERVICES: Service[] = [
  { id: 1, name: 'Plomberie',      slug: 'plomberie',      category: 'BTP',         icon: '🔧', color: '#3B82F6', estimated_price_min: 50000,  estimated_price_max: 500000,  average_duration: 90,  is_emergency: true,  is_active: true },
  { id: 2, name: 'Électricité',    slug: 'electricite',    category: 'BTP',         icon: '⚡', color: '#F59E0B', estimated_price_min: 75000,  estimated_price_max: 800000,  average_duration: 120, is_emergency: true,  is_active: true },
  { id: 3, name: 'Mécanique auto', slug: 'mecanique',      category: 'Automobile',  icon: '🚗', color: '#EF4444', estimated_price_min: 100000, estimated_price_max: 2000000, average_duration: 180, is_emergency: false, is_active: true },
  { id: 4, name: 'Menuiserie',     slug: 'menuiserie',     category: 'BTP',         icon: '🪚', color: '#92400E', estimated_price_min: 80000,  estimated_price_max: 1500000, average_duration: 240, is_emergency: false, is_active: true },
  { id: 5, name: 'Maçonnerie',     slug: 'maconnerie',     category: 'BTP',         icon: '🧱', color: '#64748B', estimated_price_min: 100000, estimated_price_max: 3000000, average_duration: 300, is_emergency: false, is_active: true },
  { id: 6, name: 'Climatisation',  slug: 'climatisation',  category: 'Confort',     icon: '❄️', color: '#06B6D4', estimated_price_min: 100000, estimated_price_max: 1500000, average_duration: 150, is_emergency: false, is_active: true },
  { id: 7, name: 'Électroménager', slug: 'electromenager', category: 'Réparation',  icon: '🔌', color: '#10B981', estimated_price_min: 50000,  estimated_price_max: 800000,  average_duration: 90,  is_emergency: false, is_active: true },
  { id: 8, name: 'Soudure',        slug: 'soudure',        category: 'BTP',         icon: '🔥', color: '#DC2626', estimated_price_min: 75000,  estimated_price_max: 1000000, average_duration: 120, is_emergency: false, is_active: true },
  { id: 9, name: 'Informatique',   slug: 'informatique',   category: 'Technologie', icon: '💻', color: '#6366F1', estimated_price_min: 50000,  estimated_price_max: 500000,  average_duration: 90,  is_emergency: false, is_active: true },
]

export const TECHNICIANS: Technician[] = [
  {
    id: 101, email: 'mohamed.keita@allomaitre.gn', phone: '+224 627 11 22 33', name: 'Mohamed Keita',
    role: 'technician', avatar_url: undefined, latitude: 9.5413, longitude: -13.6754,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-01-15T00:00:00Z',
    profession: 'Plombier certifié', bio: '15 ans d\'expérience dans le dépannage urbain. Spécialiste fuites et installations sanitaires.',
    rating: 4.9, total_reviews: 142, total_jobs_completed: 178, completion_rate: 98.5,
    is_available: true, is_verified: true, max_distance_km: 15, hourly_rate: 50000,
    services: [SERVICES[0]],
  },
  {
    id: 102, email: 'fatoumata.bah@allomaitre.gn', phone: '+224 622 44 55 66', name: 'Fatoumata Bah',
    role: 'technician', latitude: 9.5325, longitude: -13.6820,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-02-10T00:00:00Z',
    profession: 'Électricienne certifiée', bio: 'Première femme électricienne certifiée de la plateforme SOSLocal. Installations résidentielles et commerciales.',
    rating: 4.8, total_reviews: 89, total_jobs_completed: 96, completion_rate: 95,
    is_available: true, is_verified: true, max_distance_km: 20, hourly_rate: 60000,
    services: [SERVICES[1]],
  },
  {
    id: 103, email: 'ibrahima.camara@allomaitre.gn', phone: '+224 628 77 88 99', name: 'Ibrahima Camara',
    role: 'technician', latitude: 9.5512, longitude: -13.6691,
    is_active: true, is_online: false, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-01-20T00:00:00Z',
    profession: 'Mécanicien automobile', bio: 'Spécialiste véhicules toutes marques, dépannage et entretien.',
    rating: 4.7, total_reviews: 64, total_jobs_completed: 72, completion_rate: 92,
    is_available: false, is_verified: true, max_distance_km: 10, hourly_rate: 75000,
    services: [SERVICES[2]],
  },
  {
    id: 104, email: 'sekou.sylla@allomaitre.gn', phone: '+224 621 33 44 55', name: 'Sékou Sylla',
    role: 'technician', latitude: 9.5250, longitude: -13.6920,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-03-05T00:00:00Z',
    profession: 'Menuisier ébéniste', bio: 'Menuisier de précision, mobilier sur mesure et réparations.',
    rating: 4.9, total_reviews: 51, total_jobs_completed: 58, completion_rate: 97,
    is_available: true, is_verified: true, max_distance_km: 25, hourly_rate: 55000,
    services: [SERVICES[3]],
  },
  {
    id: 105, email: 'aissatou.diallo@allomaitre.gn', phone: '+224 625 66 77 88', name: 'Aïssatou Diallo',
    role: 'technician', latitude: 9.5480, longitude: -13.6720,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-02-20T00:00:00Z',
    profession: 'Technicienne climatisation', bio: 'Installation et maintenance de climatiseurs split et centraux.',
    rating: 4.6, total_reviews: 38, total_jobs_completed: 44, completion_rate: 94,
    is_available: true, is_verified: true, max_distance_km: 18, hourly_rate: 65000,
    services: [SERVICES[5]],
  },
  {
    id: 106, email: 'mariama.toure@allomaitre.gn', phone: '+224 624 99 00 11', name: 'Mariama Touré',
    role: 'technician', latitude: 9.5390, longitude: -13.6800,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-03-12T00:00:00Z',
    profession: 'Technicienne électroménager', bio: 'Réparation frigos, machines à laver, micro-ondes toutes marques.',
    rating: 4.8, total_reviews: 47, total_jobs_completed: 53, completion_rate: 96,
    is_available: true, is_verified: true, max_distance_km: 15, hourly_rate: 50000,
    services: [SERVICES[6]],
  },

  // ── 10 nouveaux artisans disponibles ──────────────────────────────────────
  {
    id: 107, email: 'mamadou.bah@allomaitre.gn', phone: '+224 628 10 20 30', name: 'Mamadou Bah',
    role: 'technician', latitude: 9.5560, longitude: -13.6620,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-01T00:00:00Z',
    profession: 'Technicien informatique', bio: 'Réparation PC, installation logiciels, récupération de données et dépannage réseau.',
    rating: 4.9, total_reviews: 73, total_jobs_completed: 85, completion_rate: 97,
    is_available: true, is_verified: true, max_distance_km: 20, hourly_rate: 60000,
    services: [SERVICES[8]],
  },
  {
    id: 108, email: 'kadiatou.camara@allomaitre.gn', phone: '+224 622 30 40 50', name: 'Kadiatou Camara',
    role: 'technician', latitude: 9.5620, longitude: -13.6580,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-05T00:00:00Z',
    profession: 'Support informatique & réseaux', bio: 'Installation Wifi, configuration routeurs, maintenance parc informatique entreprises.',
    rating: 4.8, total_reviews: 58, total_jobs_completed: 63, completion_rate: 96,
    is_available: true, is_verified: true, max_distance_km: 15, hourly_rate: 55000,
    services: [SERVICES[8]],
  },
  {
    id: 109, email: 'oumar.diallo@allomaitre.gn', phone: '+224 625 50 60 70', name: 'Oumar Diallo',
    role: 'technician', latitude: 9.5490, longitude: -13.6650,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-10T00:00:00Z',
    profession: 'Informaticien / Dépannage PC', bio: 'Spécialiste virus, lenteur, écrans cassés et récupération de données. Intervention rapide.',
    rating: 4.7, total_reviews: 42, total_jobs_completed: 49, completion_rate: 94,
    is_available: true, is_verified: false, max_distance_km: 12, hourly_rate: 45000,
    services: [SERVICES[8]],
  },
  {
    id: 110, email: 'aminata.kouyate@allomaitre.gn', phone: '+224 627 60 70 80', name: 'Aminata Kouyaté',
    role: 'technician', latitude: 9.5300, longitude: -13.6950,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-12T00:00:00Z',
    profession: 'Plombière', bio: 'Dépannage fuites, installations sanitaires et chauffe-eau. 8 ans d\'expérience.',
    rating: 4.8, total_reviews: 61, total_jobs_completed: 69, completion_rate: 95,
    is_available: true, is_verified: true, max_distance_km: 18, hourly_rate: 50000,
    services: [SERVICES[0]],
  },
  {
    id: 111, email: 'lansana.doumbouya@allomaitre.gn', phone: '+224 621 70 80 90', name: 'Lansana Doumbouya',
    role: 'technician', latitude: 9.5440, longitude: -13.6700,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-15T00:00:00Z',
    profession: 'Électricien général', bio: 'Installations électriques résidentielles et commerciales, tableaux électriques, prises.',
    rating: 4.6, total_reviews: 35, total_jobs_completed: 40, completion_rate: 93,
    is_available: true, is_verified: true, max_distance_km: 22, hourly_rate: 65000,
    services: [SERVICES[1]],
  },
  {
    id: 112, email: 'hawa.barry@allomaitre.gn', phone: '+224 624 80 90 00', name: 'Hawa Barry',
    role: 'technician', latitude: 9.5370, longitude: -13.6860,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-18T00:00:00Z',
    profession: 'Menuisière ébéniste', bio: 'Fabrication et réparation de meubles, portes, fenêtres et parquet.',
    rating: 4.9, total_reviews: 29, total_jobs_completed: 33, completion_rate: 98,
    is_available: true, is_verified: true, max_distance_km: 14, hourly_rate: 55000,
    services: [SERVICES[3]],
  },
  {
    id: 113, email: 'aboubacar.soumah@allomaitre.gn', phone: '+224 628 90 01 11', name: 'Aboubacar Soumah',
    role: 'technician', latitude: 9.5280, longitude: -13.6910,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-20T00:00:00Z',
    profession: 'Soudeur professionnel', bio: 'Soudure MIG/TIG, ferronnerie, portails et structures métalliques sur mesure.',
    rating: 4.7, total_reviews: 44, total_jobs_completed: 51, completion_rate: 95,
    is_available: true, is_verified: true, max_distance_km: 20, hourly_rate: 70000,
    services: [SERVICES[7]],
  },
  {
    id: 114, email: 'mariam.konate@allomaitre.gn', phone: '+224 622 01 12 23', name: 'Mariam Konaté',
    role: 'technician', latitude: 9.5550, longitude: -13.6730,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-22T00:00:00Z',
    profession: 'Réparation électroménager', bio: 'Machines à laver, réfrigérateurs, cuisinières et petits appareils toutes marques.',
    rating: 4.8, total_reviews: 52, total_jobs_completed: 58, completion_rate: 96,
    is_available: true, is_verified: false, max_distance_km: 16, hourly_rate: 50000,
    services: [SERVICES[6]],
  },
  {
    id: 115, email: 'thierno.balde@allomaitre.gn', phone: '+224 625 12 23 34', name: 'Thierno Baldé',
    role: 'technician', latitude: 9.5600, longitude: -13.6680,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-25T00:00:00Z',
    profession: 'Mécanicien automobile', bio: 'Entretien et réparation toutes marques, diagnostic électronique, dépannage sur place.',
    rating: 4.6, total_reviews: 38, total_jobs_completed: 44, completion_rate: 92,
    is_available: true, is_verified: true, max_distance_km: 25, hourly_rate: 80000,
    services: [SERVICES[2]],
  },
  {
    id: 116, email: 'oumou.sow@allomaitre.gn', phone: '+224 627 23 34 45', name: 'Oumou Sow',
    role: 'technician', latitude: 9.5420, longitude: -13.6740,
    is_active: true, is_online: true, is_email_verified: true, is_phone_verified: true,
    created_at: '2026-04-28T00:00:00Z',
    profession: 'Technicienne climatisation', bio: 'Installation, entretien et recharge climatiseurs split et cassette. Certifiée Daikin.',
    rating: 4.9, total_reviews: 66, total_jobs_completed: 71, completion_rate: 99,
    is_available: true, is_verified: true, max_distance_km: 18, hourly_rate: 65000,
    services: [SERVICES[5]],
  },
]

export const REQUESTS: ServiceRequest[] = [
  {
    id: 1001, reference_number: 'SOS-2026-001', client_id: 1, technician_id: 101, service_id: 1,
    status: 'completed', priority: 'high',
    title: 'Fuite d\'eau salle de bain',
    description: 'Importante fuite sous le lavabo, eau qui coule en continu.',
    latitude: 9.5370, longitude: -13.6785, address: 'Quartier Dixinn, Conakry',
    estimated_price: 150000, final_price: 175000, photos: [],
    technician: TECHNICIANS[0], service: SERVICES[0],
    accepted_at: '2026-05-08T10:15:00Z',
    completed_at: '2026-05-08T12:30:00Z',
    created_at: '2026-05-08T10:00:00Z',
  },
  {
    id: 1002, reference_number: 'SOS-2026-002', client_id: 1, technician_id: 102, service_id: 2,
    status: 'in_progress', priority: 'normal',
    title: 'Court-circuit prise cuisine',
    description: 'Une prise dans la cuisine fait sauter le disjoncteur.',
    latitude: 9.5400, longitude: -13.6750, address: 'Cité des Nations, Kaloum',
    estimated_price: 120000, photos: [],
    technician: TECHNICIANS[1], service: SERVICES[1],
    accepted_at: '2026-05-10T14:00:00Z',
    started_at: '2026-05-10T14:25:00Z',
    created_at: '2026-05-10T13:50:00Z',
  },
  {
    id: 1003, reference_number: 'SOS-2026-003', client_id: 1, service_id: 6,
    status: 'pending', priority: 'normal',
    title: 'Climatiseur ne refroidit plus',
    description: 'Le climatiseur de la chambre tourne mais ne refroidit pas.',
    latitude: 9.5350, longitude: -13.6800, address: 'Matam, Conakry',
    estimated_price: 200000, photos: [],
    service: SERVICES[5],
    created_at: '2026-05-10T15:30:00Z',
  },
]

export const REVIEWS: Review[] = [
  {
    id: 1, request_id: 1001, reviewer_id: 1, technician_id: 101,
    rating: 5, quality_rating: 5, professionalism_rating: 5, punctuality_rating: 4,
    communication_rating: 5, value_rating: 4,
    comment: 'Excellent travail, très professionnel et ponctuel. Je recommande vivement !',
    would_recommend: true,
    created_at: '2026-05-08T13:00:00Z',
  },
]

// ─── Artisan mock data ────────────────────────────────────────────────────────

export interface ArtisanStats {
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
  rating: number
  totalReviews: number
  completionRate: number
  pendingMissions: number
  completedToday: number
  isAvailable: boolean
}

export interface EarningDay {
  day: string
  revenus: number
  missions: number
}

export interface EarningMonth {
  month: string
  revenus: number
}

export interface Payout {
  id: number
  date: string
  amount: number
  mission: string
  client: string
  method: string
  status: 'paid' | 'pending'
}

export interface PendingMission {
  id: number
  ref: string
  title: string
  client: { name: string; avatar: string }
  address: string
  distance: number
  priority: 'low' | 'normal' | 'high' | 'emergency'
  price: number
  time: string
  service_icon: string
}

export const ARTISAN_STATS: ArtisanStats = {
  todayEarnings: 425000,
  weekEarnings: 2150000,
  monthEarnings: 8750000,
  rating: 4.9,
  totalReviews: 142,
  completionRate: 98.5,
  pendingMissions: 2,
  completedToday: 3,
  isAvailable: true,
}

export const PENDING_MISSIONS: PendingMission[] = [
  {
    id: 2008, ref: 'SOS-2026-008',
    title: 'Court-circuit prise cuisine',
    client: { name: 'Aïssatou Bah', avatar: 'AB' },
    address: 'Quartier Dixinn, Cité des Nations',
    distance: 1.2, priority: 'high', price: 120000,
    time: 'À l\'instant', service_icon: '⚡',
  },
  {
    id: 2009, ref: 'SOS-2026-009',
    title: 'Installation prise extérieure',
    client: { name: 'Mohamed Diallo', avatar: 'MD' },
    address: 'Kaloum, Centre-ville',
    distance: 3.5, priority: 'normal', price: 85000,
    time: 'Il y a 5 min', service_icon: '⚡',
  },
]

export const WEEK_EARNINGS: EarningDay[] = [
  { day: 'Lun', revenus: 320000, missions: 3 },
  { day: 'Mar', revenus: 425000, missions: 4 },
  { day: 'Mer', revenus: 180000, missions: 2 },
  { day: 'Jeu', revenus: 510000, missions: 5 },
  { day: 'Ven', revenus: 380000, missions: 4 },
  { day: 'Sam', revenus: 285000, missions: 3 },
  { day: 'Dim', revenus: 50000,  missions: 1 },
]

export const MONTH_EARNINGS: EarningMonth[] = [
  { month: 'Jan', revenus: 4800000 },
  { month: 'Fév', revenus: 5200000 },
  { month: 'Mar', revenus: 6100000 },
  { month: 'Avr', revenus: 7300000 },
  { month: 'Mai', revenus: 8750000 },
]

export const RECENT_PAYOUTS: Payout[] = [
  { id: 1, date: '2026-05-10', amount: 175000, mission: 'Fuite d\'eau salle de bain',   client: 'Aïssatou Bah',    method: 'Orange Money', status: 'paid' },
  { id: 2, date: '2026-05-09', amount: 120000, mission: 'Court-circuit prise cuisine',  client: 'Mohamed Diallo',  method: 'MTN MoMo',     status: 'paid' },
  { id: 3, date: '2026-05-08', amount: 250000, mission: 'Installation chauffe-eau',     client: 'Mariama Touré',   method: 'Orange Money', status: 'paid' },
  { id: 4, date: '2026-05-07', amount: 95000,  mission: 'Réparation robinet cuisine',   client: 'Ibrahima Camara', method: 'Carte',        status: 'paid' },
  { id: 5, date: '2026-05-06', amount: 180000, mission: 'Débouchage canalisation',      client: 'Fatoumata Sylla', method: 'Orange Money', status: 'paid' },
]

// ─── Operator mock data ───────────────────────────────────────────────────────

export interface OperatorStats {
  activeArtisans: number
  newArtisansThisMonth: number
  activeMissions: number
  monthRevenue: number
  monthRevenueLabel: string
  satisfaction: number
  totalReviews: number
  satisfactionTrend: number
}

export interface OperatorChartPoint {
  day: string
  missions: number
  revenus: number
}

export interface OperatorActivity {
  id: number
  title: string
  sub: string
  time: string
  amount?: number
}

export interface OperatorAlert {
  id: number
  type: 'warning' | 'info' | 'success'
  title: string
  sub: string
  time: string
}

export interface InterventionStatus {
  name: string
  value: number
  color: string
}

export const OPERATOR_STATS: OperatorStats = {
  activeArtisans: 130,
  newArtisansThisMonth: 12,
  activeMissions: 38,
  monthRevenue: 138000000,
  monthRevenueLabel: '138M GNF',
  satisfaction: 4.8,
  totalReviews: 1247,
  satisfactionTrend: 0.2,
}

export const INTERVENTION_STATUS: InterventionStatus[] = [
  { name: 'Complétées', value: 1247, color: '#10B981' },
  { name: 'En cours',   value: 38,   color: '#00A99D' },
  { name: 'En attente', value: 12,   color: '#F59E0B' },
  { name: 'Annulées',   value: 27,   color: '#EF4444' },
]

export const OPERATOR_CHART: OperatorChartPoint[] = [
  { day: 'Lun', missions: 145, revenus: 18500000 },
  { day: 'Mar', missions: 162, revenus: 21300000 },
  { day: 'Mer', missions: 138, revenus: 17800000 },
  { day: 'Jeu', missions: 178, revenus: 23900000 },
  { day: 'Ven', missions: 195, revenus: 26100000 },
  { day: 'Sam', missions: 152, revenus: 19400000 },
  { day: 'Dim', missions: 87,  revenus: 11200000 },
]

export const OPERATOR_ACTIVITY: OperatorActivity[] = [
  { id: 1, title: 'Mission complétée',    sub: 'Mohamed Keita · Fuite réparée',       time: 'À l\'instant', amount: 175000 },
  { id: 2, title: 'Nouvelle évaluation 5★', sub: 'Aïssatou Bah → Mohamed Keita',      time: 'Il y a 5 min' },
  { id: 3, title: 'Paiement reçu',        sub: 'Orange Money · 120 000 GNF',           time: 'Il y a 12 min', amount: 120000 },
  { id: 4, title: 'Mission acceptée',     sub: 'Fatoumata Bah · Électricité',          time: 'Il y a 18 min' },
  { id: 5, title: 'Nouveau client',       sub: 'Inscription validée · Matam',          time: 'Il y a 25 min' },
]

export const OPERATOR_ALERTS: OperatorAlert[] = [
  { id: 1, type: 'warning', title: 'Demande sans réponse depuis 15 min',    sub: 'SOS-2026-014 · Plomberie · Ratoma',    time: 'Il y a 12 min' },
  { id: 2, type: 'info',    title: 'Nouvel artisan en attente de validation', sub: 'Karim Touré · Électricien',           time: 'Il y a 1h' },
  { id: 3, type: 'success', title: 'Centre Kaloum : objectif mensuel atteint', sub: '150 missions complétées',           time: 'Il y a 2h' },
]

// ─── Mock API helper ──────────────────────────────────────────────────────────

export const mockApi = {
  async getServices() {
    await delay(300)
    return SERVICES
  },
  async getNearbyTechnicians(_lat?: number, _lng?: number, serviceId?: number) {
    await delay(400)
    if (serviceId) {
      return TECHNICIANS.filter((t) => t.services?.some((s) => s.id === serviceId))
    }
    return TECHNICIANS
  },
  async getRequests(_userId?: number) {
    await delay(350)
    return REQUESTS
  },
  async getRequest(id: number) {
    await delay(250)
    return REQUESTS.find((r) => r.id === id) || null
  },
  async createRequest(data: Partial<ServiceRequest> & { technician_id?: number }) {
    await delay(600)
    const techId   = (data as any).technician_id as number | undefined
    const tech     = techId ? TECHNICIANS.find((t) => t.id === techId) : undefined
    const svcId    = data.service_id || tech?.services?.[0]?.id || 1
    const service  = SERVICES.find((s) => s.id === svcId)

    const newReq: ServiceRequest = {
      id: Date.now(),
      reference_number: `SOS-2026-${String(Date.now()).slice(-3)}`,
      client_id: 1,
      service_id: svcId,
      technician_id: techId,
      status: techId ? 'matched' : 'pending',
      priority: data.priority || 'normal',
      title: data.title || '',
      description: data.description || '',
      latitude: data.latitude || 9.5370,
      longitude: data.longitude || -13.6785,
      address: data.address,
      estimated_price: data.estimated_price,
      photos: data.photos || [],
      service,
      technician: tech,
      created_at: new Date().toISOString(),
    }
    REQUESTS.unshift(newReq)

    /* Add to artisan's pending missions queue so they can accept/cancel */
    if (tech) {
      PENDING_MISSIONS.unshift({
        id: newReq.id,
        ref: newReq.reference_number ?? `SOS-${newReq.id}`,
        title: newReq.title || newReq.description.slice(0, 60),
        client: { name: 'Client', avatar: 'CL' },
        address: newReq.address || 'Conakry',
        distance: 1.5,
        priority: (newReq.priority as any) === 'emergency' ? 'emergency'
          : (newReq.priority as any) === 'high' ? 'high'
          : 'normal',
        price: newReq.estimated_price || service?.estimated_price_min || 100000,
        time: 'À l\'instant',
        service_icon: service?.icon || '🔧',
      })
      ARTISAN_STATS.pendingMissions = PENDING_MISSIONS.length
    }

    return newReq
  },

  // Artisan
  async getArtisanStats(): Promise<ArtisanStats> {
    await delay(300)
    return { ...ARTISAN_STATS }
  },
  async getArtisanWeekEarnings(): Promise<EarningDay[]> {
    await delay(250)
    return WEEK_EARNINGS
  },
  async getArtisanMonthEarnings(): Promise<EarningMonth[]> {
    await delay(250)
    return MONTH_EARNINGS
  },
  async getArtisanPayouts(): Promise<Payout[]> {
    await delay(300)
    return RECENT_PAYOUTS
  },
  async getPendingMissions(): Promise<PendingMission[]> {
    await delay(300)
    return PENDING_MISSIONS
  },
  async toggleAvailability(available: boolean): Promise<{ is_available: boolean }> {
    await delay(400)
    ARTISAN_STATS.isAvailable = available
    return { is_available: available }
  },

  // Chat
  async getChatRooms(): Promise<MockChatRoom[]> {
    await delay(300)
    return CHAT_ROOMS
  },
  async getChatMessages(roomId: string): Promise<MockChatMessage[]> {
    await delay(200)
    return CHAT_MESSAGES[roomId] ?? []
  },
  async sendChatMessage(roomId: string, senderId: number, content: string): Promise<MockChatMessage> {
    await delay(150)
    const msg: MockChatMessage = {
      id: `m-${Date.now()}`,
      room_id: roomId,
      sender_id: senderId,
      content,
      read: false,
      created_at: new Date().toISOString(),
    }
    if (!CHAT_MESSAGES[roomId]) CHAT_MESSAGES[roomId] = []
    CHAT_MESSAGES[roomId].push(msg)
    const room = CHAT_ROOMS.find((r) => r.id === roomId)
    if (room) room.last_message = msg
    return msg
  },

  // Operator
  async getOperatorStats(): Promise<OperatorStats> {
    await delay(300)
    return { ...OPERATOR_STATS }
  },
  async getOperatorChart(): Promise<OperatorChartPoint[]> {
    await delay(250)
    return OPERATOR_CHART
  },
  async getInterventionStatus(): Promise<InterventionStatus[]> {
    await delay(200)
    return INTERVENTION_STATUS
  },
  async getOperatorActivity(): Promise<OperatorActivity[]> {
    await delay(300)
    return OPERATOR_ACTIVITY
  },
  async getOperatorAlerts(): Promise<OperatorAlert[]> {
    await delay(250)
    return OPERATOR_ALERTS
  },
}

// ─── Chat mock data ───────────────────────────────────────────────────────────

export const CHAT_ROOMS: MockChatRoom[] = [
  {
    id: 'room-1001',
    request_id: '1001',
    request_title: 'Fuite d\'eau salle de bain',
    other_participant: { id: 101, name: 'Mohamed Keita', avatar: 'MK', profession: 'Plombier', is_online: true },
    last_message: { id: 'm-8', room_id: 'room-1001', sender_id: 101, content: 'Je suis sur place, j\'arrive dans 2 min', read: false, created_at: new Date(Date.now() - 60000).toISOString() },
    unread_count: 2,
    created_at: '2026-05-08T10:15:00Z',
  },
  {
    id: 'room-1002',
    request_id: '1002',
    request_title: 'Court-circuit prise cuisine',
    other_participant: { id: 102, name: 'Fatoumata Bah', avatar: 'FB', profession: 'Électricienne', is_online: true },
    last_message: { id: 'm-12', room_id: 'room-1002', sender_id: 1, content: 'Parfait, merci pour la rapidité !', read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
    unread_count: 0,
    created_at: '2026-05-10T14:00:00Z',
  },
  {
    id: 'room-1003',
    request_id: '1003',
    request_title: 'Climatiseur ne refroidit plus',
    other_participant: { id: 103, name: 'Ibrahima Camara', avatar: 'IC', profession: 'Mécanicien', is_online: false },
    last_message: { id: 'm-5', room_id: 'room-1003', sender_id: 103, content: 'Le devis vous convient ?', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    unread_count: 0,
    created_at: '2026-05-09T10:00:00Z',
  },
]

export const CHAT_MESSAGES: Record<string, MockChatMessage[]> = {
  'room-1001': [
    { id: 'm-1', room_id: 'room-1001', sender_id: 101, content: 'Bonjour ! Je vous confirme avoir bien reçu votre demande.', read: true, created_at: '2026-05-08T10:15:00Z' },
    { id: 'm-2', room_id: 'room-1001', sender_id: 101, content: 'Pouvez-vous me décrire un peu plus le problème de fuite ?', read: true, created_at: '2026-05-08T10:15:30Z' },
    { id: 'm-3', room_id: 'room-1001', sender_id: 1, content: 'Il y a une fuite importante sous le lavabo de la salle de bain. L\'eau coule en continu.', read: true, created_at: '2026-05-08T10:17:00Z' },
    { id: 'm-4', room_id: 'room-1001', sender_id: 101, content: 'D\'accord, je vois. Avez-vous coupé l\'arrivée d\'eau ?', read: true, created_at: '2026-05-08T10:18:00Z' },
    { id: 'm-5', room_id: 'room-1001', sender_id: 1, content: 'Oui, c\'est fait. J\'attends maintenant.', read: true, created_at: '2026-05-08T10:19:00Z' },
    { id: 'm-6', room_id: 'room-1001', sender_id: 101, content: 'Parfait. Je suis sur la route, j\'arrive dans 8 minutes 👍', read: true, created_at: '2026-05-08T10:20:00Z' },
    { id: 'm-7', room_id: 'room-1001', sender_id: 1, content: 'Merci beaucoup pour la rapidité !', read: true, created_at: '2026-05-08T10:21:00Z' },
    { id: 'm-8', room_id: 'room-1001', sender_id: 101, content: 'Je suis sur place, j\'arrive dans 2 min', read: false, created_at: new Date(Date.now() - 60000).toISOString() },
  ],
  'room-1002': [
    { id: 'm-10', room_id: 'room-1002', sender_id: 102, content: 'Bonjour, j\'ai bien reçu votre demande pour le court-circuit.', read: true, created_at: '2026-05-10T14:00:00Z' },
    { id: 'm-11', room_id: 'room-1002', sender_id: 1, content: 'Bonjour ! Oui, la prise de la cuisine fait sauter le disjoncteur depuis ce matin.', read: true, created_at: '2026-05-10T14:02:00Z' },
    { id: 'm-12', room_id: 'room-1002', sender_id: 1, content: 'Parfait, merci pour la rapidité !', read: true, created_at: '2026-05-10T14:30:00Z' },
  ],
  'room-1003': [
    { id: 'm-20', room_id: 'room-1003', sender_id: 103, content: 'Bonjour, j\'ai jeté un œil à votre problème de climatisation.', read: true, created_at: '2026-05-09T10:00:00Z' },
    { id: 'm-21', room_id: 'room-1003', sender_id: 103, content: 'Il me faudra recharger le gaz réfrigérant. Estimation : 250 000 GNF.', read: true, created_at: '2026-05-09T10:05:00Z' },
    { id: 'm-22', room_id: 'room-1003', sender_id: 103, content: 'Le devis vous convient ?', read: true, created_at: '2026-05-09T10:06:00Z' },
  ],
}

// ─── Mock API helper ──────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
