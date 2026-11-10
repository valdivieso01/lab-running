'use client';

import React, { useState } from 'react';
import { Timer, Mountain, Activity, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface HeaderProps {
  vdot: number;
  fiveKmFormatted: string;
  rightSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ rightSlot }) => {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <header className="space-y-4 pb-4 border-b border-[#16232c]">
      {/* Top Bar: Title on Left + User Account Bar on Top-Right */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Calculadora de Ritmos de Running
          </h1>
          <p className="text-sm text-[#8ca4b4] max-w-2xl leading-relaxed">
            Descubrí a qué ritmo exacto correr tus trotes suaves, fondos, series de velocidad y carreras según tu estado físico actual.
          </p>
        </div>

        {rightSlot && <div className="shrink-0 lg:pt-0.5">{rightSlot}</div>}
      </div>

      {/* Collapsible 3-Step "Cómo Usar" Banner RIGHT AT THE TOP */}
      <div className="rounded-2xl bg-[#0c141a] border border-[#182832] overflow-hidden">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#101b23] transition-colors"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00df89]">
            <Sparkles className="w-4 h-4" />
            <span>Cómo usar esta calculadora en 3 pasos</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#6e8a9c]">
            <span>{showGuide ? 'Ocultar guía' : 'Ver guía rápida'}</span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showGuide && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 pt-1 border-t border-[#14222b]">
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
    </header>
  );
};
