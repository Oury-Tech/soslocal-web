import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { Audience } from '@/components/landing/audience'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Audience />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
