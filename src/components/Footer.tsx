'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-14 pt-8 pb-6 border-t border-white/[0.08] text-xs text-[#647f91]">
      {/* Top Row: Brand & Legal Navigation */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6">
        <div className="space-y-2 max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white hover:text-[#00df89] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00df89] rounded-lg"
          >
            <span className="w-7 h-7 rounded-lg bg-[#0c141a] border border-[#00df89]/40 flex items-center justify-center text-[#00df89] font-black text-xs shadow-sm">
              LR
            </span>
            <span className="font-bold text-sm tracking-tight text-white">Lab Running</span>
          </Link>
          <p className="text-xs text-[#7390a1] leading-relaxed">
            {t(
              'Plataforma independiente de fisiología aplicada al running: cálculo de zonas VDOT, calibración local de historial deportivo, rotación de calzado y fuerza concurrente.',
              'Independent running physiology platform: VDOT pace zone modeling, local training history calibration, shoe rotation, and concurrent strength guidance.'
            )}
          </p>
        </div>

        <nav
          aria-label={t('Enlaces legales e institucionales', 'Legal and institutional links')}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#9cb4c4]"
        >
          <Link
            href="/sobre-nosotros"
            className="hover:text-[#00df89] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00df89] rounded px-1 py-0.5"
          >
            {t('Sobre Nosotros & Contacto', 'About Us & Contact')}
          </Link>
          <Link
            href="/privacidad"
            className="hover:text-[#00df89] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00df89] rounded px-1 py-0.5"
          >
            {t('Política de Privacidad', 'Privacy Policy')}
          </Link>
          <Link
            href="/terminos"
            className="hover:text-[#00df89] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00df89] rounded px-1 py-0.5"
          >
            {t('Términos de Servicio', 'Terms of Service')}
          </Link>
        </nav>
      </div>

      {/* Bottom Row: Copyright & Trademark Disclaimer */}
      <div className="pt-5 border-t border-white/[0.06] flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-[11px] text-[#5c7687]">
        <span>
          {t(
            '© 2026 Lab Running. Pensado para entrenar por sensaciones y cuidar tu base aeróbica.',
            '© 2026 Lab Running. Built to train by feel and protect your aerobic base.'
          )}
        </span>
        <span className="lg:text-right leading-relaxed">
          {t(
            'Strava, Garmin y las marcas de calzado citadas son marcas registradas de sus respectivos propietarios. Este sitio es independiente y no está afiliado a ellas.',
            'Strava, Garmin, and cited footwear brands are trademarks of their respective owners. This site is independent and not affiliated with them.'
          )}
        </span>
      </div>
    </footer>
  );
};
