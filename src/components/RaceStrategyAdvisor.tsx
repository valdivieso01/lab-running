'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Flag,
  Timer,
  TrendingDown,
  Sparkles,
  Zap,
  Droplets,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  RotateCcw,
  Info,
} from 'lucide-react';
import { formatTime, StravaCalibration, TerrainType, riegelPace } from '@/lib/calculator';
import {
  RACE_DISTANCES,
  STRATEGY_OPTIONS,
  RaceDistance,
  StrategyType,
  calculateRaceSplits,
  SplitCheckpoint,
} from '@/lib/pacingStrategy';
import { useLanguage } from '@/lib/i18n';

interface RaceStrategyAdvisorProps {
  fiveKmSeconds: number;
  terrainType: TerrainType;
  calibration?: StravaCalibration | null;
}

export const RaceStrategyAdvisor: React.FC<RaceStrategyAdvisorProps> = ({
  fiveKmSeconds,
  terrainType,
  calibration,
}) => {
  const { t } = useLanguage();

  const [selectedDistance, setSelectedDistance] = useState<RaceDistance>('21k');
  const [strategy, setStrategy] = useState<StrategyType>('negative');
  const [granularity, setGranularity] = useState<'every-km' | 'milestones'>('every-km');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [customTargetSeconds, setCustomTargetSeconds] = useState<Record<RaceDistance, number | null>>({
    '5k': null,
    '10k': null,
    '21k': null,
    '42k': null,
  });

  const riegelExp = calibration?.personalRiegelExponent ?? 1.06;

  // Calculate default predicted target times for all distances
  const defaultTimes = useMemo(() => {
    const calcTime = (distMeters: number) => {
      const paceSec = riegelPace(fiveKmSeconds, 5000, distMeters, riegelExp);
      return Math.round(paceSec * (distMeters / 1000));
    };

    return {
      '5k': fiveKmSeconds,
      '10k': calcTime(10000),
      '21k': calcTime(21097.5),
      '42k': calcTime(42195),
    };
  }, [fiveKmSeconds, riegelExp]);

  const activeDistanceConfig = useMemo(
    () => RACE_DISTANCES.find((d) => d.id === selectedDistance) || RACE_DISTANCES[2],
    [selectedDistance]
  );

  const activeTargetSeconds = useMemo(() => {
    return customTargetSeconds[selectedDistance] ?? defaultTimes[selectedDistance];
  }, [customTargetSeconds, selectedDistance, defaultTimes]);

  const avgPaceSeconds = useMemo(() => {
    return activeTargetSeconds / activeDistanceConfig.distanceKm;
  }, [activeTargetSeconds, activeDistanceConfig.distanceKm]);

  const splits = useMemo(() => {
    return calculateRaceSplits(
      activeDistanceConfig.distanceKm,
      activeTargetSeconds,
      strategy,
      granularity
    );
  }, [activeDistanceConfig.distanceKm, activeTargetSeconds, strategy, granularity]);

  const handleAdjustMinutes = useCallback(
    (deltaMinutes: number) => {
      setCustomTargetSeconds((prev) => {
        const current = prev[selectedDistance] ?? defaultTimes[selectedDistance];
        const next = Math.max(60, current + deltaMinutes * 60);
        return { ...prev, [selectedDistance]: next };
      });
    },
    [selectedDistance, defaultTimes]
  );

  const handleResetTargetTime = useCallback(() => {
    setCustomTargetSeconds((prev) => ({
      ...prev,
      [selectedDistance]: null,
    }));
  }, [selectedDistance]);

  const handleCopyWhatsApp = useCallback(() => {
    const strategyObj = STRATEGY_OPTIONS.find((s) => s.id === strategy);
    const distanceName = t(activeDistanceConfig.name, activeDistanceConfig.nameEn);
    const strategyName = t(strategyObj?.nameEs || '', strategyObj?.nameEn || '');

    const lines: string[] = [
      `🏁 *ESTRATEGIA DE CARRERA — ${distanceName.toUpperCase()}*`,
      `⏱️ Objetivo: *${formatTime(activeTargetSeconds, activeDistanceConfig.distanceKm >= 21)}* (Ritmo prom: *${formatTime(avgPaceSeconds)}/km*)`,
      `🎯 Táctica: *${strategyName}*`,
      '',
      '📋 *Parciales de Paso (Splits):*',
    ];

    splits.forEach((s) => {
      const nutrition = s.nutritionCueEs ? ` [${t(s.nutritionCueEs, s.nutritionCueEn || '')}]` : '';
      lines.push(`• *${s.label}*: ${s.elapsedTimeFormatted} (tramo a ${s.segmentPaceFormatted}/km)${nutrition}`);
    });

    lines.push('');
    lines.push('⚡ _Generado con Lab Running — Tu ritmo. Tu propia marca._');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  }, [activeDistanceConfig, activeTargetSeconds, avgPaceSeconds, splits, strategy, t]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Card */}
      <div className="lab-panel p-5 sm:p-6 rounded-2xl relative overflow-hidden space-y-4">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Flag className="w-3.5 h-3.5" />
              <span>{t('Táctica de Pacing & Pulsera de Carrera', 'Race Pacing Tactic & Pace Band')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {t('Estrategia de Ritmo y Parciales de Carrera', 'Race Strategy & Split Times Calculator')}
            </h2>
            <p className="text-xs sm:text-sm text-[#8ca4b4] max-w-2xl leading-relaxed">
              {t(
                'Planificá cómo dosificar la energía en tu carrera objetivo. Un parcial negativo controlado te protege del muro y optimiza tus reservas de glucógeno.',
                'Plan how to meter your energy in your target race. A controlled negative split shields you from the wall and optimizes glycogen stores.'
              )}
            </p>
          </div>

          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {copiedWhatsApp ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('¡Copiado para WhatsApp!', 'Copied to WhatsApp!')}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>{t('Compartir Estrategia', 'Share Strategy')}</span>
              </>
            )}
          </button>
        </div>

        {/* 1. Distance Selector */}
        <div className="pt-2 border-t border-[#14222b] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#637d8e] flex items-center gap-1.5">
            <Timer className="w-3 h-3 text-emerald-400" />
            <span>{t('Elegí la Distancia de Carrera:', 'Select Race Distance:')}</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RACE_DISTANCES.map((dist) => {
              const isSelected = dist.id === selectedDistance;
              const timeSec = customTargetSeconds[dist.id] ?? defaultTimes[dist.id];
              const paceSec = timeSec / dist.distanceKm;

              return (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => setSelectedDistance(dist.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#102029] border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-zinc-900 border-zinc-800 hover:border-[#223949] hover:bg-[#0f1921]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {t(dist.name, dist.nameEn)}
                    </span>
                    <span className="text-[10px] font-mono text-[#718a99]">{dist.label}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {formatTime(timeSec, dist.distanceKm >= 21)}
                  </div>
                  <div className="text-[11px] font-mono text-[#5b788a] mt-0.5">
                    ~{formatTime(paceSec)}/km
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Target Time Customizer */}
        <div className="p-3.5 rounded-xl bg-[#0b1419] border border-[#162935] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {t('Tiempo Objetivo para', 'Target Goal for')}{' '}
                <strong className="text-emerald-400">{t(activeDistanceConfig.name, activeDistanceConfig.nameEn)}</strong>
              </span>
            </div>
            <p className="text-[11px] text-[#718a99]">
              {t(
                'Estimado según tu VDOT actual. Podés ajustar los minutos si tenés un objetivo específico (ej. bajar de 1h45m).',
                'Estimated from your current VDOT. Adjust minutes to match a specific goal (e.g. sub-1h45m).'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-[#121f28] border border-[#1c3241] font-mono text-sm font-extrabold text-white tabular-nums">
              {formatTime(activeTargetSeconds, activeDistanceConfig.distanceKm >= 21)}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustMinutes(-1)}
                title={t('Restar 1 minuto al objetivo', 'Subtract 1 minute')}
                className="w-8 h-8 rounded-lg bg-[#14232c] hover:bg-[#1b2f3b] text-[#9cb4c4] hover:text-white border border-[#223949] flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustMinutes(1)}
                title={t('Sumar 1 minuto al objetivo', 'Add 1 minute')}
                className="w-8 h-8 rounded-lg bg-[#14232c] hover:bg-[#1b2f3b] text-[#9cb4c4] hover:text-white border border-[#223949] flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                +1m
              </button>

              {customTargetSeconds[selectedDistance] !== null && (
                <button
                  type="button"
                  onClick={handleResetTargetTime}
                  title={t('Restablecer al cálculo VDOT original', 'Reset to original VDOT calculation')}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Strategy Selector */}
        <div className="pt-2 border-t border-[#14222b] space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#637d8e] flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span>{t('Elegí tu Táctica de Pacing:', 'Choose your Pacing Strategy:')}</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STRATEGY_OPTIONS.map((opt) => {
              const isSelected = opt.id === strategy;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStrategy(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#102029] border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-zinc-900 border-zinc-800 hover:border-[#223949] hover:bg-[#0f1921]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="font-bold text-sm text-white">{t(opt.nameEs, opt.nameEn)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${opt.tagColor}`}>
                      {t(opt.badgeEs, opt.badgeEn)}
                    </span>
                  </div>
                  <p className="text-xs text-[#7d98a8] leading-relaxed">
                    {t(opt.descriptionEs, opt.descriptionEn)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Splits Table & Pace Band */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span>
                {t('Tabla de Parciales de Carrera', 'Race Splits & Milestones')} —{' '}
                <span className="text-emerald-400">{t(activeDistanceConfig.name, activeDistanceConfig.nameEn)}</span>
              </span>
            </h3>
            <p className="text-xs text-[#718a99]">
              {t('Ritmo promedio objetivo:', 'Target average pace:')}{' '}
              <strong className="text-white font-mono">{formatTime(avgPaceSeconds)}/km</strong>
            </p>
          </div>

          {/* Granularity switch for long races */}
          {activeDistanceConfig.distanceKm > 15 && (
            <div className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGranularity('every-km')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  granularity === 'every-km'
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('Km a Km', 'Every Km')}
              </button>
              <button
                type="button"
                onClick={() => setGranularity('milestones')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  granularity === 'milestones'
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('Cada 5K', 'Every 5K')}
              </button>
            </div>
          )}
        </div>

        {/* Splits Rows */}
        <div className="space-y-2 overflow-x-auto">
          <div className="min-w-[620px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#637d8e] border-b border-zinc-800">
              <div className="col-span-2">{t('Hito / Km', 'Milestone')}</div>
              <div className="col-span-2 text-center">{t('Ritmo Tramo', 'Pace')}</div>
              <div className="col-span-2 text-center">{t('Tiempo Acum.', 'Elapsed')}</div>
              <div className="col-span-4">{t('Consigna Táctica', 'Tactical Cue')}</div>
              <div className="col-span-2 text-right">{t('Nutrición', 'Fueling')}</div>
            </div>

            {/* Checkpoints */}
            <div className="divide-y divide-zinc-800/60 max-h-[480px] overflow-y-auto pr-1">
              {splits.map((split, idx) => {
                const isFinal = idx === splits.length - 1;
                return (
                  <div
                    key={split.km}
                    className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 text-xs transition-colors ${
                      isFinal
                        ? 'bg-emerald-500/10 font-bold border-l-2 border-emerald-400'
                        : idx % 2 === 0
                        ? 'bg-[#0b1318]/40'
                        : 'bg-transparent'
                    }`}
                  >
                    {/* Hito */}
                    <div className="col-span-2 font-mono font-bold text-white flex items-center gap-1.5">
                      <span>{split.label}</span>
                    </div>

                    {/* Ritmo */}
                    <div className="col-span-2 text-center font-mono tabular-nums text-emerald-400 font-bold">
                      {split.segmentPaceFormatted}/km
                    </div>

                    {/* Tiempo Acumulado */}
                    <div className="col-span-2 text-center font-mono tabular-nums text-zinc-100 font-extrabold">
                      {split.elapsedTimeFormatted}
                    </div>

                    {/* Táctica */}
                    <div className="col-span-4 text-[11px] text-[#8ca4b4] truncate" title={t(split.tacticalCueEs, split.tacticalCueEn)}>
                      {t(split.tacticalCueEs, split.tacticalCueEn)}
                    </div>

                    {/* Nutrición */}
                    <div className="col-span-2 text-right text-[11px] font-medium">
                      {split.nutritionCueEs ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                          {split.nutritionType === 'water' && <Droplets className="w-2.5 h-2.5 text-sky-400 shrink-0" />}
                          {split.nutritionType === 'gel' && <Zap className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
                          {split.nutritionType === 'caffeine' && <Zap className="w-2.5 h-2.5 text-rose-400 shrink-0" />}
                          <span className="truncate">{t(split.nutritionCueEs, split.nutritionCueEn || '')}</span>
                        </span>
                      ) : (
                        <span className="text-[#3c4e5b]">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tactical Strategy Note */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#718a99]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {t(
                'Consejo de carrera: Tomá agua en todos los puestos, incluso antes de tener sed. La deshidratación del 2% reduce tu rendimiento hasta un 10%.',
                'Race tip: Sip water at every aid station before feeling thirsty. A 2% fluid loss can hurt aerobic performance by up to 10%.'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="text-xs text-emerald-400 hover:underline cursor-pointer shrink-0 font-semibold"
          >
            {copiedWhatsApp ? t('✓ Copiado al portapapeles', '✓ Copied to clipboard') : t('Copiar parciales para compartir', 'Copy splits to share')}
          </button>
        </div>
      </div>
    </div>
  );
};
