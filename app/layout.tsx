import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL('https://soslocal.gn'),
  title: {
    default: 'SOSLocal — Dépannage géolocalisé en Guinée',
    template: '%s · SOSLocal',
  },
  description:
    "Plateforme de dépannage géolocalisé en temps réel. Trouvez un artisan certifié près de chez vous en quelques secondes. Plombier, électricien, mécanicien à Conakry.",
  keywords: ['SOSLocal', 'Guinée', 'Conakry', 'dépannage', 'artisans', 'plombier', 'électricien', 'géolocalisation', 'mobile money'],
  authors: [{ name: 'Mamadou Oury Diallo', url: 'mailto:ourying2003@gmail.com' }],
  creator: 'Mamadou Oury Diallo',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_GN',
    url: 'https://soslocal.gn',
    siteName: 'SOSLocal',
    title: 'SOSLocal — Dépannage géolocalisé en Guinée',
    description: 'Trouvez un artisan certifié près de chez vous, en quelques secondes.',
    images: [{ url: '/logo.png', width: 1900, height: 1900, alt: 'SOSLocal' }],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#080e1b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors closeButton theme="system" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
