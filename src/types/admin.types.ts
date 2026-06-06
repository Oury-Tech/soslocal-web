export type ReportTargetType = 'review' | 'message' | 'user' | 'request'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'
export type ModerationAction = 'warning' | 'ban' | 'delete' | 'dismiss'

export interface Report {
  id: number
  target_type: ReportTargetType
  target_id: number
  reporter_name?: string
  reason: string
  excerpt?: string            // contenu signalé (extrait)
  status: ReportStatus
  created_at: string
}

export interface ActivityLog {
  id: number
  actor_name: string
  action: string
  target?: string
  created_at: string
}
