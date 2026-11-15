'use client';

import React from 'react';
import { Activity, Gauge } from 'lucide-react';

interface HeaderProps {
  vdot: number;
  fiveKmFormatted: string;
  rightSlot?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  vdot,
  fiveKmFormatted,
  rightSlot,
}) => {
  return (
    <header className="pb-5 border-b border-white/[0.08]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Brand identity + Title + Telemetry pills */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00df89] animate-pulse" aria-hidden="true" />
              Lab Running
            </span>

            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#9cb4c4]">
                <Gauge className="w-3.5 h-3.5 text-[#00df89]" aria-hidden="true" />
                <span>VDOT</span>
                <strong className="num-telemetry font-bold text-white">{vdot.toFixed(1)}</strong>
              </span>
              <span className="w-px h-3 bg-white/15" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 text-[#9cb4c4]">
                <Activity className="w-3.5 h-3.5 text-[#00df89]" aria-hidden="true" />
                <span>Base 5K</span>
                <strong className="num-telemetry font-bold text-white">{fiveKmFormatted}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Calculadora de Ritmos y Rendimiento
            </h1>
            <p className="text-xs sm:text-sm text-[#8ca4b4] max-w-2xl leading-relaxed">
              Calculá tus zonas fisiológicas exactas, elegí tus zapatillas de competencia y combiná tu entrenamiento de fuerza sin interferir con tu base aeróbica.
            </p>
          </div>
        </div>

        {/* Right: Cloud Sync / Profile Bar */}
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
    </header>
  );
};
