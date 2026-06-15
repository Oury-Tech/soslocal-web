// src/lib/notifications/href.ts
// ============================================================
// SOSLocal — Résolution du lien cible d'une notification.
//
// Chaque alerte doit mener vers SA page (la demande, la conversation,
// le paiement…). Le backend peut fournir `action_url`, mais ce n'est pas
// garanti pour TOUTES les notifications. On dérive donc une cible fiable
// côté client à partir de `entity_type` / `entity_id` / `type`, avec
// `action_url` prioritaire quand il existe.
//
// La route générique `/requests/{id}` redirige déjà selon le rôle
// (client → demande, artisan → mission, opérateur → modération), donc on
// l'utilise pour toutes les entités « demande ».
// ============================================================
import type { AppNotification } from '@/hooks/useNotifications'

/** URL de destination d'une notification, ou `null` si non navigable. */
export function resolveNotifHref(n: AppNotification): string | null {
  // 1) Lien explicite fourni par le backend → priorité absolue.
  if (n.action_url) return n.action_url

  const id = n.entity_id ?? undefined
  const et = (n.entity_type ?? '').toLowerCase()

  // 2) Routage par type d'entité (le plus fiable).
  if (id != null) {
    if (et.includes('request') || et.includes('demande') || et.includes('mission'))
      return `/requests/${id}`
    if (et.includes('chat') || et.includes('room') || et.includes('conversation'))
      return `/chat/${id}`
    if (et.includes('payment') || et.includes('paiement'))
      return `/payment/${id}`
    if (et.includes('review') || et.includes('avis'))
      return `/requests/${id}`
    if (et.includes('user') || et.includes('artisan') || et.includes('technician'))
      return `/operateur/utilisateurs`
  }

  // 3) Repli sur le type de notification quand l'entité est absente/inconnue.
  switch ((n.type ?? '').toLowerCase()) {
    case 'chat':
    case 'message':
      return id != null ? `/chat/${id}` : '/chat'
    case 'payment':
      return id != null ? `/payment/${id}` : '/paiements'
    case 'request':
      return id != null ? `/requests/${id}` : null
    case 'review':
      return id != null ? `/requests/${id}` : '/notifications'
    default:
      return null
  }
}
