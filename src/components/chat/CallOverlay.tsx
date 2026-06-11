'use client'

/**
 * CallOverlay — interface plein écran d'un appel audio/vidéo (Twilio Video).
 *
 * Trois phases :
 *   - incoming : appel entrant (Accepter / Refuser)
 *   - outgoing : appel sortant (sonnerie « Appel en cours… »)
 *   - active   : appel connecté (tuiles vidéo + contrôles)
 */

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff,
} from 'lucide-react'
import type {
  LocalParticipant, RemoteParticipant,
} from 'twilio-video'
import { cn } from '@/lib/utils/cn'

export type CallPhase = 'incoming' | 'outgoing' | 'active'
export type CallMode = 'audio' | 'video'

interface CallOverlayProps {
  phase: CallPhase
  mode: CallMode
  otherName: string
  otherAvatar?: string
  localParticipant: LocalParticipant | null
  participants: RemoteParticipant[]
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  onAccept: () => void
  onDecline: () => void
  onHangup: () => void
  onToggleAudio: () => void
  onToggleVideo: () => void
}

// ─── Tuile d'un participant (attache ses pistes au DOM) ───────────────────────────

function ParticipantTile({
  participant,
  isLocal = false,
  label,
}: {
  participant: LocalParticipant | RemoteParticipant
  isLocal?: boolean
  label: string
}) {
  const videoRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videoContainer = videoRef.current
    const audioContainer = audioRef.current

    const attach = (track: any) => {
      if (!track) return
      if (track.kind === 'video' && videoContainer) {
        const el = track.attach()
        el.style.width = '100%'
        el.style.height = '100%'
        el.style.objectFit = 'cover'
        videoContainer.appendChild(el)
      } else if (track.kind === 'audio' && !isLocal && audioContainer) {
        // On ne rejoue jamais l'audio local (évite l'écho)
        audioContainer.appendChild(track.attach())
      }
    }

    const detach = (track: any) => {
      if (!track || typeof track.detach !== 'function') return
      track.detach().forEach((el: HTMLElement) => el.remove())
    }

    participant.tracks.forEach((pub: any) => { if (pub.track) attach(pub.track) })

    const onSub = (track: any) => attach(track)
    const onUnsub = (track: any) => detach(track)
    participant.on('trackSubscribed', onSub)
    participant.on('trackUnsubscribed', onUnsub)

    return () => {
      participant.off('trackSubscribed', onSub)
      participant.off('trackUnsubscribed', onUnsub)
      participant.tracks.forEach((pub: any) => { if (pub.track) detach(pub.track) })
    }
  }, [participant, isLocal])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl bg-black/60 ring-1 ring-white/10',
      isLocal
        ? 'absolute bottom-4 right-4 z-10 h-32 w-24 sm:h-40 sm:w-28 shadow-xl'
        : 'h-full w-full',
    )}>
      <div ref={videoRef} className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
      <div ref={audioRef} className="hidden" />
      <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white/90 drop-shadow">
        {label}
      </span>
    </div>
  )
}

// ─── Avatar central (appel audio ou en attente) ───────────────────────────────────

function CallerCard({
  name, avatar, subtitle,
}: { name: string; avatar?: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-5 text-white">
      <div className="relative">
        <span className="absolute inset-0 -m-3 rounded-full bg-white/10 animate-ping" />
        <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-4xl font-semibold shadow-2xl">
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
  localParticipant, participants,
  isAudioEnabled, isVideoEnabled,
  onAccept, onDecline, onHangup,
  onToggleAudio, onToggleVideo,
}: CallOverlayProps) {
  const remote = participants[0] ?? null
  const showVideoStage = phase === 'active' && mode === 'video'

  const subtitle =
    phase === 'incoming' ? `Appel ${mode === 'video' ? 'vidéo' : 'audio'} entrant…`
    : phase === 'outgoing' ? 'Appel en cours…'
    : remote ? 'Connecté' : 'Connexion…'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gradient-to-b from-[#10141c] to-[#05070b]"
    >
      {/* Scène vidéo ou avatar central */}
      {showVideoStage ? (
        <div className="relative h-full w-full max-w-3xl mx-auto">
          {remote ? (
            <ParticipantTile participant={remote} label={otherName} />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <CallerCard name={otherName} avatar={otherAvatar} subtitle={subtitle} />
            </div>
          )}
          {localParticipant && isVideoEnabled && (
            <ParticipantTile participant={localParticipant} isLocal label="Vous" />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <CallerCard name={otherName} avatar={otherAvatar} subtitle={subtitle} />
          {/* Pistes audio des participants distants (appel audio) */}
          {phase === 'active' && remote && (
            <div className="hidden">
              <ParticipantTile participant={remote} label={otherName} />
            </div>
          )}
        </div>
      )}

      {/* Contrôles */}
      <div className="absolute bottom-0 inset-x-0 pb-10 pt-16 bg-gradient-to-t from-black/60 to-transparent">
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
            <>
              <button
                onClick={onToggleAudio}
                className={cn(
                  'h-13 w-13 h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-colors',
                  isAudioEnabled ? 'bg-white/15 hover:bg-white/25' : 'bg-white/90 text-black',
                )}
                aria-label={isAudioEnabled ? 'Couper le micro' : 'Activer le micro'}
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>

              {mode === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={cn(
                    'h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-colors',
                    isVideoEnabled ? 'bg-white/15 hover:bg-white/25' : 'bg-white/90 text-black',
                  )}
                  aria-label={isVideoEnabled ? 'Couper la caméra' : 'Activer la caméra'}
                >
                  {isVideoEnabled ? <VideoIcon className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </button>
              )}

              <button
                onClick={onHangup}
                className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                aria-label="Raccrocher"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
