'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

/**
 * Bandeau d'annonce — fin, pleine largeur, fond navy (aplat, sans dégradé).
 * Inspiré du shot Springfield : accroche produit + lien discret à droite.
 */
export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#0B1A33] text-white">
      <div className="container-app flex items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-[13px] flex-wrap">
        <span className="inline-flex items-center gap-2 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-accent-400" aria-hidden />
          Nouveau — suivez l'arrivée de votre artisan en temps réel sur la carte
        </span>
        <Link
          href="#how-it-works"
          className="inline-flex items-center gap-1 font-semibold text-accent-300 hover:text-white transition-colors"
        >
          Découvrir
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
