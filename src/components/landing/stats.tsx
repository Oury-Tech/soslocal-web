'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 130, suffix: '+',    label: 'Artisans certifiés',  sub: 'Vérifiés et approuvés' },
  { value: 9,   suffix: '',     label: 'Centres à Conakry',   sub: '5 communes couvertes' },
  { value: 95,  suffix: '%',    label: 'Réduction du délai',  sub: 'vs téléphone classique' },
  { value: 88,  suffix: '/100', label: 'Score satisfaction',  sub: 'Note SUS utilisateurs' },
]

function CountUp({ end, suffix, duration = 2 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver((entries) => {
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
    }, { threshold: 0.3 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>
}

export function Stats() {
  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Fond violet-bleu */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(135deg, #171561 0%, #3B37E9 50%, #23208F 100%)' }}
        aria-hidden
      />
      {/* Motif de points subtil */}
      <div
        className="absolute inset-0 -z-10 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
        aria-hidden
      />

      <div className="container-app">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-1.5">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-semibold text-white/90">{stat.label}</div>
              <div className="text-xs text-white/55 mt-1">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
