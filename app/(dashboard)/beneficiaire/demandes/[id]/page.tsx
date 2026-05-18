'use client'

import { use } from 'react'  // ✅ Import essentiel
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRequest, useCancelRequest } from '@/hooks/queries/useRequests'
import { useWebSocket } from '@/hooks/useWebSocket'
import { RequestStatusBadge } from '@/components/ui/RequestStatusBadge'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'
import { TechnicianCard } from '@/components/features/technicians/TechnicianCard'
import { formatDate, formatGNF } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/badge'

// ✅ Interface correcte pour Next.js 15
interface PageProps {
  params: Promise<{ id: string }>
}

const STEPS = [
  { key: 'pending', label: 'Envoyée', icon: 'send' },
  { key: 'matched', label: 'Recherche', icon: 'search' },
  { key: 'accepted', label: 'En route', icon: 'map-pin' },
  { key: 'in_progress', label: 'Intervention', icon: 'tool' },
  { key: 'completed', label: 'Terminée', icon: 'circle-check' },
]

const STEP_IDX: Record<string, number> = {
  pending: 0,
  matched: 1,
  assigned: 1,
  accepted: 2,
  in_progress: 3,
  completed: 4,
  rated: 4,
}

// ✅ Correction : ajout de async et use() pour params
export default function DemandePage({ params }: PageProps) {
  const { id } = use(params)  // ✅ Déballage de la Promise
  const requestId = Number(id)

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
        <Link href="/beneficiaire/demandes" className="text-brand-600">
          ← Retour aux demandes
        </Link>
        <p className="text-gray-500 mt-4">Demande introuvable</p>
      </div>
    )
  }

  const stepIdx = STEP_IDX[req.status] ?? 0

  const canCancel = ['pending', 'matched', 'assigned'].includes(req.status)
  const canReview = req.status === 'completed'

  const technicianId: number | null =
    req.technician_id !== undefined && req.technician_id !== null
      ? Number(req.technician_id)
      : null

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/beneficiaire/demandes" className="text-sm text-brand-600 hover:underline">
            ← Mes demandes
          </Link>
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border space-y-4">
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
            className="flex-1 py-3 text-red-600 border rounded-xl hover:bg-red-50 transition"
          >
            Annuler
          </button>
        )}

        {technicianId !== null && (
          <Link
            href={`/chat/${req.id}`}
            className="flex-1 py-3 text-white bg-brand-600 rounded-xl text-center hover:bg-brand-700 transition"
          >
            Contacter
          </Link>
        )}

        {canReview && !showReview && (
          <button
            onClick={() => setShowReview(true)}
            className="flex-1 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition"
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
          {isConnected ? '✓ Suivi actif' : 'Connexion...'}
        </div>
      )}
    </div>
  )
}