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
    staleTime: 15_000,
    refetchInterval: 30_000,
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
    staleTime: 15_000,
    refetchInterval: 30_000,
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

// ──────────────────────────────────────────────────────────────────
// Préférences de notification (serveur) — cohérentes avec l'app mobile
// GET / PATCH  /notifications/preferences
// ──────────────────────────────────────────────────────────────────
export interface NotificationPrefs {
  push_enabled:    boolean
  email_enabled:   boolean
  new_request:     boolean
  request_update:  boolean
  messages:        boolean
  promotions:      boolean
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  push_enabled:   true,
  email_enabled:  true,
  new_request:    true,
  request_update: true,
  messages:       true,
  promotions:     false,
}

export function useNotificationPrefs() {
  return useQuery<NotificationPrefs>({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationPrefs>(API.NOTIFICATION_PREFS)
      return { ...DEFAULT_NOTIF_PREFS, ...data }
    },
    staleTime: 60_000,
  })
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPrefs>) => {
      const { data } = await apiClient.patch<NotificationPrefs>(API.NOTIFICATION_PREFS, prefs)
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(['notifications', 'preferences'], { ...DEFAULT_NOTIF_PREFS, ...data })
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

    // Le backend pousse un évènement unifié `{ type: 'notification', event, title, body, ... }`.
    // On affiche un toast adapté selon `event` (statut de la demande).
    if (lastEvent.type === 'notification') {
      const ev = lastEvent.event
      switch (ev) {
        case 'request_matched':
          toast.info('Un artisan a été trouvé pour votre demande !')
          break
        case 'request_accepted':
          // L'artisan a accepté ET proposé son prix (nouveau flux).
          toast.success(lastEvent.body ?? "L'artisan a accepté votre demande et proposé un prix")
          break
        case 'request_started':
          toast.info(lastEvent.body ?? "L'intervention a démarré")
          break
        case 'request_completed':
          toast.success(lastEvent.body ?? 'Intervention terminée — pensez à laisser un avis')
          break
        case 'request_cancelled':
          toast.warning(lastEvent.body ?? 'La demande a été annulée')
          break
        // ── Négociation de prix (bidirectionnelle) ──────────────────────────
        case 'final_price_set':
          // Côté client : l'artisan a (re)fixé le montant à régler.
          toast.info(lastEvent.body ?? "L'artisan a fixé le montant à régler")
          break
        case 'price_counter_offer':
          // Côté artisan : le client propose un autre montant.
          toast.info(lastEvent.body ?? 'Le client propose un autre montant')
          break
        // ── Paiement temps réel ─────────────────────────────────────────────
        case 'payment_completed':
          // Côté client : paiement confirmé.
          toast.success(lastEvent.body ?? '✅ Paiement confirmé')
          break
        case 'payment_received':
          // Côté artisan : vous avez été payé.
          toast.success(lastEvent.body ?? '💰 Vous avez été payé')
          break
        case 'payment_failed':
          toast.warning(lastEvent.body ?? 'Le paiement a échoué')
          break
        default:
          if (lastEvent.body) toast.info(lastEvent.body)
      }

      // Rafraîchissement instantané des caches concernés.
      qc.invalidateQueries({ queryKey: notifKeys.all })
      qc.invalidateQueries({ queryKey: notifKeys.stats })
      qc.invalidateQueries({ queryKey: ['requests'] })
      if (lastEvent.entity_type === 'request' && lastEvent.entity_id != null) {
        qc.invalidateQueries({ queryKey: ['requests', lastEvent.entity_id] })
      }
      return
    }

    // ── Nouveau message de chat (canal temps réel global) ──────────────────────
    // Met à jour TOUTE la chaîne de conversation instantanément, même si la
    // conversation concernée n'est pas ouverte : liste des conversations,
    // compteur de non-lus, dernier message et fil de la conversation.
    if (lastEvent.type === 'chat_message') {
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      if (lastEvent.room_id != null) {
        qc.invalidateQueries({ queryKey: ['chat', 'messages', String(lastEvent.room_id)] })
      }
      const who = lastEvent.sender_name ?? 'Nouveau message'
      toast.info(lastEvent.preview ? `${who} : ${lastEvent.preview}` : `${who} vous a écrit`)
      return
    }

    // ── Message supprimé (canal temps réel global) ─────────────────────────────
    // Retire le message du fil concerné et rafraîchit la liste des conversations.
    if ((lastEvent as any).type === 'message_deleted') {
      const e = lastEvent as any
      if (e.room_id != null) {
        qc.invalidateQueries({ queryKey: ['chat', 'messages', String(e.room_id)] })
      }
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      return
    }

    // ── Présence (en ligne / hors ligne) d'un correspondant ────────────────────
    // Le point vert de la liste des conversations reflète la présence réelle.
    if (lastEvent.type === 'presence') {
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      return
    }

    // Compat. avec d'anciens types d'évènements (rétro-compatibilité).
    if (lastEvent.type?.startsWith('notification') || lastEvent.type?.startsWith('request')) {
      qc.invalidateQueries({ queryKey: notifKeys.all })
      qc.invalidateQueries({ queryKey: notifKeys.stats })
      qc.invalidateQueries({ queryKey: ['requests'] })
    }
  }, [lastEvent, toast, qc])
}
