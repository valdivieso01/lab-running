'use client';

import React from 'react';
import { LegalPageShell } from '@/components/LegalPageShell';
import { useLanguage } from '@/lib/i18n';

export default function SobreNosotrosPage() {
  const { t } = useLanguage();

  return (
    <LegalPageShell
      badgeEs="Institucional"
      badgeEn="About"
      titleEs="Sobre Nosotros & Contacto"
      titleEn="About Us & Contact"
      updatedEs="Proyecto independiente · Actualizado 2026"
      updatedEn="Independent project · Updated 2026"
    >
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('¿Qué es Lab Running?', 'What is Lab Running?')}
        </h2>
        <p>
          {t(
            'Lab Running es una herramienta independiente de análisis y planificación para corredores de calle y trail. Nació con el objetivo de traducir fórmulas fisiológicas complejas en zonas de entrenamiento claras, aplicables por ritmo, frecuencia cardíaca y percepción subjetiva del esfuerzo (RPE).',
            'Lab Running is an independent analysis and training planning tool for road and trail runners. It was created to translate physiological models into clear, actionable training zones by pace, heart rate, and Rating of Perceived Exertion (RPE).'
          )}
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('Metodología Aplicada', 'Applied Methodology')}
        </h2>
        <ul className="list-disc list-inside space-y-2 text-[#9cb4c4]">
          <li>
            <strong className="text-white">Jack Daniels VDOT:</strong>{' '}
            {t(
              'Cálculo del índice de rendimiento aeróbico y distribución de zonas continuas (Z1–Z3) y fraccionadas (Umbral, VO2max y Velocidad).',
              'Calculation of the aerobic performance index and distribution of continuous (Z1–Z3) and interval zones (Threshold, VO2max, and Repetition).'
            )}
          </li>
          <li>
            <strong className="text-white">{t('Proyección Riegel (D^1.06):', 'Riegel Projection (D^1.06):')}</strong>{' '}
            {t(
              'Estimación de equivalencias entre distancias (5K, 10K, 21K y 42K) ajustada por terreno y perfil de desnivel.',
              'Estimation of race equivalences across distances (5K, 10K, Half Marathon, and Marathon) adjusted by terrain and elevation profile.'
            )}
          </li>
          <li>
            <strong className="text-white">{t('Fuerza Concurrente & Calzado:', 'Concurrent Strength & Footwear:')}</strong>{' '}
            {t(
              'Guías de gimnasio basadas en RIR (Repeticiones en Reserva) y criterios de rotación de calzado para reducir el riesgo de sobrecarga.',
              'Gym routines guided by RIR (Reps in Reserve) and shoe rotation principles to help reduce overuse injury risk.'
            )}
          </li>
        </ul>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('El Creador y Misión', 'The Creator & Mission')}
        </h2>
        <p>
          {t(
            <>
              El proyecto fue creado y es mantenido de forma independiente por{' '}
              <strong className="text-white">Javier Valdivieso</strong>, desarrollador de software y corredor. El objetivo es brindar una herramienta seria, clara y basada en evidencia fisiológica, sin ruido ni suscripciones cerradas.
            </>,
            <>
              This project was created and is independently maintained by{' '}
              <strong className="text-white">Javier Valdivieso</strong>, software developer and runner. The goal is to offer a reliable, clear, physiology-driven training tool without clutter or paywalls.
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
          <a
            href="https://github.com/valdivieso01/lab-running"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#101c24] border border-[#182832] hover:border-[#00df89]/40 text-[#9cb4c4] transition-colors"
          >
            GitHub: <span className="text-[#00df89]">valdivieso01/lab-running</span>
          </a>
          <span className="px-3 py-1.5 rounded-lg bg-[#101c24] border border-[#182832] text-[#9cb4c4]">
            {t('Ubicación: Mendoza, Argentina', 'Location: Mendoza, Argentina')}
          </span>
        </div>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('Contacto y Sugerencias', 'Contact & Suggestions')}
        </h2>
        <p>
          {t(
            '¿Encontraste algún error en los cálculos? ¿Tenés sugerencias para el sitio o necesitás reportar un problema de datos o privacidad?',
            'Found a calculation bug? Have suggestions for the site or need to report a data or privacy issue?'
          )}
        </p>
        <p>
          {t('Podés comunicarte por correo electrónico directamente a: ', 'You can reach out directly by email at: ')}
          <a
            href="mailto:hjavier.valdivieso@outlook.es"
            className="text-[#00df89] hover:underline font-semibold"
          >
            hjavier.valdivieso@outlook.es
          </a>
        </p>
      </section>
    </LegalPageShell>
  );
}
