'use client'

import { use, useEffect, useState } from 'react'
import { useRequest, useCancelRequest } from '@/hooks/queries/useRequests'
import { useWebSocket } from '@/hooks/useWebSocket'
import { RequestStatusBadge } from '@/components/ui/RequestStatusBadge'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'
import { TechnicianCard } from '@/components/features/technicians/TechnicianCard'
import { formatDate, formatGNF } from '@/lib/utils/format'

const STEPS = [
  { key: 'pending', label: 'Envoyée', icon: 'send' },
  { key: 'matching', label: 'Recherche', icon: 'search' },
  { key: 'accepted', label: 'En route', icon: 'map-pin' },
  { key: 'in_progress', label: 'Intervention', icon: 'tool' },
  { key: 'completed', label: 'Terminée', icon: 'circle-check' },
]

const STEP_IDX: Record<string, number> = {
  pending: 0,
  matching: 1,
  assigned: 1,
  accepted: 2,
  in_progress: 3,
  completed: 4,
  rated: 4,
}

export default function DemandePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const requestId = Number(id)

  const { data: req, isLoading } = useRequest(requestId)
  const cancel = useCancelRequest()

  const [showReview, setShowReview] = useState(false)

  const isLive = req?.status === 'in_progress'

  // ✅ WebSocket propre (sans options invalides)
  const { isConnected, send } = useWebSocket()

  // ✅ abonnement au request dès connexion
  useEffect(() => {
    if (isConnected && req?.id) {
      send({
        type: 'request_status',
        request_id: req.id,
      })
    }
  }, [isConnected, req?.id, send])

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
        <i
          className="ti ti-file-unknown text-4xl text-gray-300 block mb-3"
          aria-hidden
        />
        <p className="text-gray-500">Demande introuvable</p>
      </div>
    )
  }

  const stepIdx = STEP_IDX[req.status] ?? 0

  const canCancel = ['pending', 'matching', 'assigned'].includes(req.status)
  const canReview = req.status === 'completed'

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <a
            href="/beneficiaire/demandes"
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            ← Mes demandes
          </a>

          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {req.service?.name ?? 'Intervention'}
          </h1>

          <p className="text-sm text-gray-400 mt-0.5">
            {formatDate(req.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />
              En direct
            </div>
          )}

          <RequestStatusBadge status={req.status} />
        </div>
      </div>

      {/* STEPPER */}
      {req.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const done = i < stepIdx
              const current = i === stepIdx
              const future = i > stepIdx

              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        done
                          ? 'bg-green-500'
                          : current
                          ? 'bg-brand-600 ring-4 ring-brand-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <i
                        className={`ti ti-${done ? 'check' : s.icon} text-sm ${
                          done || current ? 'text-white' : 'text-gray-300'
                        }`}
                        aria-hidden
                      />
                    </div>

                    <span
                      className={`text-xs text-center leading-tight max-w-[60px] ${
                        future
                          ? 'text-gray-300'
                          : current
                          ? 'text-gray-800 font-semibold'
                          : 'text-gray-500'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mb-5 ${
                        done ? 'bg-green-400' : 'bg-gray-100'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TECHNICIAN */}
      {req.technician_id && (
        <TechnicianCard
          technicianId={String(req.technician_id)}
          requestId={String(requestId)}
        />
      )}

      {/* DETAILS */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-semibold text-sm text-gray-900">Détails</h2>

        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-400">Description</dt>
            <dd className="text-sm text-gray-900">{req.description ?? '—'}</dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-sm text-gray-400">Statut</dt>
            <dd className="text-sm text-gray-900">{req.status}</dd>
          </div>

          {req.estimated_price != null && (
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Devis estimé</dt>
              <dd className="text-sm font-semibold text-brand-700">
                {formatGNF(req.estimated_price)}
              </dd>
            </div>
          )}

          {req.final_price != null && (
            <div className="flex justify-between">
              <dt className="text-sm text-gray-400">Montant final</dt>
              <dd className="text-sm font-semibold text-brand-700">
                {formatGNF(req.final_price)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        {canCancel && (
          <button
            onClick={() => {
              if (confirm('Annuler cette demande ?')) {
                cancel.mutate(requestId)
              }
            }}
            disabled={cancel.isPending}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50"
          >
            {cancel.isPending ? 'Annulation…' : 'Annuler'}
          </button>
        )}

        {req.technician_id && (
          <a
            href={`/chat/${req.id}`}
            className="flex-1 py-3 rounded-xl text-center text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700"
          >
            Contacter
          </a>
        )}

        {canReview && !showReview && (
          <button
            onClick={() => setShowReview(true)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700"
          >
            Évaluer
          </button>
        )}
      </div>

      {/* REVIEW */}
      {canReview && showReview && req.technician_id && (
        <ReviewForm
          requestId={String(requestId)}
          technicianId={String(req.technician_id)}
          onSuccess={() => setShowReview(false)}
        />
      )}

      {/* LIVE STATUS */}
      {isLive && (
        <div className="flex items-center justify-center gap-2 py-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Suivi temps réel actif' : 'Connexion…'}
          </span>
        </div>
      )}
    </div>
  )
}