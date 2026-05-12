'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star, MapPin, Wrench, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Animated mesh background */}
      <div className="absolute inset-0 -z-10 mesh-bg" aria-hidden />

      {/* Animated blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-500/20 dark:bg-brand-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob" aria-hidden />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-accent-500/20 dark:bg-accent-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" aria-hidden />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" aria-hidden />

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT — Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge officiel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <Badge variant="accent" className="px-3 py-1.5 text-sm font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Programme Allô Maître · MEATFP Guinée
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight text-balance"
            >
              Un dépannage <br className="hidden sm:block" />
              <span className="gradient-text-animated">en quelques secondes,</span><br className="hidden sm:block" />
              partout à Conakry.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Plomberie, électricité, mécanique, menuiserie… Trouvez instantanément l'artisan
              certifié <strong className="text-foreground">Allô Maître</strong> le plus proche, suivez son arrivée
              en temps réel et payez via Mobile Money en toute sérénité.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link href="/register">
                <Button variant="accent" size="lg" className="group w-full sm:w-auto shadow-glow-lg">
                  Commencer gratuitement
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Voir la démo
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>
                  <strong className="text-foreground">130+</strong> artisans certifiés
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span><strong className="text-foreground">4.8/5</strong> satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span><strong className="text-foreground">9 centres</strong> à Conakry</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main phone mockup */}
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 -m-4 bg-gradient-to-br from-brand-500/30 via-accent-500/30 to-purple-500/30 rounded-[3rem] blur-3xl opacity-60 animate-pulse" />
              <div className="relative card overflow-hidden p-6 lg:p-8 shadow-soft-lg animate-float">
                {/* Map simulation */}
                <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/50 dark:to-accent-900/50">
                  {/* Grid pattern */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, rgb(var(--border)) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />

                  {/* Map "streets" */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 320" fill="none" aria-hidden>
                    <path d="M 0 80 Q 100 90, 200 60 T 400 100" stroke="currentColor" strokeWidth="2" className="text-border" />
                    <path d="M 0 200 Q 150 180, 300 220 T 400 200" stroke="currentColor" strokeWidth="2" className="text-border" />
                    <path d="M 80 0 Q 90 100, 60 200 T 120 320" stroke="currentColor" strokeWidth="2" className="text-border" />
                    <path d="M 280 0 Q 290 100, 320 200 T 280 320" stroke="currentColor" strokeWidth="2" className="text-border" />
                  </svg>

                  {/* Center pin (user) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 -m-4 bg-brand-500 rounded-full opacity-30 animate-ping" />
                      <div className="relative h-10 w-10 rounded-full bg-brand-700 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Artisan pins */}
                  {[
                    { x: '20%', y: '25%', label: 'Plombier', delay: 0 },
                    { x: '75%', y: '30%', label: 'Électricien', delay: 0.2 },
                    { x: '30%', y: '70%', label: 'Mécanicien', delay: 0.4 },
                    { x: '80%', y: '75%', label: 'Menuisier', delay: 0.6 },
                  ].map((pin, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + pin.delay, type: 'spring', stiffness: 300 }}
                      className="absolute group cursor-pointer"
                      style={{ left: pin.x, top: pin.y }}
                    >
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-accent-600 ring-3 ring-white dark:ring-slate-900 flex items-center justify-center shadow-glow">
                          <Wrench className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-card border border-border text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-soft">
                          {pin.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Card with artisan info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-4 p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center text-white font-bold">
                      MK
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">Mohamed Keita</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        4.9 · Plombier · 1.2 km
                      </div>
                    </div>
                    <Badge variant="success" className="flex-shrink-0">
                      <Zap className="h-3 w-3" />
                      8 min
                    </Badge>
                  </div>
                </motion.div>
              </div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -right-4 top-12 sm:-right-12 sm:top-20 card p-3 max-w-xs shadow-soft-lg animate-float animation-delay-1000 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Mission acceptée !</div>
                    <div className="text-xs text-muted-foreground">Arrivée dans ~8 min</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="absolute -left-4 bottom-16 sm:-left-12 card p-4 shadow-soft-lg hidden sm:block"
              >
                <div className="text-xs text-muted-foreground">Délai moyen</div>
                <div className="text-2xl font-bold gradient-text">~30s</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">↓ 95% vs téléphone</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
