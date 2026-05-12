'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-accent-700 p-8 sm:p-12 lg:p-16 shadow-soft-lg"
        >
          {/* Decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-400/30 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-400/30 rounded-full filter blur-3xl animate-blob animation-delay-2000" />

          {/* Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <div className="relative text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              Inscription gratuite en 30 secondes
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight text-balance">
              Prêt à révolutionner vos services techniques ?
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-brand-100 leading-relaxed text-balance">
              Rejoignez les centaines de bénéficiaires et d'artisans certifiés qui utilisent
              déjà SOSLocal pour transformer leurs interactions au quotidien.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group bg-white text-brand-800 hover:bg-brand-50 shadow-soft-lg w-full sm:w-auto"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto"
                >
                  En savoir plus
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-brand-100">
              <div className="flex items-center gap-1.5">
                <span className="text-accent-300">✓</span>
                <span>Aucune carte bancaire requise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-300">✓</span>
                <span>Validation MEATFP officielle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-300">✓</span>
                <span>Support 7j/7 en français</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
