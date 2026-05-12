'use client'

import { useState, useEffect } from 'react'
import { useRequests } from '@/hooks/queries/useRequests'
import { RequestStatusBadge } from '@/components/ui/RequestStatusBadge'
import { formatRelative } from '@/lib/utils/format'

// Leaflet must be loaded client-side only
export default function CartePage() {
  return <CarteClient />
}

function CarteClient() {
  const [mounted, setMounted] = useState(false)
  const [selectedReq, setSelectedReq] = useState<string | null>(null)

  const { data: requests = [] } = useRequests()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock artisan positions near Conakry
  const ARTISANS = [
    { id: 'a1', name: 'Ibrahima Sow', service: 'Électricité', lat: 9.6412, lng: -13.5784, available: true, rating: 4.9 },
    { id: 'a2', name: 'Mamadou Barry', service: 'Plomberie', lat: 9.6480, lng: -13.5720, available: true, rating: 4.7 },
    { id: 'a3', name: 'Fatoumata Diallo', service: 'Maçonnerie', lat: 9.6350, lng: -13.5850, available: false, rating: 4.8 },
    { id: 'a4', name: 'Oumar Kouyaté', service: 'Menuiserie', lat: 9.6510, lng: -13.5680, available: true, rating: 4.6 },
  ]

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carte</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Artisans disponibles près de vous — Conakry
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
            {ARTISANS.filter((a) => a.available).length} disponibles
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
          {mounted ? (
            <LeafletMap artisans={ARTISANS} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl border border-gray-100 shadow-md p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
              Artisan disponible
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
              Artisan occupé
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full bg-brand-500 flex-shrink-0" />
              Votre position
            </div>
          </div>
        </div>

        {/* Artisan list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-sm text-gray-900">
              Artisans proches
            </p>
            <p className="text-xs text-gray-400">
              Dans un rayon de 5 km
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {ARTISANS.map((a) => (
              <div
                key={a.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
                      {a.name.charAt(0)}
                    </div>

                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        a.available ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {a.name}
                    </p>

                    <p className="text-xs text-gray-400">{a.service}</p>

                    <div className="flex items-center gap-1 mt-0.5">
                      <i
                        className="ti ti-star-filled text-amber-400 text-xs"
                        aria-hidden
                      />

                      <span className="text-xs text-gray-500">
                        {a.rating}
                      </span>
                    </div>
                  </div>

                  {a.available && (
                    <a
                      href="/beneficiaire/nouvelle"
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                    >
                      Contacter
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Leaflet map component — SSR-safe
function LeafletMap({ artisans }: { artisans: any[] }) {
  useEffect(() => {
    let map: any = null

    const initMap = async () => {
      const L = (await import('leaflet')).default

      const container = document.getElementById('leaflet-map')

      if (!container || (container as any)._leaflet_id) return

      delete (L.Icon.Default.prototype as any)._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      map = L.map('leaflet-map', {
        zoomControl: true,
      }).setView([9.6412, -13.5784], 13)

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(map)

      // User marker
      const userIcon = L.divIcon({
        html: `
          <div style="
            width:14px;
            height:14px;
            border-radius:50%;
            background:#2460B0;
            border:3px solid white;
            box-shadow:0 0 0 4px rgba(36,96,176,0.25)
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: '',
      })

      L.marker([9.6412, -13.5784], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>Votre position</strong>')

      // Artisan markers
      artisans.forEach((a) => {
        const color = a.available ? '#16A34A' : '#9CA3AF'

        const icon = L.divIcon({
          html: `
            <div style="
              width:36px;
              height:36px;
              border-radius:50%;
              background:${color};
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.2);
              display:flex;
              align-items:center;
              justify-content:center;
              color:white;
              font-weight:700;
              font-size:13px;
              font-family:'Outfit',sans-serif;
            ">
              ${a.name.charAt(0)}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: '',
        })

        L.marker([a.lat, a.lng], { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width:160px;font-family:'Outfit',sans-serif">
              <p style="font-weight:700;margin:0 0 4px">${a.name}</p>
              <p style="color:#6b7280;font-size:12px;margin:0 0 4px">${a.service}</p>
              <p style="font-size:12px;margin:0;color:${color}">
                ${a.available ? '● Disponible' : '● Occupé'}
              </p>
            </div>
          `,
            { maxWidth: 200 }
          )
      })
    }

    initMap()

    return () => {
      map?.remove()
    }
  }, [artisans])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div
        id="leaflet-map"
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </>
  )
}