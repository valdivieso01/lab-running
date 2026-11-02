import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'Lab Running | Calculadora de Ritmos, Series, Zona 2 y Strava (VDOT)',
  description:
    'Calculá a qué ritmo exacto correr tus rodajes suaves en Zona 2, fondos, series de velocidad (VO2Max) y carreras de 5K a 42K con Jack Daniels VDOT, Riegel y calibración real de tu Strava.',
  keywords: [
    'calculadora de ritmos running',
    'a que ritmo correr',
    'ritmo zona 2 running',
    'series running calculadora',
    'jack daniels vdot calculadora',
    'analizar strava running',
    'calculadora maraton media maraton 10k 5k',
    'lab running',
  ],
  openGraph: {
    title: 'Lab Running | Calculadora de Ritmos de Running & Strava Lab',
    description:
      'Descubrí tus ritmos exactos de Zona 2, Umbral, Series y Carreras con test de 5K o calibrando tu historial de Strava.',
    type: 'website',
    locale: 'es_AR',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lab Running',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#070c0f',
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
    <html lang="es" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-[#070c0f] text-[#e6edf3] font-sans antialiased selection:bg-[#00df89] selection:text-[#051a11]">
        {children}
        <PWAInstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
