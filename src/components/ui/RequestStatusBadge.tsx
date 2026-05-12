import type { RequestStatus } from '@/types'

const CONFIG: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'En attente',       cls: 'bg-amber-50 text-amber-700 ring-amber-200'   },
  matching:    { label: 'Recherche artisan', cls: 'bg-blue-50 text-blue-700 ring-blue-200'     },
  assigned:    { label: 'Artisan trouvé',   cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200'},
  accepted:    { label: 'Confirmé',         cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200'},
  in_progress: { label: 'En cours',         cls: 'bg-brand-50 text-brand-700 ring-brand-200'  },
  completed:   { label: 'Terminée',         cls: 'bg-green-50 text-green-700 ring-green-200'  },
  rated:       { label: 'Évaluée',          cls: 'bg-green-50 text-green-700 ring-green-200'  },
  cancelled:   { label: 'Annulée',          cls: 'bg-red-50 text-red-700 ring-red-200'        },
}

interface RequestStatusBadgeProps {
  status: RequestStatus
  size?:  'sm' | 'md'
}

export function RequestStatusBadge({ status, size = 'md' }: RequestStatusBadgeProps) {
  const cfg = CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 ring-gray-200' }
  return (
    <span className={[
      'inline-flex items-center font-medium rounded-full ring-1',
      cfg.cls,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs',
    ].join(' ')}>
      {status === 'in_progress' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-dot" />
      )}
      {cfg.label}
    </span>
  )
}
