'use client'

import { useEffect, useState } from 'react'
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
  params: { id: string }
}) {
  const requestId = Number(params.id)

  const { data: req, isLoading } = useRequest(requestId)
  const cancel = useCancelRequest()

  const [showReview, setShowReview] = useState(false)

  const isLive = req?.status === 'in_progress'
  const { isConnected, send } = useWebSocket()

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
        <i className="ti ti-file-unknown text-4xl text-gray-300 block mb-3" />
        <p className="text-gray-500">Demande introuvable</p>
      </div>
    )
  }

  const stepIdx = STEP_IDX[req.status] ?? 0

  const canCancel = ['pending', 'matching', 'assigned'].includes(req.status)
  const canReview = req.status === 'completed'

  // ✅ FIX TYPE SAFE
  const technicianId: number | null =
    req.technician_id !== undefined && req.technician_id !== null
      ? Number(req.technician_id)
      : null

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href="/beneficiaire/demandes" className="text-sm text-brand-600">
            ← Mes demandes
          </a>

          <h1 className="text-xl font-bold mt-1">
            {req.service?.name ?? 'Intervention'}
          </h1>

          <p className="text-sm text-gray-400 mt-0.5">
            {formatDate(req.created_at)}
          </p>
        </div>

        <RequestStatusBadge status={req.status} />
      </div>

      {/* TECHNICIAN */}
{technicianId !== null && (
  <TechnicianCard
    technicianId={technicianId}
    requestId={requestId}
  />
)}

      {/* DETAILS */}
      <div className="bg-white rounded-2xl p-6 border space-y-4">
        <h2 className="font-semibold text-sm">Détails</h2>

        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Description</span>
          <span className="text-sm">{req.description ?? '—'}</span>
        </div>

        {req.estimated_price != null && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Devis estimé</span>
            <span className="text-sm font-semibold">
              {formatGNF(req.estimated_price)}
            </span>
          </div>
        )}

        {req.final_price != null && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Final</span>
            <span className="text-sm font-semibold">
              {formatGNF(req.final_price)}
            </span>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        {canCancel && (
          <button
            onClick={() => cancel.mutate(requestId)}
            className="flex-1 py-3 text-red-600 border rounded-xl"
          >
            Annuler
          </button>
        )}

        {technicianId !== null && (
          <a
            href={`/chat/${req.id}`}
            className="flex-1 py-3 text-white bg-brand-600 rounded-xl text-center"
          >
            Contacter
          </a>
        )}

        {canReview && !showReview && (
          <button
            onClick={() => setShowReview(true)}
            className="flex-1 py-3 text-white bg-green-600 rounded-xl"
          >
            Évaluer
          </button>
        )}
      </div>

      {/* REVIEW */}
      {canReview && showReview && technicianId !== null && (
        <ReviewForm
          requestId={requestId}
          technicianId={technicianId}
          onSuccess={() => setShowReview(false)}
        />
      )}

      {/* LIVE */}
      {isLive && (
        <div className="text-center text-xs text-gray-400">
          {isConnected ? 'Suivi actif' : 'Connexion...'}
        </div>
      )}
    </div>
  )
}