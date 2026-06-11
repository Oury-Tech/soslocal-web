'use client'

/**
 * CallOverlay — interface plein écran d'un appel audio/vidéo (Jitsi Meet).
 *
 * Trois phases :
 *   - incoming : appel entrant (Accepter / Refuser)
 *   - outgoing : appel sortant (sonnerie « Appel en cours… »)
 *   - active   : appel connecté → iframe Jitsi (micro, caméra, raccrocher gérés
 *     directement par Jitsi).
 *
 * Jitsi est libre et gratuit (instance publique meet.jit.si), sans clé ni compte.
 */

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Phone, PhoneOff } from 'lucide-react'
import type { JitsiRoom } from '@/hooks/useCall'

// Jitsi est strictement côté navigateur (charge external_api.js) : on évite le SSR.
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then((m) => m.JitsiMeeting),
  { ssr: false },
)

export type CallPhase = 'incoming' | 'outgoing' | 'active'
export type CallMode = 'audio' | 'video'

interface CallOverlayProps {
  phase: CallPhase
  mode: CallMode
  otherName: string
  otherAvatar?: string
  /** Salle Jitsi (disponible une fois l'appel connecté). */
  room: JitsiRoom | null
  onAccept: () => void
  onDecline: () => void
  onHangup: () => void
}

// ─── Avatar central (appel entrant / sortant) ─────────────────────────────────────

function CallerCard({
  name, avatar, subtitle,
}: { name: string; avatar?: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-5 text-white">
      <div className="relative">
        <span className="absolute inset-0 -m-3 rounded-full bg-white/10 animate-ping" />
        <div className="relative h-28 w-28 rounded-full bg-brand-500 flex items-center justify-center text-4xl font-semibold shadow-2xl">
          {avatar || name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold">{name}</h2>
        <p className="text-sm text-white/70 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Overlay principal ────────────────────────────────────────────────────────────

export function CallOverlay({
  phase, mode, otherName, otherAvatar,
  room, onAccept, onDecline, onHangup,
}: CallOverlayProps) {
  const subtitle =
    phase === 'incoming' ? `Appel ${mode === 'video' ? 'vidéo' : 'audio'} entrant…`
    : phase === 'outgoing' ? 'Appel en cours…'
    : 'Connexion…'

  // ── Appel actif : iframe Jitsi plein écran ──────────────────────────────────────
  if (phase === 'active' && room) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black"
      >
        <JitsiMeeting
          domain={room.domain}
          roomName={room.roomName}
          configOverwrite={{
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: mode === 'audio',
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
            disableDeepLinking: true,
          }}
          interfaceConfigOverwrite={{
            MOBILE_APP_PROMO: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
          }}
          userInfo={{ displayName: room.userName, email: '' }}
          onReadyToClose={onHangup}
          getIFrameRef={(node) => {
            node.style.height = '100%'
            node.style.width = '100%'
          }}
        />
      </motion.div>
    )
  }

  // ── Appel entrant / sortant : carte d'appel + boutons ───────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0a0d14]"
    >
      <div className="flex-1 flex items-center justify-center">
        <CallerCard name={otherName} avatar={otherAvatar} subtitle={subtitle} />
      </div>

      <div className="absolute bottom-0 inset-x-0 pb-10 pt-16 bg-black/40">
        <div className="flex items-center justify-center gap-5">
          {phase === 'incoming' ? (
            <>
              <button
                onClick={onDecline}
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                aria-label="Refuser"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
              <button
                onClick={onAccept}
                className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 animate-bounce"
                aria-label="Accepter"
              >
                <Phone className="h-7 w-7" />
              </button>
            </>
          ) : (
            <button
              onClick={onHangup}
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
              aria-label="Annuler"
            >
              <PhoneOff className="h-7 w-7" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
