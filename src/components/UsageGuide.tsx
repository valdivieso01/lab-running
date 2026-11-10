'use client';

import React, { useState } from 'react';
import { Timer, Mountain, Activity, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface UsageGuideProps {
  defaultOpen?: boolean;
}

export const UsageGuide: React.FC<UsageGuideProps> = ({ defaultOpen = false }) => {
  const [showGuide, setShowGuide] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-[#0c141a] border border-[#182832] overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#101b23] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00df89]">
          <Sparkles className="w-4 h-4" />
          <span>Cómo usar esta calculadora en 3 pasos</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#6e8a9c]">
          <span>{showGuide ? 'Ocultar guía' : 'Ver guía rápida'}</span>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {showGuide && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 pt-2 border-t border-[#14222b]">
          <div className="p-3.5 rounded-xl bg-[#0f1920] border border-[#192934] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#00df89]/15 text-[#00df89] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#00df89]" />
                Ingresá tu referencia de 5K
              </div>
              <p className="text-xs text-[#7d98a8] leading-relaxed">
                Poné el tiempo de tu último test o carrera de 5 km a la izquierda. Si usás Strava, podés subir tu historial para que lo detectemos solo.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0f1920] border border-[#192934] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#00df89]/15 text-[#00df89] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-[#00df89]" />
                Elegí dónde entrenás
              </div>
              <p className="text-xs text-[#7d98a8] leading-relaxed">
                Correr en tierra o montaña requiere más esfuerzo que en asfalto. Seleccioná tu terreno para adaptar los ritmos sin pasarte de rosca.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0f1920] border border-[#192934] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#00df89]/15 text-[#00df89] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00df89]" />
                Entrená en la zona correcta
              </div>
              <p className="text-xs text-[#7d98a8] leading-relaxed">
                Hacé el 80% de tu semana en <strong className="text-white">Z2 Suave</strong> (pudiendo charlar), y reservá los ritmos fuertes solo para tus días de series o tempo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
