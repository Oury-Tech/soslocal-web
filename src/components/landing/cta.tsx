'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 lg:py-32 bg-[rgb(var(--card))]">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2rem] p-8 sm:p-12 lg:p-20 text-center shadow-2xl shadow-brand-500/20"
          style={{ background: 'linear-gradient(135deg, #0B0A34 0%, #3B37E9 50%, #171561 100%)' }}
        >
          {/* Halo lumineux */}
          <div
            className="absolute -top-1/2 left-1/2 -translate-x-1/2 h-[120%] w-[60%] rounded-full opacity-20 blur-3xl pointer-events-none animate-blob"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent 70%)' }}
            aria-hidden
          />
          {/* Motif de fond */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
            aria-hidden
          />

          <div className="relative max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-sm font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Inscription gratuite en 30 secondes
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Prêt à trouver votre artisan <br className="hidden sm:block" />de confiance ?
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed">
              Rejoignez les bénéficiaires et artisans certifiés qui utilisent déjà SOSLocal
              pour transformer leurs services techniques au quotidien.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <span className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-lg">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="#features">
                <span className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  En savoir plus
                </span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-white/55">
              <span>✓ Aucune carte bancaire requise</span>
              <span>✓ Artisans vérifiés et approuvés</span>
              <span>✓ Support 7j/7 en français</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
