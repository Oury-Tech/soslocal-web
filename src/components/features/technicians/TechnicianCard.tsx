'use client'
import { useTechnician } from '@/hooks/queries/useTechnicians'

const CERT: Record<string, { label: string; cls: string }> = {
  bronze: { label: 'Bronze', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  silver: { label: 'Argent', cls: 'bg-gray-100 text-gray-700 ring-gray-200'  },
  gold:   { label: 'Or',     cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
  expert: { label: 'Expert', cls: 'bg-blue-50 text-blue-700 ring-blue-200'   },
}

export function TechnicianCard({ technicianId, requestId }: { technicianId: string; requestId?: string }) {
  const { data: tech, isLoading } = useTechnician(technicianId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-100 rounded w-40" />
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
        </div>
      </div>
    )
  }
  if (!tech) return null

  const cert = CERT[tech.certification_level] ?? CERT.bronze

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Votre artisan</p>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {tech.user.avatar_url
            ? <img src={tech.user.avatar_url} alt={tech.user.full_name} className="w-14 h-14 rounded-full object-cover" />
            : <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 text-xl font-bold flex items-center justify-center">{tech.user.full_name.charAt(0)}</div>
          }
          <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${tech.status === 'available' ? 'bg-green-500' : tech.status === 'busy' ? 'bg-amber-500' : 'bg-gray-300'}`} />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{tech.user.full_name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${cert.cls}`}>{cert.label}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className={`ti ti-star${i < Math.round(tech.rating) ? '-filled' : ''} text-xs ${i < Math.round(tech.rating) ? 'text-amber-400' : 'text-gray-200'}`} aria-hidden />
            ))}
            <span className="text-xs text-gray-400 ml-1">{tech.rating.toFixed(1)} ({tech.total_reviews})</span>
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {tech.services.slice(0, 3).map((s) => (
              <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">{s.name}</span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-400">Délai moyen</p>
          <p className="text-sm font-semibold text-brand-700">~{tech.response_time_avg} min</p>
          <p className="text-xs text-gray-300 mt-0.5">{tech.total_interventions} missions</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <a href={`tel:${tech.user.phone}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
          <i className="ti ti-phone text-base" aria-hidden />Appeler
        </a>
        {requestId && (
          <a href={`/chat/${requestId}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors">
            <i className="ti ti-message-2 text-base" aria-hidden />Message
          </a>
        )}
      </div>
    </div>
  )
}
