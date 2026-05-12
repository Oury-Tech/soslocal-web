// ============================================================
// SOSLocal — Notifications hook
// Intègre WS events → Toast UI
// ============================================================
'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useWsStore } from '@/stores/ws.store'
import { useToast } from '@/components/ui/Toast'

interface Notification {
  id:       string
  type:     string
  title:    string
  body:     string
  read:     boolean
  created_at: string
}

export const notifKeys = {
  all:    ['notifications'] as const,
  unread: ['notifications', 'unread'] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: notifKeys.all,
    queryFn:  async () => {
      const { data } = await apiClient.get<Notification[]>(API.notifications.base)
      return data
    },
    staleTime: 30_000,
  })
}

export function useUnreadCount() {
  const { data } = useNotifications()
  return (data ?? []).filter((n) => !n.read).length
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post(API.notifications.readAll),
    onSuccess:  () => qc.invalidateQueries({ queryKey: notifKeys.all }),
  })
}

/** Écoute les notifs WS globales et affiche des toasts */
export function useWsNotifications() {
  const lastEvent = useWsStore((s) => s.lastEvent)
  const toast     = useToast()

  useEffect(() => {
    if (!lastEvent) return

    switch (lastEvent.type) {
      case 'request.matched':
        toast.info('Un artisan a été trouvé pour votre demande !')
        break
      case 'request.accepted':
        toast.success('L\'artisan est en route vers vous')
        break
      case 'request.completed':
        toast.success('Intervention terminée — Pensez à laisser un avis')
        break
      case 'notification.push': {
        const n = lastEvent.payload as { title?: string; body?: string }
        if (n?.body) toast.info(n.body)
        break
      }
    }
  }, [lastEvent, toast])
}
