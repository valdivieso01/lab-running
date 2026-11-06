'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Heart,
  Trophy,
  HelpCircle,
  Gauge,
  Trash2,
  Upload,
  Dumbbell,
} from 'lucide-react';
import {
  parseStravaCSV,
  StravaAnalysisSummary,
  HeartRateProfile,
  computeStravaCalibration,
} from '@/lib/strava';
import { StravaCalibration } from '@/lib/calculator';

const STRAVA_STORAGE_KEY = 'running_calc_strava_v3';

interface StravaValidatorProps {
  active5kSeconds?: number;
  embedded?: boolean;
  onApplyEstimated5k: (
    seconds: number,
    hrProfile?: HeartRateProfile | null,
    calibration?: StravaCalibration | null
  ) => void;
  onHrProfileDetected?: (hrProfile: HeartRateProfile | null) => void;
  onCalibrationDetected?: (calibration: StravaCalibration | null) => void;
}

export const StravaValidator: React.FC<StravaValidatorProps> = ({
  active5kSeconds,
  embedded = false,
  onApplyEstimated5k,
  onHrProfileDetected,
  onCalibrationDetected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<StravaAnalysisSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStravaHelp, setShowStravaHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STRAVA_STORAGE_KEY);
      if (saved) {
        const parsed: StravaAnalysisSummary = JSON.parse(saved);
        if (!parsed.calibration) {
          parsed.calibration = computeStravaCalibration({
            best5k: parsed.best5k,
            best10k: parsed.best10k,
            best21k: parsed.best21k,
            weeklyKmAvg: parsed.weeklyKmAvg,
            longestRunKm: parsed.longestRunKm,
            recommendedVDOT: parsed.recommendedVDOT,
          });
        }
        setAnalysis(parsed);
        if (onHrProfileDetected && parsed.hrProfile) {
          onHrProfileDetected(parsed.hrProfile);
        }
        if (onCalibrationDetected && parsed.calibration) {
          onCalibrationDetected(parsed.calibration);
        }
        if (parsed.recommended5kSeconds) {
          onApplyEstimated5k(
            parsed.recommended5kSeconds,
            parsed.hrProfile,
            parsed.calibration || null
          );
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Por favor seleccioná un archivo con extensión .csv');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseStravaCSV(text);
        setAnalysis(result);
        try {
          localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify(result));
        } catch {
          // ignore storage quota errors
        }
        if (onHrProfileDetected) {
          onHrProfileDetected(result.hrProfile);
        }
        if (onCalibrationDetected) {
          onCalibrationDetected(result.calibration || null);
        }
        // Automatically apply the recommended 5K equivalent time & calibration when CSV is loaded
        onApplyEstimated5k(
          result.recommended5kSeconds,
          result.hrProfile,
          result.calibration || null
        );
      } catch (err: any) {
        setError(err?.message || 'No pudimos leer el archivo CSV. Verificá que sea el exportado de Strava.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleClearStrava = () => {
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
      localStorage.removeItem(STRAVA_STORAGE_KEY);
      localStorage.removeItem('running_calc_strava_v2');
    } catch {
      // ignore
    }
    if (onHrProfileDetected) onHrProfileDetected(null);
    if (onCalibrationDetected) onCalibrationDetected(null);
  };

  return (
    <div
      className={
        embedded
          ? 'text-white space-y-3'
          : 'p-5 md:p-6 rounded-2xl bg-[#0f171d] border border-[#192731] shadow-xl text-white'
      }
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
      />
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs text-[#7390a1]">
          Analizamos tu historial directo en tu navegador (tus datos nunca se suben a internet).
        </p>

        <button
          onClick={() => setShowStravaHelp(!showStravaHelp)}
          className="inline-flex items-center gap-1 text-xs text-[#00df89] hover:underline shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>¿Cómo lo descargo?</span>
        </button>
      </div>

      {/* Collapsible Help Instructions */}
      {showStravaHelp && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#0b1318] border border-[#1a2b36] text-xs text-[#8ba3b2] space-y-1.5 leading-relaxed">
          <div className="font-bold text-white">Cómo conseguir tu archivo activities.csv de Strava:</div>
          <ol className="list-decimal list-inside space-y-1 text-[#7994a4]">
            <li>Entrá a <strong className="text-white">strava.com</strong> desde la computadora e iniciá sesión.</li>
            <li>Andá al menú de tu perfil (arriba a la derecha) &gt; <strong className="text-white">Configuración</strong> &gt; <strong className="text-white">Mi cuenta</strong>.</li>
            <li>Abajo de todo, en <em>&ldquo;Descargar o eliminar tu cuenta&rdquo;</em>, tocá <strong className="text-[#00df89]">Solicitar tu archivo</strong>.</li>
            <li>Adentro del archivo ZIP que te llega por mail, buscá el archivo llamado <code className="text-white bg-[#132028] px-1.5 py-0.5 rounded">activities.csv</code> y arrastralo acá.</li>
          </ol>
        </div>
      )}

      {/* Upload Box */}
      {!analysis ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-all ${
            isDragging
              ? 'border-[#00df89] bg-[#00df89]/5'
              : 'border-[#1e2f3a] bg-[#0a1014] hover:border-[#2b4150]'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#131e26] border border-[#223340] flex items-center justify-center mb-2.5 text-[#00df89]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <p className="text-sm font-semibold text-white text-center mb-1">
            Arrastrá tu archivo <span className="text-[#00df89] font-mono">activities.csv</span> acá
          </p>

          <p className="text-xs text-[#698495] text-center max-w-lg mb-4 leading-relaxed">
            Detectamos automáticamente tu mejor 5K, 10K y 21K real, tu volumen semanal, tus sesiones de fuerza y tus zonas de pulso.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-[#00df89] hover:bg-[#00f395] active:scale-95 text-[#051a11] text-xs font-bold tracking-wide transition-all shadow-md"
          >
            Seleccionar archivo CSV
          </button>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        /* Analysis Results Card */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#091014] border border-[#1b2b35] space-y-4">
            {/* Compact Summary Bar with Clear / Re-upload Controls */}
            <div className="flex flex-col gap-2 pb-2.5 border-b border-[#142028] text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  {analysis.runsCount} salidas de running analizadas
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#13222b] hover:bg-[#1a2e3a] text-[#00df89] border border-[#00df89]/30 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Subir otro</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearStrava}
                    title="Borrar archivo cargado"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/30 font-semibold text-[11px]">
                  {analysis.validContinuousRunsCount} carreras continuas válidas
                </span>
                {analysis.shortIntervalsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#132028] text-[#7a95a5] text-[11px]">
                    {analysis.shortIntervalsCount} con pausas / cortas filtradas
                  </span>
                )}
              </div>
            </div>

            {/* Best Efforts Detected (5K, 10K, 21K) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#8ca4b4] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#00df89]" />
                Elegí qué marca de tu Strava usar como referencia base:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[analysis.best5k, analysis.best10k, analysis.best21k].map((effort, idx) => {
                  if (!effort) return null;
                  const isSelected =
                    active5kSeconds !== undefined &&
                    Math.abs(active5kSeconds - effort.equivalent5kSeconds) <= 2;

                  return (
                    <div
                      key={idx}
                      onClick={() =>
                        onApplyEstimated5k(
                          effort.equivalent5kSeconds,
                          analysis.hrProfile,
                          analysis.calibration
                        )
                      }
                      title="Hacé clic para calcular tus ritmos con esta marca"
                      className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#12242c] border-[#00df89] shadow-[0_0_12px_rgba(0,223,137,0.15)]'
                          : 'bg-[#0e171d] border-[#1a2b36] hover:border-[#00df89]/50'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#00df89]">{effort.label}</span>
                          <span className="text-[#698495]">• {effort.date}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-[#00df89] text-[#051a11] text-[10px] font-extrabold">
                              ✓ Base activa
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#7b96a6] truncate">
                          {effort.distanceKm} km en <strong className="text-white font-mono">{effort.timeFormatted}</strong>
                          {effort.avgHr ? ` • ${effort.avgHr} ppm` : ''}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold font-mono tabular-nums text-white">
                          {effort.paceFormatted}
                        </div>
                        <div className="text-[11px] font-mono text-[#00df89]">
                          VDOT {effort.vdot}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Runner Profile & Calibration Diagnostic Card */}
            {analysis.calibration && (
              <div className="p-3.5 rounded-xl bg-[#0d1920] border border-[#00df89]/25 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00df89]">
                    <Gauge className="w-4 h-4" />
                    <span>Perfil Fisiológico: {analysis.calibration.profileLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/20">
                      Fatiga Riegel: {analysis.calibration.personalRiegelExponent.toFixed(3)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#15252f] text-[#9ab4c4]">
                      Velocidad Crítica (CS): ~{analysis.calibration.criticalSpeedPaceFormatted}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#8ba3b2] leading-relaxed">
                  {analysis.calibration.profileExplanation}
                </p>
              </div>
            )}

            {/* Strength & Cross-Training Synergy Diagnostic Card */}
            {analysis.strengthSynergy && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  analysis.strengthSynergy.status === 'optimo'
                    ? 'bg-[#0d1920] border-[#00df89]/25'
                    : 'bg-[#171612] border-amber-500/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div
                    className={`flex items-center gap-2 text-xs font-bold ${
                      analysis.strengthSynergy.status === 'optimo'
                        ? 'text-[#00df89]'
                        : 'text-amber-400'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4 shrink-0" />
                    <span>{analysis.strengthSynergy.headline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#15252f] text-white">
                      {analysis.strengthSynergy.weeklyStrengthSessions}x/sem (~
                      {analysis.strengthSynergy.avgDurationMinutes}m)
                    </span>
                    {analysis.strengthSynergy.crossTrainingCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/20">
                        +{analysis.strengthSynergy.crossTrainingCount} bici/cruzado
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#9cb4c3] leading-relaxed">
                  {analysis.strengthSynergy.summaryText}
                </p>

                <p className="text-xs text-[#7d98a8] leading-relaxed pt-1 border-t border-white/10">
                  <strong className="text-white">Tip:</strong>{' '}
                  {analysis.strengthSynergy.recommendationText}
                </p>
              </div>
            )}

            {/* Volume & Heart Rate Profile Grid */}
            <div className={`grid grid-cols-2 ${embedded ? '' : 'sm:grid-cols-4'} gap-2 text-center pt-1`}>
              <div className="p-2.5 rounded-xl bg-[#0e171d] border border-[#182630]">
                <div className="text-[11px] text-[#698495]">Volumen semanal</div>
                <div className="text-sm font-mono tabular-nums font-bold text-white mt-0.5">
                  {analysis.weeklyKmAvg} km/sem
                </div>
                <div className="text-[10px] text-[#526d7c]">últimas 4 semanas</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0e171d] border border-[#182630]">
                <div className="text-[11px] text-[#698495]">Fondo más largo</div>
                <div className="text-sm font-mono tabular-nums font-bold text-[#00df89] mt-0.5">
                  {analysis.longestRunKm} km
                </div>
                <div className="text-[10px] text-[#526d7c]">en tu historial</div>
              </div>

              {analysis.hrProfile ? (
                <>
                  <div className="p-2.5 rounded-xl bg-[#0e171d] border border-[#182630]">
                    <div className="text-[11px] text-[#698495] flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      FC Máxima real
                    </div>
                    <div className="text-sm font-mono tabular-nums font-bold text-rose-400 mt-0.5">
                      {analysis.hrProfile.maxHrRecorded} ppm
                    </div>
                    <div className="text-[10px] text-[#526d7c]">registrada corriendo</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0e171d] border border-[#182630]">
                    <div className="text-[11px] text-[#698495]">Tu pulso en Z2</div>
                    <div className="text-sm font-mono tabular-nums font-bold text-white mt-0.5">
                      ~{analysis.hrProfile.avgEasyHr} ppm
                    </div>
                    <div className="text-[10px] text-[#526d7c]">
                      Umbral ~{analysis.hrProfile.avgThresholdHr} ppm
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 rounded-xl bg-[#0e171d] border border-[#182630]">
                    <div className="text-[11px] text-[#698495]">Ritmo promedio</div>
                    <div className="text-sm font-mono tabular-nums font-bold text-white mt-0.5">
                      {analysis.averagePaceFormatted}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0e171d] border border-[#182630]">
                    <div className="text-[11px] text-[#698495]">Mejor VDOT</div>
                    <div className="text-sm font-mono tabular-nums font-bold text-white mt-0.5">
                      {analysis.bestEstimatedVDOT.toFixed(1)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Toggle detail view */}
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-[#7492a3] hover:text-white transition-colors pt-1"
              >
                <span>
                  {showDetails
                    ? 'Ocultar lista de actividades recientes'
                    : 'Ver tus últimas 15 actividades analizadas'}
                </span>
                {showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showDetails && (
                <div className="mt-3 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {analysis.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                        act.isOutlier
                          ? 'bg-rose-500/5 border border-rose-500/20 text-rose-300'
                          : act.isShortInterval
                          ? 'bg-sky-500/5 border border-sky-500/20 text-[#7291a2]'
                          : 'bg-[#121c23] border border-[#182630] text-[#8ba3b2]'
                      }`}
                    >
                      <div className="truncate max-w-[190px] sm:max-w-xs">
                        <div className="font-semibold text-white truncate">{act.name}</div>
                        <div className="text-[11px] text-[#587383]">
                          {act.date} • {act.distanceKm} km
                          {act.elevationGain > 80 ? ` • +${act.elevationGain}m` : ''}
                          {act.avgHr > 0 ? ` • ${act.avgHr} ppm` : ''}
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="font-bold text-white">{act.paceFormatted}</div>
                        {act.isOutlier || act.isShortInterval ? (
                          <div className="text-[10px] text-sky-400 font-sans">{act.outlierReason}</div>
                        ) : (
                          <div className="text-[10px] text-[#00df89]">VDOT ~{act.estimatedVDOT}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClearStrava}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar datos de Strava cargados</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
