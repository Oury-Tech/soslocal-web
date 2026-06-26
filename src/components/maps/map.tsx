'use client'

import { useEffect, useRef } from 'react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getServiceIcon } from '@/lib/utils/service-icons'
import { resolveTechnicianAvatar } from '@/lib/utils/technician-photos'
import type { Technician } from '@/types'

/**
 * Rend la VRAIE icône métier de l'artisan (même jeu d'icônes Lucide que le
 * reste de l'app) en markup SVG, pour l'injecter dans le marqueur Leaflet —
 * plomberie = goutte, électricité = éclair, etc. au lieu d'une clé générique.
 */
function serviceIconSvg(slug?: string, name?: string): string {
  const Icon = getServiceIcon(slug, name)
  return renderToStaticMarkup(
    createElement(Icon, { width: 16, height: 16, color: '#fff', strokeWidth: 2.4 }),
  )
}

interface MapProps {
  center?: [number, number]
  zoom?: number
  userPosition?: { lat: number; lng: number }
  technicians?: Technician[]
  onTechnicianClick?: (tech: Technician) => void
  className?: string
  /** Désactive le zoom à la molette (utile pour une carte vitrine dans une page qui défile). */
  scrollWheelZoom?: boolean
  /** Masque les contrôles de zoom (carte purement décorative/aperçu). */
  hideZoomControl?: boolean
}

// Icones custom
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position:relative;width:40px;height:40px;">
      <div style="position:absolute;inset:0;background:#1A3F7A;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>
      <div style="position:absolute;inset:-8px;background:#1A3F7A;border-radius:50%;opacity:0.2;animation:pulse 2s infinite;"></div>
    </div>
    <style>@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 0; } }</style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const technicianIcon = (
  color: string = '#1ABCCC',
  online: boolean = true,
  iconHtml: string = '',
  approx: boolean = false,
) =>
  L.divIcon({
    className: 'custom-tech-marker',
    html: `
      <div style="position:relative;width:36px;height:36px;cursor:pointer;${approx ? 'opacity:0.9;' : ''}">
        <div style="position:absolute;inset:0;background:${color};border-radius:50%;border:3px ${approx ? 'dashed' : 'solid'} #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          ${iconHtml}
        </div>
        ${approx
          ? '<div title="Position approximative" style="position:absolute;bottom:-3px;right:-3px;width:14px;height:14px;background:#fff;border:1px solid #94A3B8;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;line-height:1;color:#64748b;font-weight:700;">~</div>'
          : (online ? '<div style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;background:#10B981;border:2px solid #fff;border-radius:50%;"></div>' : '')}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

export default function Map({
  center = [9.5370, -13.6785], // Conakry
  zoom = 13,
  userPosition,
  technicians = [],
  onTechnicianClick,
  className = 'h-full w-full',
  scrollWheelZoom = true,
  hideZoomControl = false,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    if (!hideZoomControl) L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.control.attribution({ position: 'bottomleft', prefix: '© OpenStreetMap' }).addTo(map)

    mapRef.current = map

    // ── Anti-« carte grise / à moitié chargée » ────────────────────────────
    // Leaflet calcule la taille des tuiles au montage. Si le conteneur n'a pas
    // encore sa taille finale (grille/flex qui se stabilise, import dynamique,
    // onglet caché…), la carte n'affiche qu'une bande grise tant qu'on n'a pas
    // appelé invalidateSize(). On force donc un recalcul juste après le montage
    // PUIS à chaque redimensionnement réel du conteneur.
    const invalidate = () => map.invalidateSize({ animate: false })
    const t1 = setTimeout(invalidate, 0)
    const t2 = setTimeout(invalidate, 250)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => invalidate())
      ro.observe(containerRef.current)
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      ro?.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line

  // User marker
  useEffect(() => {
    if (!mapRef.current) return
    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }
    if (userPosition) {
      const marker = L.marker([userPosition.lat, userPosition.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('<strong>Votre position</strong>')
      userMarkerRef.current = marker
      mapRef.current.setView([userPosition.lat, userPosition.lng], zoom)
    }
  }, [userPosition, zoom])

  // Technicians markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear old markers
    markersRef.current.forEach((m) => mapRef.current?.removeLayer(m))
    markersRef.current = []

    technicians.forEach((tech) => {
      if (tech.latitude && tech.longitude) {
        const color = tech.services?.[0]?.color || '#1ABCCC'
        const iconHtml = serviceIconSvg(tech.services?.[0]?.slug, tech.profession)
        const approx = (tech as any).location_approx === true
        const marker = L.marker([tech.latitude, tech.longitude], {
          icon: technicianIcon(color, tech.is_online, iconHtml, approx),
        }).addTo(mapRef.current!)

        const photo = resolveTechnicianAvatar(tech, 96)
        marker.bindPopup(`
          <div style="min-width:200px;font-family:'Outfit',sans-serif;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <img src="${photo}" alt="" referrerpolicy="no-referrer" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#0078FF;" onerror="this.style.display='none'" />
              <div style="min-width:0;">
                <div style="font-weight:700;font-size:14px;">${tech.name}</div>
                <div style="font-size:12px;color:#64748b;">${tech.profession}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" style="display:inline-block;vertical-align:-2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style="font-weight:600;">${tech.rating.toFixed(1)}</span>
              <span style="color:#64748b;">· ${tech.total_jobs_completed} missions</span>
            </div>
            <div style="margin-top:6px;font-size:11px;color:${tech.is_online ? '#10B981' : '#64748b'};font-weight:600;">
              ${tech.is_online ? '● En ligne' : '○ Hors ligne'}
            </div>
            ${approx ? `<div style="margin-top:6px;font-size:11px;color:#94A3B8;display:flex;align-items:center;gap:4px;">~ Position approximative${(tech as any).address ? ` · ${String((tech as any).address).split(',')[0]}` : ''}</div>` : ''}
          </div>
        `)

        marker.on('click', () => {
          onTechnicianClick?.(tech)
        })

        markersRef.current.push(marker)
      }
    })
  }, [technicians, onTechnicianClick])

  // `isolate` (isolation:isolate) crée un contexte d'empilement propre à la
  // carte : les z-index internes de Leaflet (panes jusqu'à 700, contrôles 1000)
  // restent CONFINÉS dans ce conteneur et ne débordent plus au-dessus des
  // modales/overlays de l'app (ex. la contre-proposition de prix).
  return <div ref={containerRef} className={`isolate ${className}`} />
}
