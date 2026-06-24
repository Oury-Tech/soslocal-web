'use client'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title?:     string
  children:   ReactNode
  size?:      'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${SIZES[size]} max-w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="font-semibold text-gray-900 min-w-0 truncate">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" aria-label="Fermer">
              <i className="ti ti-x text-base" aria-hidden />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
