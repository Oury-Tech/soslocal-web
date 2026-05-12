'use client'
import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info' | 'warning'
interface ToastItem { id: string; type: ToastType; message: string }
interface ToastStore { toasts: ToastItem[]; add: (t: Omit<ToastItem,'id'>) => void; remove: (id: string) => void }

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

const CFG: Record<ToastType, { cls: string; icon: string }> = {
  success: { cls: 'bg-green-50 border-green-200 text-green-800', icon: 'circle-check-filled' },
  error:   { cls: 'bg-red-50 border-red-200 text-red-800',       icon: 'alert-circle-filled' },
  info:    { cls: 'bg-brand-50 border-brand-200 text-brand-800', icon: 'info-circle-filled'  },
  warning: { cls: 'bg-amber-50 border-amber-200 text-amber-800', icon: 'alert-triangle-filled'},
}

export function useToast() {
  const { add } = useToastStore()
  return {
    success: (m: string) => add({ type: 'success', message: m }),
    error:   (m: string) => add({ type: 'error',   message: m }),
    info:    (m: string) => add({ type: 'info',     message: m }),
    warning: (m: string) => add({ type: 'warning',  message: m }),
  }
}

export function Toast() {
  const { toasts, remove } = useToastStore()
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => {
        const c = CFG[t.type]
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-slide-up ${c.cls}`}>
            <i className={`ti ti-${c.icon} text-xl flex-shrink-0`} aria-hidden />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Fermer">
              <i className="ti ti-x text-sm" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
