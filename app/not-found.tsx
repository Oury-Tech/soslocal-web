import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 mesh-bg">
      <div className="text-center max-w-md">
        <Logo size="lg" />
        <h1 className="mt-8 font-display text-7xl sm:text-8xl font-extrabold gradient-text-animated">
          404
        </h1>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold">Page introuvable</h2>
        <p className="mt-3 text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="accent" size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
