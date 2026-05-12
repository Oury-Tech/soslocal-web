// src/components/features/requests/BeneficiaireRequestsList.tsx
'use client'

import { useRequests } from '@/hooks/queries/useRequests'
import { RequestStatusBadge } from '@/components/ui/RequestStatusBadge'
import { formatRelativeTime, formatGNF } from '@/lib/utils/format'
import Link from 'next/link'

export function BeneficiaireRequestsList({ limit = 10 }: { limit?: number }) {
  // ✅ Correction : Supprimer l'argument { per_page: limit }
  const { data: requests = [], isLoading, isError } = useRequests()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
        <span>⚠️</span>
        Impossible de charger les demandes
      </div>
    )
  }

  // ✅ Appliquer la limite après récupération
  const limitedRequests = (requests as any[])?.slice(0, limit) ?? []

  if (!limitedRequests.length) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <span>📋</span>
        </div>
        <p className="text-sm text-gray-500">Aucune demande pour l&apos;instant</p>
        <Link
          href="/beneficiaire/nouvelle"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
        >
          <span>+</span> Créer votre premier SOS
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {limitedRequests.map((req: any) => (
        <Link
          key={req.id}
          href={`/beneficiaire/demandes/${req.id}`}
          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-all group"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xl text-brand-600">
                {req.service?.icon === 'plumber' ? '🔧' : req.service?.icon === 'electrician' ? '⚡' : '🔨'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{req.service?.name ?? 'Service'}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {req.address ?? 'Conakry'} · {formatRelativeTime(req.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {req.estimated_price != null && (
              <span className="text-sm font-semibold text-gray-700">{formatGNF(req.estimated_price)}</span>
            )}
            <RequestStatusBadge status={req.status} size="sm" />
            <span className="text-gray-300 group-hover:text-brand-400 transition-colors">→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}