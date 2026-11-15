'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Minus,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  Timer,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  PRESET_TIMES,
  TERRAINS,
  TerrainType,
  formatTime,
  parseTimeToSeconds,
  StravaCalibration,
} from '@/lib/calculator';
import { HeartRateProfile, StrengthSynergyProfile } from '@/lib/strava';
import { StravaValidator } from './StravaValidator';
import { parseSingleActivityFile, ParsedSingleActivity } from '@/lib/activityParser';

interface TestInputProps {
  inputMethod: 'manual' | 'strava';
  onInputMethodChange: (method: 'manual' | 'strava') => void;
  timeSeconds: number;
  onTimeChange: (newSeconds: number) => void;
  terrainType: TerrainType;
  onTerrainChange: (terrain: TerrainType) => void;
  onApplyStrava5k: (
    seconds: number,
    hrProfile?: HeartRateProfile | null,
    calibration?: StravaCalibration | null
  ) => void;
  onHrProfileDetected?: (hrProfile: HeartRateProfile | null) => void;
  onCalibrationDetected?: (calibration: StravaCalibration | null) => void;
  onStrengthSynergyDetected?: (strengthSynergy: StrengthSynergyProfile | null) => void;
}

export const TestInput: React.FC<TestInputProps> = ({
  inputMethod,
  onInputMethodChange,
  timeSeconds,
  onTimeChange,
  terrainType,
  onTerrainChange,
  onApplyStrava5k,
  onHrProfileDetected,
  onCalibrationDetected,
  onStrengthSynergyDetected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(formatTime(timeSeconds));
  const [showTestTips, setShowTestTips] = useState(false);
  const [isParsingSingle, setIsParsingSingle] = useState(false);
  const [singleActivityLoaded, setSingleActivityLoaded] = useState<ParsedSingleActivity | null>(null);
  const [singleFileError, setSingleFileError] = useState<string | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(formatTime(timeSeconds));
  }, [timeSeconds]);

  const handleProcessSingleFile = async (file: File) => {
    setIsParsingSingle(true);
    setSingleFileError(null);
    try {
      const parsed = await parseSingleActivityFile(file);
      setSingleActivityLoaded(parsed);
      onTimeChange(parsed.equivalent5kSeconds);
      setInputVal(formatTime(parsed.equivalent5kSeconds));

      if (parsed.maxHr > 0 && onHrProfileDetected) {
        const maxHr = parsed.maxHr;
        onHrProfileDetected({
          maxHrRecorded: maxHr,
          avgEasyHr: Math.round(maxHr * 0.74),
          avgThresholdHr: Math.round(maxHr * 0.88),
          zones: {
            z2: `${Math.round(maxHr * 0.71)}-${Math.round(maxHr * 0.77)} ppm`,
            fondo: `${Math.round(maxHr * 0.73)}-${Math.round(maxHr * 0.80)} ppm`,
            ritmoCarrera: `${Math.round(maxHr * 0.82)}-${Math.round(maxHr * 0.88)} ppm`,
            tempo: `${Math.round(maxHr * 0.86)}-${Math.round(maxHr * 0.91)} ppm`,
            vo2max: `${Math.round(maxHr * 0.92)}-${Math.round(maxHr * 0.98)} ppm`,
          },
        });
      }
    } catch (err: any) {
      setSingleFileError(err?.message || 'Error al leer el archivo. Verificá que sea un .gpx o .tcx.');
    } finally {
      setIsParsingSingle(false);
    }
  };

  const handleMinus = () => {
    const newSec = Math.max(720, timeSeconds - 15);
    onTimeChange(newSec);
    setInputVal(formatTime(newSec));
  };

  const handlePlus = () => {
    const newSec = Math.min(3600, timeSeconds + 15);
    onTimeChange(newSec);
    setInputVal(formatTime(newSec));
  };

  const handlePresetClick = (preset: string) => {
    const sec = parseTimeToSeconds(preset);
    onTimeChange(sec);
    setInputVal(preset);
    setIsEditing(false);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseTimeToSeconds(inputVal);
    if (parsed > 0) {
      onTimeChange(parsed);
      setInputVal(formatTime(parsed));
    } else {
      setInputVal(formatTime(timeSeconds));
    }
  };

  const currentTimeFormatted = formatTime(timeSeconds);
  const fiveKmPaceFormatted = formatTime(timeSeconds / 5);

  return (
    <section
      aria-label="Configuración de Test Base"
      className="lab-panel flex flex-col gap-5 p-5 md:p-6 rounded-2xl text-zinc-100"
    >
      {/* Top Bar: Title + Input Method Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-bold tracking-tight text-zinc-50">
            ¿Cómo querés calcular tus ritmos?
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Elegí entre cargar un Test de 5K manual o analizar tu historial real de Strava / Garmin.
          </p>
        </div>

        {/* 2-Option Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 md:w-80">
          <button
            type="button"
            onClick={() => onInputMethodChange('manual')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              inputMethod === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
            }`}
          >
            <Timer className="w-4 h-4 shrink-0" />
            <span>Test de 5K</span>
          </button>

          <button
            type="button"
            onClick={() => onInputMethodChange('strava')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              inputMethod === 'strava'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Strava / Garmin</span>
          </button>
        </div>
      </div>

      {/* Horizontal Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {inputMethod === 'manual' ? (
          <div className="lg:col-span-5 space-y-4">
            {/* Counter Display & Controls */}
            <div className="flex items-center justify-between gap-3 p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={handleMinus}
                title="Restar 15 segundos"
                aria-label="Restar 15 segundos"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-all cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    aria-label="Tiempo de Test de 5K"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBlur();
                    }}
                    className="w-full text-center bg-transparent text-3xl md:text-4xl font-extrabold num-telemetry tracking-tight text-zinc-50 focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => {
                      setIsEditing(true);
                      setInputVal(currentTimeFormatted);
                    }}
                    title="Hacé clic para escribir tu tiempo manualmente"
                    className="cursor-pointer group"
                  >
                    <div className="text-3xl md:text-4xl font-extrabold num-telemetry tracking-tight text-zinc-50 group-hover:text-emerald-400 transition-colors">
                      {currentTimeFormatted}
                    </div>
                    <div className="text-xs num-telemetry text-zinc-400 mt-0.5">
                      Ritmo promedio: <strong className="text-emerald-400">{fiveKmPaceFormatted}/km</strong>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePlus}
                title="Sumar 15 segundos"
                aria-label="Sumar 15 segundos"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>O elegí un tiempo rápido:</span>
                <span className="text-[10px] text-zinc-500">Tocá el tiempo para editar exacto</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_TIMES.map((preset) => {
                  const isSelected = currentTimeFormatted === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`py-1.5 px-1 rounded-lg text-xs num-telemetry font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border border-zinc-800'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single File Upload for 5K Test (.gpx / .tcx) & Collapsible Tip */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
              <input
                type="file"
                ref={singleFileInputRef}
                accept=".gpx,.tcx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleProcessSingleFile(e.target.files[0]);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¿Tenés archivo de tu carrera?</span>
                </div>
                <button
                  type="button"
                  onClick={() => singleFileInputRef.current?.click()}
                  disabled={isParsingSingle}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {isParsingSingle ? 'Leyendo...' : 'Subir .gpx / .tcx'}
                </button>
              </div>

              {singleActivityLoaded && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{singleActivityLoaded.name}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">{singleActivityLoaded.dateStr}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    Detectado: <strong className="text-white">{singleActivityLoaded.distanceKm} km</strong> en{' '}
                    <strong className="text-white">{formatTime(singleActivityLoaded.movingTimeSec)}</strong> (
                    {singleActivityLoaded.paceFormatted}
                    {singleActivityLoaded.avgHr ? ` · ${singleActivityLoaded.avgHr} ppm` : ''})
                  </div>
                  <div className="text-[11px] text-emerald-400 num-telemetry">
                    Equivalente 5K aplicado: <strong>{singleActivityLoaded.equivalent5kFormatted}</strong> (VDOT {singleActivityLoaded.vdot})
                  </div>
                </div>
              )}

              {singleFileError && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{singleFileError}</span>
                </div>
              )}

              <div className="pt-1 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowTestTips(!showTestTips)}
                  className="w-full py-1 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    ¿Cómo se corre el Test de 5K?
                  </span>
                  {showTestTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showTestTips && (
                  <div className="pt-2 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                    <p>• <strong className="text-zinc-200">Entrada en calor:</strong> Trotá 10 a 15 minutos muy suave antes de empezar.</p>
                    <p>• <strong className="text-zinc-200">Terreno llano:</strong> Buscá una calle plana, parque o pista sin cruces ni desnivel.</p>
                    <p>• <strong className="text-zinc-200">Ritmo parejo:</strong> Salí a un ritmo fuerte pero que puedas sostener los 5 km sin desfondarte.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8">
            <StravaValidator
              embedded={true}
              active5kSeconds={timeSeconds}
              onApplyEstimated5k={onApplyStrava5k}
              onHrProfileDetected={onHrProfileDetected}
              onCalibrationDetected={onCalibrationDetected}
              onStrengthSynergyDetected={onStrengthSynergyDetected}
            />
          </div>
        )}

        {/* Terrain Selector Section */}
        <div className={`${inputMethod === 'manual' ? 'lg:col-span-7' : 'lg:col-span-4'} space-y-3`}>
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-zinc-100">
              ¿En qué terreno vas a entrenar?
            </div>
            <div className="text-xs text-zinc-400">
              Ajustamos tus ritmos para mantener el mismo esfuerzo fisiológico que en calle.
            </div>
          </div>

          <div className={`grid gap-2.5 ${inputMethod === 'manual' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1'}`}>
            {TERRAINS.map((terrain) => {
              const isSelected = terrainType === terrain.id;
              return (
                <button
                  key={terrain.id}
                  type="button"
                  onClick={() => onTerrainChange(terrain.id)}
                  className={`flex flex-col justify-between p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/20'
                            : 'border-zinc-600'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-zinc-100 truncate">
                        {terrain.name}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] num-telemetry font-bold shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {terrain.badge}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                    {terrain.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
