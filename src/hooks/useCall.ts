'use client'

/**
 * useCall — gestion d'un appel audio/vidéo Twilio Video côté navigateur.
 *
 * La *signalisation* (invitation / acceptation / refus / fin) passe par le
 * WebSocket de chat existant (cf. app/(dashboard)/chat/[roomId]/page.tsx).
 * Ce hook ne s'occupe QUE de la connexion média Twilio : récupération du jeton
 * via /calls/token, connexion à la salle, gestion des pistes locales/distantes,
 * micro & caméra, et déconnexion propre.
 */

import { useCallback, useRef, useState } from 'react'
import {
  connect as twilioConnect,
  LocalVideoTrack,
  LocalAudioTrack,
  type Room,
  type RemoteParticipant,
} from 'twilio-video'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'

export type CallStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface ConnectArgs {
  /** ChatRoom.id — sert à demander un jeton au backend. */
  roomId: number
  /** true = appel vidéo (caméra + micro) ; false = appel audio (micro seul). */
  video: boolean
}

export function useCall() {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [participants, setParticipants] = useState<RemoteParticipant[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  const roomRef = useRef<Room | null>(null)

  const handleParticipantConnected = useCallback((p: RemoteParticipant) => {
    setParticipants((prev) => (prev.find((x) => x.sid === p.sid) ? prev : [...prev, p]))
  }, [])

  const handleParticipantDisconnected = useCallback((p: RemoteParticipant) => {
    setParticipants((prev) => prev.filter((x) => x.sid !== p.sid))
  }, [])

  const disconnect = useCallback(() => {
    const room = roomRef.current
    if (room) {
      try {
        room.localParticipant.tracks.forEach((pub) => {
          const track = pub.track
          if (track && (track.kind === 'audio' || track.kind === 'video')) {
            ;(track as LocalAudioTrack | LocalVideoTrack).stop()
          }
        })
        room.disconnect()
      } catch {
        /* noop */
      }
    }
    roomRef.current = null
    setParticipants([])
    setStatus('idle')
    setIsAudioEnabled(true)
    setIsVideoEnabled(true)
  }, [])

  const connect = useCallback(async ({ roomId, video }: ConnectArgs): Promise<boolean> => {
    setStatus('connecting')
    try {
      const { data } = await apiClient.post<{ token: string; room_name: string }>(
        API.CALLS_TOKEN,
        { room_id: roomId },
      )

      const room = await twilioConnect(data.token, {
        name: data.room_name,
        audio: true,
        video: video ? { width: 640, height: 480 } : false,
      })

      roomRef.current = room
      setIsVideoEnabled(video)

      // Participants déjà présents
      room.participants.forEach(handleParticipantConnected)
      room.on('participantConnected', handleParticipantConnected)
      room.on('participantDisconnected', handleParticipantDisconnected)
      room.on('disconnected', () => {
        room.off('participantConnected', handleParticipantConnected)
        room.off('participantDisconnected', handleParticipantDisconnected)
      })

      setStatus('connected')
      return true
    } catch (err) {
      console.error('[useCall] connexion échouée :', err)
      setStatus('error')
      roomRef.current = null
      return false
    }
  }, [handleParticipantConnected, handleParticipantDisconnected])

  const toggleAudio = useCallback(() => {
    const room = roomRef.current
    if (!room) return
    room.localParticipant.audioTracks.forEach((pub) => {
      if (pub.track.isEnabled) pub.track.disable()
      else pub.track.enable()
    })
    setIsAudioEnabled((v) => !v)
  }, [])

  const toggleVideo = useCallback(() => {
    const room = roomRef.current
    if (!room) return
    room.localParticipant.videoTracks.forEach((pub) => {
      if (pub.track.isEnabled) pub.track.disable()
      else pub.track.enable()
    })
    setIsVideoEnabled((v) => !v)
  }, [])

  return {
    status,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    localParticipant: roomRef.current?.localParticipant ?? null,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
  }
}
