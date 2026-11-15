import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { LanguageProvider } from '@/lib/i18n';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lab-running.vercel.app'),
  title: 'Lab Running | Calculadora de Ritmos, Zapatillas y Fuerza para Corredores (VDOT & Strava)',
  description:
    'Calculá tus ritmos exactos de Zona 2, fondos, series y carreras (5K a 42K) con Jack Daniels VDOT y Strava. Encontrá tus zapatillas de running ideales y rutinas de fuerza/gimnasio.',
  keywords: [
    'calculadora de ritmos running',
    'a que ritmo correr',
    'ritmo zona 2 running',
    'series running calculadora',
    'jack daniels vdot calculadora',
    'analizar strava running',
    'calculadora maraton media maraton 10k 5k',
    'zapatillas de running recomendadas',
    'mejores zapatillas maraton',
    'zapatillas asics adidas nike saucony new balance',
    'fuerza para corredores gimnasio',
    'rutina gym running',
    'ejercicios soleo running',
    'hipertrofia para corredores',
    'lab running',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lab Running | Calculadora de Ritmos, Zapatillas y Guías de Gimnasio',
    description:
      'Descubrí tus ritmos de carrera (Zona 2, Umbral, Series), elegí tus zapatillas con nuestro comparador y potenciá tu musculación con rutinas para corredores.',
    url: 'https://lab-running.vercel.app',
    siteName: 'Lab Running',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lab Running | Ritmos, Zapatillas y Fuerza para Corredores',
    description:
      'Calculadora científica de ritmos VDOT, comparador de zapatillas de running y rutinas de fuerza concurrentes.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lab Running',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebApplication',
                  '@id': 'https://lab-running.vercel.app/#app',
                  name: 'Lab Running',
                  url: 'https://lab-running.vercel.app',
                  applicationCategory: 'HealthAndFitnessApplication',
                  operatingSystem: 'All',
                  browserRequirements: 'Requires JavaScript. Requires HTML5.',
                  description:
                    'Calculadora científica de ritmos de running (VDOT Jack Daniels), asesor de zapatillas de running y guías de gimnasio y fuerza para corredores.',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                  inLanguage: 'es',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-[#059669] selection:text-white">
        <LanguageProvider>
          {children}
          <PWAInstallPrompt />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
