'use client';

import React from 'react';
import { LegalPageShell } from '@/components/LegalPageShell';
import { useLanguage } from '@/lib/i18n';

export default function PrivacidadPage() {
  const { t } = useLanguage();

  return (
    <LegalPageShell
      badgeEs="Privacidad"
      badgeEn="Privacy"
      titleEs="Política de Privacidad"
      titleEn="Privacy Policy"
      updatedEs="Última actualización: 2026"
      updatedEn="Last updated: 2026"
    >
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('1. Procesamiento 100% Local de tus Archivos Deportivos', '1. 100% Local Processing of Your Activity Files')}
        </h2>
        <p>
          {t(
            'Los archivos que subís desde Strava o Garmin (.csv, .json, .gpx o .tcx) se leen y analizan exclusivamente en la memoria de tu navegador. Lab Running no sube, almacena ni comparte en servidores externos tus archivos originales, recorridos GPS ni historiales completos de actividades.',
            'Files you upload from Strava or Garmin (.csv, .json, .gpx, or .tcx) are parsed and analyzed exclusively inside your browser memory. Lab Running does not upload, store, or share your raw files, GPS tracks, or full activity histories on external servers.'
          )}
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('2. Almacenamiento Local (localStorage)', '2. Local Browser Storage (localStorage)')}
        </h2>
        <p>
          {t(
            'Para mejorar tu experiencia sin necesidad de crear una cuenta, la aplicación guarda tus preferencias en el almacenamiento local de tu dispositivo (marca 5K de referencia, tipo de terreno, idioma seleccionado y checklist de ejercicios). Podés limpiar estos datos en cualquier momento desde los controles de la app o borrando los datos del sitio en tu navegador.',
            'To remember your preferences without requiring an account, the app stores settings locally on your device (reference 5K mark, terrain type, selected language, and exercise checklists). You can clear this data at any time using the in-app clear controls or your browser site data settings.'
          )}
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-[#0c141a] border border-[#182832] space-y-3">
        <h2 className="text-base font-bold text-white">
          {t('3. Inicio de Sesión Opcional y Sincronización en la Nube', '3. Optional Sign-In & Cloud Sync')}
        </h2>
        <p>
          {t(
            'Si elegís iniciar sesión voluntariamente con Google mediante Firebase Authentication, únicamente se sincronizan en Cloud Firestore los datos necesarios para tu perfil de entrenamiento: nombre/correo de tu cuenta Google, tu marca de referencia 5K, configuración de terreno/calibración y los hitos de evolución VDOT que decidas guardar.',
            'If you voluntarily choose to sign in with Google via Firebase Authentication, only the data required for your training profile is synced to Cloud Firestore: your Google display name/email, reference 5K time, terrain/calibration settings, and any VDOT progress snapshots you explicitly save.'
          )}
        </p>
        <p>
          {t(
            'Cada usuario solo tiene acceso de lectura y escritura sobre su propio documento mediante reglas de seguridad de Firestore. No vendemos ni cedemos datos a terceros.',
            'Each user only has read and write access to their own document enforced by Firestore Security Rules. We never sell or share your data with third parties.'
          )}
        </p>
      </section>
    </LegalPageShell>
  );
}
