'use client';

import React from 'react';
import {
  Mountain,
  Heart,
  Trophy,
  Zap,
  Activity,
  Gauge,
  Share2,
  Check,
  Download,
} from 'lucide-react';
import {
  getStandardPaces,
  getIntervals,
  TERRAINS,
  TerrainType,
  calculateVDOT,
  formatTime,
  StravaCalibration,
} from '@/lib/calculator';
import { HeartRateProfile } from '@/lib/strava';

interface PaceTableProps {
  fiveKmSeconds: number;
  terrainType: TerrainType;
  onTerrainChange: (terrain: TerrainType) => void;
  onCopyWhatsApp: () => void;
  copiedWhatsApp: boolean;
  onDownloadImage: () => void;
  downloadingImage: boolean;
  hrProfile?: HeartRateProfile | null;
  calibration?: StravaCalibration | null;
  useStravaCalibration?: boolean;
}

export const PaceTable: React.FC<PaceTableProps> = ({
  fiveKmSeconds,
  terrainType,
  onTerrainChange,
  onCopyWhatsApp,
  copiedWhatsApp,
  onDownloadImage,
  downloadingImage,
  hrProfile,
  calibration,
  useStravaCalibration = true,
}) => {
  const currentTerrain = TERRAINS.find((t) => t.id === terrainType) || TERRAINS[0];
  const effectiveMultiplier = currentTerrain.multiplier;
  const activeCalibration = calibration && useStravaCalibration ? calibration : null;

  const vdot = calculateVDOT(fiveKmSeconds);

  // All paces (first 3 are weekly training zones, remaining are target race distances)
  const allPaces = getStandardPaces(fiveKmSeconds, effectiveMultiplier, activeCalibration);
  const allPacesFlat = getStandardPaces(fiveKmSeconds, 1.0, activeCalibration);

  const weeklyZones = allPaces.slice(0, 3);
  const raceTargets = allPaces.slice(3);

  // Intervals
  const intervals = getIntervals(fiveKmSeconds, effectiveMultiplier);
  const intervalsFlat = getIntervals(fiveKmSeconds, 1.0);

  const getHrZoneForPace = (name: string): string | null => {
    if (!hrProfile) return null;
    const lower = name.toLowerCase();
    if (lower.includes('z2') || lower.includes('regenerativo')) return hrProfile.zones.z2;
    if (lower.includes('fondo')) return hrProfile.zones.fondo;
    if (lower.includes('tempo') || lower.includes('umbral')) return hrProfile.zones.tempo;
    if (lower.includes('objetivo')) return hrProfile.zones.ritmoCarrera;
    return null;
  };

  const getWeeklyGuideText = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('z2')) {
      return 'Tenés que poder hablar oraciones completas sin agitarte. Usalo en el 80% de tus salidas semanales.';
    }
    if (lower.includes('fondo')) {
      return 'Para tu tirada larga del fin de semana (60 a 120 min). El objetivo es sumar tiempo en tus piernas terminando entero.';
    }
    return 'Ritmo "incómodamente rápido" pero sostenible por 20 a 30 min. Apenas podés decir 3 o 4 palabras seguidas. Máximo 1 vez por semana.';
  };

  return (
    <div
      id="pace-table-capture"
      className="flex flex-col gap-7 p-5 md:p-6 rounded-2xl bg-[#0f171d] border border-[#192731] shadow-xl text-white"
    >
      {/* Top Bar: Title, Context Badges & Export Action Buttons */}
      <div className="flex flex-col gap-3.5 pb-4 border-b border-[#16242e]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Tus Zonas y Ritmos de Entrenamiento
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#0a1217] border border-[#1a2b36] text-[#9bb3c2] text-xs font-mono">
                Base 5K: <strong className="text-white">{formatTime(fiveKmSeconds)}</strong> • VDOT{' '}
                <strong className="text-[#00df89]">{vdot.toFixed(1)}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {activeCalibration ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00df89]/10 border border-[#00df89]/30 text-[#00df89] font-medium">
                  <Gauge className="w-3.5 h-3.5" />
                  Calibrado con tu Strava: {activeCalibration.profileLabel} (Fatiga Riegel{' '}
                  {activeCalibration.personalRiegelExponent.toFixed(2)})
                </span>
              ) : (
                <span className="text-[#7390a1]">
                  Método estándar: Jack Daniels VDOT + Proyección Riegel (1.06)
                </span>
              )}

              {hrProfile && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium">
                  <Heart className="w-3 h-3 fill-rose-400" />
                  FC Máx: {hrProfile.maxHrRecorded} ppm
                </span>
              )}
            </div>
          </div>

          {/* Export / Share Action Buttons at the top right */}
          <div
            data-export-ignore="true"
            className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <button
              onClick={onCopyWhatsApp}
              className="py-2 px-3.5 rounded-xl font-bold text-xs tracking-wide flex items-center gap-1.5 transition-all shadow-md bg-[#00df89] hover:bg-[#00f395] active:scale-95 text-[#051a11] cursor-pointer"
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copiar WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={onDownloadImage}
              disabled={downloadingImage}
              className="py-2 px-3.5 rounded-xl font-bold text-xs tracking-wide flex items-center gap-1.5 transition-all border border-[#00df89]/40 bg-[#0d1a20] hover:bg-[#13262f] text-[#00df89] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingImage ? 'Generando...' : 'Guardar PNG'}</span>
            </button>
          </div>
        </div>

        {/* Horizontal 4-Button Terrain Selector Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#9ab3c4]">
              ¿En qué terreno vas a entrenar?{' '}
              <span className="font-normal text-[#678293]">
                (ajustamos tus ritmos para mantener el mismo esfuerzo que en calle)
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TERRAINS.map((terrain) => {
              const isSelected = terrainType === terrain.id;
              return (
                <button
                  key={terrain.id}
                  type="button"
                  onClick={() => onTerrainChange(terrain.id)}
                  className={`flex flex-col justify-between p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#12242c] border-[#00df89] shadow-[0_0_12px_rgba(0,223,137,0.14)]'
                      : 'bg-[#0a1116] border-[#18262f] hover:border-[#243846]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'border-[#00df89] bg-[#00df89]/20'
                            : 'border-[#3a5263]'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00df89]" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-white truncate">
                        {terrain.name}
                      </span>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums font-bold shrink-0 ${
                        isSelected
                          ? 'bg-[#00df89] text-[#051a11]'
                          : 'bg-[#142028] text-[#6d8899]'
                      }`}
                    >
                      {terrain.badge}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#6d8899] mt-1 truncate w-full">
                    {terrain.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Body inside PaceTable (creating a 3-column overall screen layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* LEFT SUB-COLUMN (Column 2 of screen): Continuous Runs + Race Projections */}
        <div className="space-y-6">
          {/* SECTION 1: Continuous Runs (Z2, Fondo & Threshold) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00df89]" />
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#00df89]">
                  1. Rodajes Continuos (Z2, Fondo y Umbral)
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {weeklyZones.map((p, idx) => {
                const flatPace = allPacesFlat[idx]?.paceFormatted.replace('/km', '') || '';
                const hrZone = getHrZoneForPace(p.name);
                const guide = getWeeklyGuideText(p.name);

                return (
                  <div
                    key={p.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-[#0a1116] border border-[#16252f] hover:border-[#213746] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {p.badge}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {p.name}
                          </span>
                          {hrZone && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] font-mono font-semibold">
                              <Heart className="w-2.5 h-2.5 text-rose-400" />
                              {hrZone}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7d98a8] leading-snug">
                          {guide}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 pl-12 sm:pl-2">
                      <div className="text-lg font-extrabold font-mono tabular-nums text-white tracking-tight">
                        {p.paceFormatted}
                      </div>
                      {activeCalibration && p.deltaSecondsPerKm !== undefined && p.deltaSecondsPerKm !== 0 && (
                        <div
                          className={`text-[10px] font-mono ${
                            p.deltaSecondsPerKm < 0 ? 'text-[#00df89]' : 'text-amber-400'
                          }`}
                        >
                          {p.deltaSecondsPerKm > 0 ? `+${p.deltaSecondsPerKm}s` : `${p.deltaSecondsPerKm}s`}/km vs est. ({p.standardPaceFormatted})
                        </div>
                      )}
                      {currentTerrain.multiplier !== 1.0 && (
                        <div className="text-[10px] font-mono text-[#5c7889]">
                          en calle: {flatPace}/km
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Target Race Paces (Riegel) */}
          <div className="space-y-2.5 pt-4 border-t border-[#15222b]">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-teal-400">
                    3. Ritmos y Tiempos de Carrera (8K a 42K)
                  </h3>
                </div>
                {hrProfile && (
                  <span className="text-[11px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-md">
                    Pulso carrera: {hrProfile.zones.ritmoCarrera}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7390a1] leading-snug">
                Objetivo para el día de la carrera o bloques específicos (no usar en trotes diarios).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {raceTargets.map((race, idx) => {
                const flatRace = allPacesFlat[idx + 3];
                const cleanName = race.name.replace('Ritmo Objetivo ', '');

                return (
                  <div
                    key={race.name}
                    className="p-3 rounded-xl bg-[#0a1116] border border-[#15252f] flex items-center justify-between hover:border-teal-500/40 transition-all"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {cleanName}
                      </div>
                      <div className="text-[11px] text-[#698495]">
                        {race.totalTimeFormatted ? (
                          <>
                            Meta: <strong className="text-teal-400 font-mono tabular-nums">{race.totalTimeFormatted}</strong>
                          </>
                        ) : (
                          race.description
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono tabular-nums shrink-0 ml-2">
                      <div className="text-sm font-extrabold text-white">
                        {race.paceFormatted}
                      </div>
                      {activeCalibration && race.deltaSecondsPerKm !== undefined && race.deltaSecondsPerKm !== 0 && (
                        <div
                          className={`text-[10px] ${
                            race.deltaSecondsPerKm < 0 ? 'text-[#00df89]' : 'text-amber-400'
                          }`}
                        >
                          {race.deltaSecondsPerKm > 0 ? `+${race.deltaSecondsPerKm}s` : `${race.deltaSecondsPerKm}s`}/km
                        </div>
                      )}
                      {currentTerrain.multiplier !== 1.0 && flatRace && (
                        <div className="text-[10px] text-[#587383]">
                          calle {flatRace.paceFormatted}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SUB-COLUMN (Column 3 of screen): VO2Max Intervals & Speed */}
        <div className="space-y-3 xl:pl-5 xl:border-l border-[#15222b]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00df89]" />
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#00df89]">
                  2. Series y Pasadas por Distancia (200m a 2000m)
                </h3>
              </div>
              {hrProfile && (
                <span className="text-[11px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-md">
                  Pulso: {hrProfile.zones.vo2max}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7390a1] leading-snug">
              Tiempo exacto para cada repetición en pista o calle llana. Recuperá trotando suave el mismo tiempo (pausa 1:1).
            </p>
          </div>

          {/* Intervals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {intervals.map((inv, idx) => {
              const flatRep = intervalsFlat[idx]?.repTimeFormatted || '';
              return (
                <div
                  key={inv.distance}
                  className="p-3 rounded-xl bg-[#091014] border border-[#16232b] flex items-center justify-between hover:border-[#213543] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="px-2 py-1 rounded-lg bg-[#131e26] border border-[#20323e] text-xs font-mono tabular-nums font-bold text-white min-w-[50px] text-center">
                      {inv.distance}
                    </div>
                    <div>
                      <div className="text-xs font-bold font-mono tabular-nums text-[#00df89]">
                        {inv.repTimeFormatted}
                      </div>
                      <div className="text-[11px] text-[#698495] font-mono tabular-nums">
                        {inv.paceFormatted}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <span className="text-[10px] text-[#587383] block">{inv.percentageText}</span>
                    {currentTerrain.multiplier !== 1.0 ? (
                      <span className="text-[10px] text-[#4c6675]">llano {flatRep}</span>
                    ) : (
                      <span className="text-[10px] text-[#4c6675]">1:1</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cuestas Cortas Card */}
          <div className="p-3 rounded-xl bg-[#091014] border border-[#16232b] flex items-center justify-between hover:border-[#213543] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#132228] border border-[#00df89]/30 flex items-center justify-center text-[#00df89] shrink-0">
                <Mountain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Cuestas cortas (Fuerza y potencia)
                </div>
                <div className="text-[11px] text-[#7390a1]">
                  8-10 seg en subida fuerte al 110% de esfuerzo, bajando al trote muy suave.
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 ml-2">
              <div className="text-xs font-mono font-bold text-[#00df89]">
                8-10 seg
              </div>
              <div className="text-[10px] text-[#5e7a8a]">
                Sin GPS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Footer Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#142028] text-xs text-[#5b7788]">
        <span>
          Regla de oro: si en <strong className="text-[#8ca4b4]">Z2 Suave</strong> te cuesta hablar, bajá un poco el ritmo sin importar lo que diga el reloj.
        </span>
        <span className="font-mono tabular-nums shrink-0">
          5K {formatTime(fiveKmSeconds)} • VDOT {vdot.toFixed(1)} • {currentTerrain.name}
        </span>
      </div>
    </div>
  );
};
