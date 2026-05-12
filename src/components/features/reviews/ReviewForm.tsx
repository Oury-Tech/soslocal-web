'use client'
import { useState } from 'react'
import { useCreateReview } from '@/hooks/queries/useServices'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110" aria-label={`${i+1} étoile(s)`}>
          <i className={`ti ti-star${(hover||value)>i?'-filled':''} text-xl ${(hover||value)>i?'text-amber-400':'text-gray-200'}`} aria-hidden />
        </button>
      ))}
    </div>
  )
}

const CRITERIA = [
  { key: 'punctuality'   as const, label: 'Ponctualité',   icon: 'clock' },
  { key: 'quality'       as const, label: 'Qualité',       icon: 'star' },
  { key: 'communication' as const, label: 'Communication', icon: 'message-circle' },
]

export function ReviewForm({ requestId, technicianId, onSuccess }: { requestId: string; technicianId: string; onSuccess: () => void }) {
  const createReview = useCreateReview()
  const [rating, setRating] = useState(0)
  const [scores, setScores]  = useState({ punctuality: 0, quality: 0, communication: 0 })
  const [comment, setComment] = useState('')

  const canSubmit = rating > 0 && Object.values(scores).every((v) => v > 0)

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900">Évaluer l&apos;intervention</h2>
        <p className="text-xs text-gray-400 mt-0.5">Votre avis aide les autres bénéficiaires</p>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Note globale</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="space-y-3">
        {CRITERIA.map((c) => (
          <div key={c.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className={`ti ti-${c.icon} text-sm text-gray-400`} aria-hidden />
              <span className="text-sm text-gray-700">{c.label}</span>
            </div>
            <StarPicker value={scores[c.key]} onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))} />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience…"
          className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 outline-none resize-none bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-gray-300 transition-colors" />
      </div>

      <button type="button" onClick={() => canSubmit && createReview.mutate(
        { request_id: requestId, technician_id: technicianId, rating, ...scores, comment: comment.trim() || undefined },
        { onSuccess }
      )}
        disabled={!canSubmit || createReview.isPending}
        className="w-full py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
        {createReview.isPending
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi…</>
          : 'Envoyer l\'évaluation'
        }
      </button>
    </div>
  )
}
