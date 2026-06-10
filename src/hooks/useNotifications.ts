// src/hooks/useNotifications.ts
// ============================================================
// SOSLocal — Notifications (100 % backend réel, aucun mock)
// Liste + compteur + marquer lu / tout lu + suppression.
// Intègre aussi les events WS → Toast UI.
// ============================================================
'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useWsStore } from '@/stores/ws.store'
import { useToast } from '@/components/ui/Toast'

// Schéma exact renvoyé par le backend (NotificationResponse)
export interface AppNotification {
  id:            number
  user_id:       number
  title:         string
  message:       string
  short_message?: string | null
  type:          string   // info|success|warning|error|request|payment|review|chat|system|promotion
  priority?:     string   // low|normal|high|urgent
  entity_type?:  string | null
  entity_id?:    number | null
  action_url?:   string | null
  action_label?: string | null
  read:          boolean
  read_at?:      string | null
  created_at:    string
}

export interface NotificationStats {
  total:  number
  unread: number
  read:   number
}

export const notifKeys = {
  all:   ['notifications'] as const,
  stats: ['notifications', 'stats'] as const,
}

/** Liste des notifications de l'utilisateur courant. */
export function useNotifications() {
  return useQuery({
    queryKey: notifKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get<AppNotification[]>(API.NOTIFICATIONS)
      return data ?? []
    },
    staleTime: 20_000,
    refetchInterval: 60_000,
  })
}

/** Compteur de non-lues — basé sur les stats backend (rafraîchi seul). */
export function useUnreadCount(): number {
  const { data } = useQuery({
    queryKey: notifKeys.stats,
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationStats>(`${API.NOTIFICATIONS}/stats`)
      return data
    },
    staleTime: 20_000,
    refetchInterval: 60_000,
  })
  return data?.unread ?? 0
}

/** Marquer une notification comme lue. */
export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.patch(API.NOTIFICATION_READ(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all })
      qc.invalidateQueries({ queryKey: notifKeys.stats })
    },
  })
}

/** Marquer toutes les notifications comme lues (PATCH). */
export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.patch(API.NOTIFICATIONS_READ_ALL),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all })
      qc.invalidateQueries({ queryKey: notifKeys.stats })
    },
  })
}

/** Supprimer une notification. */
export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API.NOTIFICATIONS}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notifKeys.all })
      qc.invalidateQueries({ queryKey: notifKeys.stats })
    },
  })
}

/** Écoute les notifs WS globales : toast + rafraîchissement de la liste. */
export function useWsNotifications() {
  const lastEvent = useWsStore((s) => s.lastEvent)
  const toast = useToast()
  const qc = useQueryClient()

  useEffect(() => {
    if (!lastEvent) return

    switch (lastEvent.type) {
      case 'request.matched':
        toast.info('Un artisan a été trouvé pour votre demande !')
        break
      case 'request.accepted':
        toast.success("L'artisan est en route vers vous")
        break
      case 'request.completed':
        toast.success('Intervention terminée — Pensez à laisser un avis')
        break
      case 'notification.push': {
        const n = lastEvent.payload as { title?: string; body?: string; message?: string }
        const body = n?.body ?? n?.message
        if (body) toast.info(body)
        break
      }
    }

    // Toute notif entrante invalide les caches pour rester synchro.
    if (lastEvent.type?.startsWith('notification') || lastEvent.type?.startsWith('request')) {
      qc.invalidateQueries({ queryKey: notifKeys.all })
      qc.invalidateQueries({ queryKey: notifKeys.stats })
    }
  }, [lastEvent, toast, qc])
}
