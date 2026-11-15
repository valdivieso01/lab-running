'use client';

import React, { useMemo } from 'react';

interface HeaderProps {
  vdot: number;
  fiveKmFormatted: string;
  rightSlot?: React.ReactNode;
}

function computeFiveKmPace(fiveKmFormatted: string): string {
  const parts = fiveKmFormatted.split(':').map(Number);
  if (parts.length !== 2 || parts.some(Number.isNaN)) return '--:--';
  const totalSec = parts[0] * 60 + parts[1];
  const paceSec = Math.round(totalSec / 5);
  const mins = Math.floor(paceSec / 60);
  const secs = paceSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const Header: React.FC<HeaderProps> = ({
  vdot,
  fiveKmFormatted,
  rightSlot,
}) => {
  const pacePerKm = useMemo(
    () => computeFiveKmPace(fiveKmFormatted),
    [fiveKmFormatted]
  );

  return (
    <header className="relative rounded-2xl border border-zinc-800/90 bg-zinc-950/90 hero-grid-bg px-5 sm:px-8 py-6 sm:py-8">
      {/* Clipped background glow layer so dropdowns in top bar are never clipped */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden" aria-hidden="true">
        <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-emerald-500/[0.06] blur-3xl" />
      </div>

      {/* Top Row: Lab Micro-Kicker + CloudSyncBar (z-30 so dropdowns sit above Hero dial) */}
      <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6">
        <div className="inline-flex items-center gap-2 text-[11px] num-telemetry uppercase tracking-[0.18em] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" aria-hidden="true" />
          <span className="text-emerald-400 font-semibold">Running Performance Lab</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">Lab Running</span>
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {/* Hero Split: Editorial Headline (Left) + Orbital Performance Dial (Right) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Editorial Copy */}
        <div className="lg:col-span-7 space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-extrabold tracking-tight leading-[1.02] text-zinc-50">
            <span className="block">Tu ritmo.</span>
            <span className="block mt-1">
              <span className="text-outline-hero">Tu propia </span>
              <span className="text-emerald-400">marca.</span>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            Convertí cada carrera en una señal. Encontrá el esfuerzo que te hace mejorar, sin correr a ciegas.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>Marca de referencia 5K:</span>
              <strong className="num-telemetry font-bold text-zinc-50">{fiveKmFormatted}</strong>
            </span>
          </div>
        </div>

        {/* Right: Orbital Performance Index Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center py-2">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* Outer concentric rings */}
            <div className="absolute inset-0 rounded-full border border-zinc-800/80" aria-hidden="true" />
            <div className="absolute inset-4 rounded-full border border-zinc-800/60" aria-hidden="true" />
            <div className="absolute inset-8 rounded-full border border-emerald-500/15" aria-hidden="true" />

            {/* Top dot indicator */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
              aria-hidden="true"
            />

            {/* Floating Chip Top-Right: VO2 */}
            <div className="absolute -right-2 sm:-right-4 top-8 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-800 shadow-lg text-[11px] num-telemetry">
              <span className="text-zinc-400">VO₂ </span>
              <strong className="text-emerald-400">{vdot.toFixed(1)}</strong>
            </div>

            {/* Floating Chip Bottom-Left: PACE */}
            <div className="absolute -left-2 sm:-left-4 bottom-8 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-800 shadow-lg text-[11px] num-telemetry">
              <span className="text-zinc-400">PACE </span>
              <strong className="text-emerald-400">{pacePerKm}</strong>
            </div>

            {/* Center Telemetry */}
            <div className="text-center space-y-1">
              <div className="text-[10px] num-telemetry uppercase tracking-[0.2em] text-zinc-500">
                Índice de Rendimiento
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-[3.5rem] font-extrabold num-telemetry tracking-tight text-zinc-50 leading-none">
                  {vdot.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-emerald-400 num-telemetry">
                  V
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 pt-1">
                Jack Daniels VDOT
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] num-telemetry uppercase tracking-[0.18em] text-zinc-500">
            <span className="w-6 h-px bg-zinc-800" aria-hidden="true" />
            <span>Calibrado con tu carrera</span>
            <span className="w-6 h-px bg-zinc-800" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
};
