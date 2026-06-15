import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

/** Coquille des pages publiques (catalogue, artisans) : en-tête + pied de page. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
    </>
  )
}
