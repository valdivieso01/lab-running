'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Footer } from '@/components/Footer';

interface LegalPageShellProps {
  badgeEs: string;
  badgeEn: string;
  titleEs: string;
  titleEn: string;
  updatedEs: string;
  updatedEn: string;
  children: React.ReactNode;
}

export const LegalPageShell: React.FC<LegalPageShellProps> = ({
  badgeEs,
  badgeEn,
  titleEs,
  titleEn,
  updatedEs,
  updatedEn,
  children,
}) => {
  const { lang, setLang, t } = useLanguage();

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col justify-between">
      <div>
        {/* Top Bar: Back to Lab + Language Switcher */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c141a] hover:bg-[#101c24] border border-[#182832] hover:border-[#00df89]/40 text-xs font-semibold text-[#9cb4c4] hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00df89]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00df89]" />
            <span>{t('Volver a Lab Running', 'Back to Lab Running')}</span>
          </Link>

          <div
            className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/90 p-0.5 text-[11px] font-semibold"
            role="group"
            aria-label="Language switcher"
          >
            <button
              type="button"
              onClick={() => setLang('es')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                lang === 'es'
                  ? 'bg-[#00df89] text-[#070c0f]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#00df89] text-[#070c0f]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Page Header */}
        <header className="pt-8 pb-6 space-y-2.5">
          <span className="inline-block px-2.5 py-1 rounded-full bg-[#00df89]/10 border border-[#00df89]/30 text-[#00df89] text-[11px] font-semibold tracking-wide uppercase">
            {t(badgeEs, badgeEn)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t(titleEs, titleEn)}
          </h1>
          <p className="text-xs text-[#647f91]">
            {t(updatedEs, updatedEn)}
          </p>
        </header>

        {/* Body Content */}
        <article className="space-y-6 text-sm text-[#a3b8c6] leading-relaxed">
          {children}
        </article>
      </div>

      <Footer />
    </main>
  );
};
