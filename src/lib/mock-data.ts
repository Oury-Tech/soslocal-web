/**
 * Données fictives pour le mode démo (sans backend)
 * Permet de tester l'app web sans avoir le FastAPI lancé
 */

import type { ServiceRequest, Technician, Service, Review } from '@/types'

export const SERVICES: Service[] = [
  { id: 1, name: 'Plomberie',      slug: 'plomberie',      category: 'BTP',         icon: '🔧', color: '#3B82F6', estimated_price_min: 50000,  estimated_price_max: 500000, average_duration: 90,  is_emergency: true,  is_active: true },
  { id: 2, name: 'Électricité',    slug: 'electricite',    category: 'BTP',         icon: '⚡', color: '#F59E0B', estimated_price_min: 75000,  estimated_price_max: 800000, average_duration: 120, is_emergency: true,  is_active: true },
  { id: 3, name: 'Mécanique auto', slug: 'mecanique',      category: 'Automobile',  icon: '🚗', color: '#EF4444', estimated_price_min: 100000, estimated_price_max: 2000000, average_duration: 180, is_emergency: false, is_active: true },
  { id: 4, name: 'Menuiserie',     slug: 'menuiserie',     category: 'BTP',         icon: '🪚', color: '#92400E', estimated_price_min: 80000,  estimated_price_max: 1500000, average_duration: 240, is_emergency: false, is_active: true },
  { id: 5, name: 'Maçonnerie',     slug: 'maconnerie',     category: 'BTP',         icon: '🧱', color: '#64748B', estimated_price_min: 100000, estimated_price_max: 3000000, average_duration: 300, is_emergency: false, is_active: true },
  { id: 6, name: 'Climatisation',  slug: 'climatisation',  category: 'Confort',     icon: '❄️', color: '#06B6D4', estimated_price_min: 100000, estimated_price_max: 1500000, average_duration: 150, is_emergency: false, is_active: true },
  { id: 7, name: 'Électroménager', slug: 'electromenager', category: 'Réparation',  icon: '🔌', color: '#10B981', estimated_price_min: 50000,  estimated_price_max: 800000,  average_duration: 90,  is_emergency: false, is_active: true },
  { id: 8, name: 'Soudure',        slug: 'soudure',        category: 'BTP',         icon: '🔥', color: '#DC2626', estimated_price_min: 75000,  estimated_price_max: 1000000, average_duration: 120, is_emergency: false, is_active: true },
]

// Conakry centre approximatif
export const CONAKRY_CENTER = { lat: 9.5370, lng: -13.6785 }

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
    profession: 'Électricienne certifiée', bio: 'Première femme électricienne certifiée du programme Allô Maître. Installations résidentielles et commerciales.',
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

/** Helper pour récupérer des données mockées */
export const mockApi = {
  async getServices() {
    await new Promise((r) => setTimeout(r, 300))
    return SERVICES
  },
  async getNearbyTechnicians(lat?: number, lng?: number) {
    await new Promise((r) => setTimeout(r, 400))
    return TECHNICIANS
  },
  async getRequests(userId?: number) {
    await new Promise((r) => setTimeout(r, 350))
    return REQUESTS
  },
  async getRequest(id: number) {
    await new Promise((r) => setTimeout(r, 250))
    return REQUESTS.find((r) => r.id === id) || null
  },
  async createRequest(data: Partial<ServiceRequest>) {
    await new Promise((r) => setTimeout(r, 600))
    const newReq: ServiceRequest = {
      id: Date.now(),
      reference_number: `SOS-2026-${String(Date.now()).slice(-3)}`,
      client_id: 1,
      service_id: data.service_id || 1,
      status: 'pending',
      priority: data.priority || 'normal',
      title: data.title || '',
      description: data.description || '',
      latitude: data.latitude || CONAKRY_CENTER.lat,
      longitude: data.longitude || CONAKRY_CENTER.lng,
      address: data.address,
      estimated_price: data.estimated_price,
      photos: data.photos || [],
      service: SERVICES.find((s) => s.id === data.service_id),
      created_at: new Date().toISOString(),
    }
    REQUESTS.unshift(newReq)
    return newReq
  },
}
