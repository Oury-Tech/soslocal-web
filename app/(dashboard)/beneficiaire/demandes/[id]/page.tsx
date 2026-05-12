'use client'
import { use, useState } from 'react'
import { useRequest, useCancelRequest } from '@/hooks/queries/useRequests'
import { useWebSocket } from '@/hooks/useWebSocket'
import { RequestStatusBadge } from '@/components/ui/RequestStatusBadge'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'
import { TechnicianCard } from '@/components/features/technicians/TechnicianCard'
import { formatDate, formatGNF } from '@/lib/utils/format'

const STEPS = [
  { key: 'pending',     label: 'Envoyée',       icon: 'send'           },
  { key: 'matching',    label: 'Recherche',      icon: 'search'         },
  { key: 'accepted',    label: 'En route',       icon: 'map-pin'        },
  { key: 'in_progress', label: 'Intervention',   icon: 'tool'           },
  { key: 'completed',   label: 'Terminée',       icon: 'circle-check'   },
]
const STEP_IDX: Record<string, number> = { pending:0, matching:1, assigned:1, accepted:2, in_progress:3, completed:4, rated:4 }

export default function DemandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: req, isLoading } = useRequest(id)
  const cancel = useCancelRequest()
  const [showReview, setShowReview] = useState(false)
  const isLive = req?.status === 'in_progress'
  const { connectionState } = useWebSocket(isLive ? id : null)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-64" />
        <div className="h-28 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    )
  }
  if (!req) {
    return (
      <div className="text-center py-20">
        <i className="ti ti-file-unknown text-4xl text-gray-300 block mb-3" aria-hidden />
        <p className="text-gray-500">Demande introuvable</p>
      </div>
    )
  }

  const stepIdx   = STEP_IDX[req.status] ?? 0
  const canCancel = ['pending','matching','assigned'].includes(req.status)
  const canReview = req.status === 'completed'

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href="/beneficiaire/demandes" className="text-sm text-brand-600 hover:text-brand-700">← Mes demandes</a>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{req.service?.name ?? 'Intervention'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatDate(req.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />En direct
            </div>
          )}
          <RequestStatusBadge status={req.status} />
        </div>
      </div>

      {/* Stepper */}
      {!['cancelled'].includes(req.status) && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done = i < stepIdx, cur = i === stepIdx, future = i > stepIdx
              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${done ? 'bg-green-500' : cur ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-gray-100'}`}>
                      <i className={`ti ti-${done ? 'check' : s.icon} text-sm ${done || cur ? 'text-white' : 'text-gray-300'}`} aria-hidden />
                    </div>
                    <span className={`text-xs text-center leading-tight max-w-[60px] ${future ? 'text-gray-300' : cur ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? 'bg-green-400' : 'bg-gray-100'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Artisan */}
      {req.technician_id && <TechnicianCard technicianId={req.technician_id} requestId={id} />}

      {/* Details */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-900">Détails</h2>
        <dl className="space-y-3">
          {[
            { label: 'Description', value: req.description },
            { label: 'Adresse', value: req.location.address ?? '—' },
            { label: 'Urgence', value: req.urgency },
            ...(req.estimated_price != null ? [{ label: 'Devis estimé', value: formatGNF(req.estimated_price), highlight: true }] : []),
            ...(req.final_price != null ? [{ label: 'Montant final', value: formatGNF(req.final_price), highlight: true }] : []),
            ...(req.scheduled_at ? [{ label: 'Planifiée le', value: formatDate(req.scheduled_at) }] : []),
          ].map((row: any) => (
            <div key={row.label} className="flex justify-between items-start gap-4">
              <dt className="text-sm text-gray-400 flex-shrink-0">{row.label}</dt>
              <dd className={`text-sm text-right ${row.highlight ? 'font-semibold text-brand-700' : 'text-gray-900'}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {canCancel && (
          <button onClick={() => confirm('Annuler cette demande ?') && cancel.mutate(id)} disabled={cancel.isPending}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors">
            {cancel.isPending ? 'Annulation…' : 'Annuler la demande'}
          </button>
        )}
        {req.technician_id && (
          <a href={`/chat/${req.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors">
            <i className="ti ti-message-2" aria-hidden />Contacter l&apos;artisan
          </a>
        )}
        {canReview && !showReview && (
          <button onClick={() => setShowReview(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
            <i className="ti ti-star" aria-hidden />Évaluer
          </button>
        )}
      </div>

      {canReview && showReview && req.technician_id && (
        <ReviewForm requestId={id} technicianId={req.technician_id} onSuccess={() => setShowReview(false)} />
      )}

      {isLive && (
        <div className="flex items-center justify-center gap-2 py-2">
          <span className={`w-1.5 h-1.5 rounded-full ${connectionState === 'connected' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-400">{connectionState === 'connected' ? 'Suivi temps réel actif' : 'Reconnexion…'}</span>
        </div>
      )}
    </div>
  )
}
