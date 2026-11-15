'use client';

import React from 'react';
import { LegalPageShell } from '@/components/LegalPageShell';
import { useLanguage } from '@/lib/i18n';

export default function TerminosPage() {
  const { t } = useLanguage();

  return (
    <LegalPageShell
      badgeEs="Legal"
      badgeEn="Legal"
      titleEs="Términos de Servicio"
      titleEn="Terms of Service"
      updatedEs="Última actualización: 2026"
      updatedEn="Last updated: 2026"
    >
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('1. Carácter Informativo y Descargo de Responsabilidad Médica', '1. Informational Purpose & Medical Disclaimer')}
        </h2>
        <p>
          {t(
            'Los cálculos de VDOT, zonas de ritmo, frecuencias cardíacas estimadas, recomendaciones de calzado y rutinas de fuerza ofrecidos en Lab Running tienen fines exclusivamente informativos y orientativos.',
            'VDOT calculations, pace zones, estimated heart rate ranges, footwear suggestions, and strength routines provided by Lab Running are for informational and educational purposes only.'
          )}
        </p>
        <p>
          {t(
            'Esta herramienta no constituye asesoramiento médico, diagnóstico ni prescripción clínica, y no sustituye el criterio de un médico deportólogo, fisioterapeuta o entrenador certificado. Antes de iniciar o intensificar cualquier programa de entrenamiento físico, consultá con un profesional de la salud.',
            'This tool does not constitute medical advice, diagnosis, or clinical prescription, and does not replace a sports physician, physical therapist, or certified running coach. Always consult a qualified healthcare professional before starting or intensifying any exercise program.'
          )}
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('2. Uso de la Plataforma', '2. Use of the Platform')}
        </h2>
        <p>
          {t(
            'Lab Running se ofrece de forma gratuita "tal cual" ("as is"), sin garantías de disponibilidad continua ni exactitud absoluta frente a condiciones externas como clima, altitud, fatiga acumulada o estado de salud individual.',
            'Lab Running is provided free of charge on an "as is" basis, without warranties of uninterrupted availability or absolute accuracy under external variables such as weather, altitude, accumulated fatigue, or individual health.'
          )}
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('3. Marcas Registradas y Propiedad Intelectual', '3. Trademarks & Intellectual Property')}
        </h2>
        <p>
          {t(
            'Strava, Garmin y las marcas comerciales de calzado deportivo, relojes GPS y nutrición mencionadas en el catálogo pertenecen a sus respectivos titulares. Lab Running es un proyecto independiente sin afiliación, patrocinio ni respaldo oficial de dichas compañías.',
            'Strava, Garmin, and all footwear, GPS watch, and nutrition brand names referenced in the catalog belong to their respective trademark owners. Lab Running is an independent project with no affiliation, sponsorship, or official endorsement from those companies.'
          )}
        </p>
      </section>
    </LegalPageShell>
  );
}
