'use client'

import { useTechnician } from '@/hooks/queries/useTechnicians'

const CERT = {
  bronze: { label: 'Bronze', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  silver: { label: 'Argent', cls: 'bg-gray-100 text-gray-700 ring-gray-200' },
  gold: { label: 'Or', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  expert: { label: 'Expert', cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
} as const

export function TechnicianCard({
  technicianId,
  requestId,
}: {
  technicianId: number
  requestId?: number
}) {
  const { data: tech, isLoading } = useTechnician(technicianId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border animate-pulse" />
    )
  }

  if (!tech) return null

  const cert =
    tech.is_verified
      ? CERT.gold
      : tech.total_reviews > 20
      ? CERT.silver
      : CERT.bronze

  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm">
      <p className="text-xs text-gray-400 mb-3">Votre artisan</p>

      <div className="flex items-center gap-4">
        {/* AVATAR */}
        {tech.avatar_url ? (
          <img
            src={tech.avatar_url}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center font-bold">
            {tech.name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <p className="font-semibold">{tech.name}</p>

          <span className={`text-xs px-2 py-0.5 rounded ${cert.cls}`}>
            {cert.label}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        {tech.total_jobs_completed} missions • {tech.rating.toFixed(1)} ⭐
      </div>

      {requestId && (
        <a
          href={`/chat/${requestId}`}
          className="block mt-3 text-center py-2 bg-brand-600 text-white rounded-xl"
        >
          Message
        </a>
      )}
    </div>
  )
}