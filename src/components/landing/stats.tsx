'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 130, suffix: '+',  label: 'Artisans certifiés', sublabel: 'Tous validés MEATFP' },
  { value: 9,   suffix: '',   label: 'Centres à Conakry',  sublabel: '5 communes couvertes' },
  { value: 95,  suffix: '%',  label: 'Réduction du délai', sublabel: 'vs téléphone classique' },
  { value: 88,  suffix: '/100', label: 'Score satisfaction',sublabel: 'Note SUS utilisateurs' },
]

function CountUp({ end, suffix, duration = 2 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const startTime = Date.now()
            const tick = () => {
              const elapsed = (Date.now() - startTime) / 1000
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setCount(Math.round(end * eased))
              if (progress < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden">
      {/* Bg gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-700 via-brand-800 to-accent-700" />
      <div className="absolute inset-0 -z-10 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Des chiffres qui parlent.
          </h2>
          <p className="mt-3 text-brand-100">
            Mesures réalisées sur la phase pilote 2026 du programme Allô Maître.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white mb-2">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-semibold text-white text-base sm:text-lg">{stat.label}</div>
              <div className="text-xs text-brand-200 mt-1">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
