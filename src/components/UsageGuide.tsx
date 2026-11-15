'use client';

import React, { useState } from 'react';
import { Timer, Mountain, Activity, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface UsageGuideProps {
  defaultOpen?: boolean;
}

export const UsageGuide: React.FC<UsageGuideProps> = ({ defaultOpen = false }) => {
  const { t } = useLanguage();
  const [showGuide, setShowGuide] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        aria-expanded={showGuide}
        className="w-full px-4 sm:px-5 py-2.5 flex items-center justify-between text-left hover:bg-zinc-800/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>{t('Cómo usar esta calculadora en 3 pasos', 'How to use this calculator in 3 steps')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>{showGuide ? t('Ocultar guía', 'Hide guide') : t('Ver guía rápida', 'Quick guide')}</span>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {showGuide && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 pt-3 border-t border-zinc-800">
          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 num-telemetry font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                {t('Ingresá tu referencia de 5K', 'Enter your 5K benchmark')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Poné el tiempo de tu último test o carrera de 5 km. Si usás Strava o Garmin, podés subir tu historial para detectarlo automático.',
                  'Enter your latest 5K time trial or race time. If you use Strava or Garmin, upload your export for automatic calibration.'
                )}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 num-telemetry font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                {t('Elegí dónde entrenás', 'Pick your training terrain')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Correr en tierra o montaña requiere más esfuerzo que en asfalto. Seleccioná tu terreno para adaptar los ritmos sin pasarte de rosca.',
                  'Running on dirt or trail demands more effort than road. Select your terrain to adjust paces while keeping the same physiological effort.'
                )}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 num-telemetry font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                {t('Entrená en la zona correcta', 'Train in the right zone')}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Hacé el 80% de tu semana en Z2 Suave (pudiendo charlar), y reservá los ritmos fuertes solo para tus días de series o tempo.',
                  'Spend 80% of your week in Easy Z2 (conversational pace), and save hard efforts for your interval or tempo days.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
