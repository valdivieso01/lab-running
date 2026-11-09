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
  Plus,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import {
  parseStravaCSV,
  StravaAnalysisSummary,
  HeartRateProfile,
  StrengthSynergyProfile,
  computeStravaCalibration,
  mergeSingleActivityIntoStrava,
  createSummaryFromSingleActivity,
  removeActivityFromStrava,
} from '@/lib/strava';
import { StravaCalibration, formatTime, calculateVDOT } from '@/lib/calculator';
import { parseSingleActivityFile } from '@/lib/activityParser';

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
  onStrengthSynergyDetected?: (strengthSynergy: StrengthSynergyProfile | null) => void;
}

export const StravaValidator: React.FC<StravaValidatorProps> = ({
  active5kSeconds,
  embedded = false,
  onApplyEstimated5k,
  onHrProfileDetected,
  onCalibrationDetected,
  onStrengthSynergyDetected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<StravaAnalysisSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isProcessingSingle, setIsProcessingSingle] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [showStravaHelp, setShowStravaHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STRAVA_STORAGE_KEY);
      if (saved) {
        const parsed: StravaAnalysisSummary = JSON.parse(saved);
        if (parsed.best42k === undefined && parsed.recentActivities) {
          const marathonCandidate = parsed.recentActivities
            .filter((r) => !r.isOutlier && r.distanceKm >= 39.0 && r.distanceKm <= 46.0)
            .sort((a, b) => b.estimatedVDOT - a.estimatedVDOT)[0];
          if (marathonCandidate) {
            const eq5k = Math.round(
              marathonCandidate.movingTimeSec * Math.pow(5 / marathonCandidate.distanceKm, 1.06)
            );
            parsed.best42k = {
              label: 'Mejor 42K',
              activityName: marathonCandidate.name,
              date: marathonCandidate.date.split(',')[0] || marathonCandidate.date,
              distanceKm: marathonCandidate.distanceKm,
              timeFormatted: formatTime(marathonCandidate.movingTimeSec),
              paceFormatted: marathonCandidate.paceFormatted,
              vdot: marathonCandidate.estimatedVDOT || calculateVDOT(eq5k),
              equivalent5kSeconds: eq5k,
              avgHr: marathonCandidate.avgHr > 0 ? marathonCandidate.avgHr : undefined,
            };
          }
        }
        if (!parsed.calibration) {
          parsed.calibration = computeStravaCalibration({
            best5k: parsed.best5k,
            best10k: parsed.best10k,
            best21k: parsed.best21k,
            best42k: parsed.best42k,
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
        if (onStrengthSynergyDetected) {
          onStrengthSynergyDetected(parsed.strengthSynergy || null);
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

  const processSingleFile = async (file: File) => {
    setError(null);
    setIsProcessingSingle(true);
    try {
      const single = await parseSingleActivityFile(file);
      let updated: StravaAnalysisSummary;
      if (analysis) {
        updated = mergeSingleActivityIntoStrava(analysis, single);
      } else {
        updated = createSummaryFromSingleActivity(single);
      }
      setAnalysis(updated);
      try {
        localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      if (onHrProfileDetected && updated.hrProfile) {
        onHrProfileDetected(updated.hrProfile);
      }
      if (onCalibrationDetected && updated.calibration) {
        onCalibrationDetected(updated.calibration);
      }
      onApplyEstimated5k(
        updated.recommended5kSeconds,
        updated.hrProfile,
        updated.calibration || null
      );
      setSuccessToast(
        `✓ Carrera sumada: ${single.name} (${single.distanceKm} km en ${single.paceFormatted}${
          single.avgHr ? ` · ${single.avgHr} ppm` : ''
        })`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el archivo .gpx o .tcx.');
    } finally {
      setIsProcessingSingle(false);
    }
  };

  const processFile = (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.gpx') || name.endsWith('.tcx')) {
      processSingleFile(file);
      return;
    }

    if (!name.endsWith('.csv')) {
      setError('Por favor seleccioná un archivo con extensión .csv, .gpx o .tcx');
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo supera los 10 MB. Verificá que sea el activities.csv de Strava (normalmente pesa entre 1 y 3 MB).');
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
        if (onStrengthSynergyDetected) {
          onStrengthSynergyDetected(result.strengthSynergy || null);
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
    setSuccessToast(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (singleFileInputRef.current) {
      singleFileInputRef.current.value = '';
    }
    try {
      localStorage.removeItem(STRAVA_STORAGE_KEY);
      localStorage.removeItem('running_calc_strava_v2');
    } catch {
      // ignore
    }
    if (onHrProfileDetected) onHrProfileDetected(null);
    if (onCalibrationDetected) onCalibrationDetected(null);
    if (onStrengthSynergyDetected) onStrengthSynergyDetected(null);
  };

  const handleRemoveActivity = (id: string, name: string) => {
    if (!analysis) return;
    const updated = removeActivityFromStrava(analysis, id);
    if (!updated) {
      handleClearStrava();
      return;
    }
    setAnalysis(updated);
    try {
      localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSuccessToast(`✓ Carrera eliminada: ${name}`);
    setTimeout(() => setSuccessToast(null), 4000);
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
        accept=".csv,.gpx,.tcx"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        type="file"
        ref={singleFileInputRef}
        accept=".gpx,.tcx"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processSingleFile(e.target.files[0]);
          }
          e.target.value = '';
        }}
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
            Arrastrá tu archivo <span className="text-[#00df89] font-mono">activities.csv</span> o carrera (<span className="text-[#00df89] font-mono">.gpx / .tcx</span>)
          </p>

          <p className="text-xs text-[#698495] text-center max-w-lg mb-4 leading-relaxed">
            Podés subir tu historial completo de Strava o simplemente una carrera individual (de Strava o Garmin) para calcular tus marcas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-[#00df89] hover:bg-[#00f395] active:scale-95 text-[#051a11] text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer"
            >
              Seleccionar activities.csv
            </button>
            <button
              onClick={() => singleFileInputRef.current?.click()}
              disabled={isProcessingSingle}
              className="px-4 py-2.5 rounded-xl bg-[#13222b] hover:bg-[#1a2e3a] active:scale-95 text-[#00df89] border border-[#00df89]/30 text-xs font-bold tracking-wide transition-all cursor-pointer"
            >
              {isProcessingSingle ? 'Procesando...' : 'Subir carrera (.gpx / .tcx)'}
            </button>
          </div>

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
          {successToast && (
            <div className="flex items-center gap-2 text-xs text-[#00df89] bg-[#00df89]/10 border border-[#00df89]/30 px-3.5 py-2.5 rounded-xl animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium">{successToast}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#091014] border border-[#1b2b35] space-y-4">
            {/* Compact Summary Bar with Clear / Re-upload Controls */}
            <div className="flex flex-col gap-2 pb-2.5 border-b border-[#142028] text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-white">
                  {analysis.runsCount} salidas de running analizadas
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => singleFileInputRef.current?.click()}
                    disabled={isProcessingSingle}
                    title="Sumar una salida individual (.gpx o .tcx) a este historial"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00df89]/10 hover:bg-[#00df89]/20 text-[#00df89] border border-[#00df89]/30 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isProcessingSingle ? 'Sumando...' : 'Sumar carrera (.gpx / .tcx)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#13222b] hover:bg-[#1a2e3a] text-[#8ca4b4] border border-[#1b2b35] text-[11px] font-semibold transition-colors cursor-pointer"
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

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
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

                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#111e26] hover:bg-[#172833] text-[#00df89] border border-[#00df89]/35 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <Activity className="w-3 h-3" />
                  <span>
                    {showDetails
                      ? 'Ocultar carreras'
                      : `Ver carreras (${analysis.recentActivities?.length || 0})`}
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {showDetails && (
                <div className="mt-2 pt-2.5 border-t border-[#142028] space-y-2">
                  {analysis.recentActivities.length <= 50 && analysis.runsCount > 50 && (
                    <div className="p-2 rounded-lg bg-[#0d1920] border border-[#00df89]/30 flex items-center justify-between gap-2 text-[11px] text-[#9cb4c3]">
                      <span>
                        Tenés guardadas 50 carreras de la versión anterior. Volvé a subir tu <code className="text-white">activities.csv</code> para ver las <strong className="text-[#00df89]">{analysis.runsCount}</strong> completas.
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 rounded bg-[#00df89] text-[#051a11] font-bold shrink-0 cursor-pointer"
                      >
                        Cargar todas
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setVisibleCount(50);
                      }}
                      placeholder="Buscar por nombre, km o fecha..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d161c] border border-[#1b2b36] focus:border-[#00df89] focus:outline-none text-xs text-white placeholder-[#567080]"
                    />
                  </div>

                  <p className="text-[11px] text-[#6b8595] px-1">
                    Hacé clic en cualquier carrera para usar su ritmo de 5K en la tabla, o borrala con el tachito:
                  </p>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {(() => {
                      const q = searchQuery.trim().toLowerCase();
                      const filtered = q
                        ? analysis.recentActivities.filter(
                            (a) =>
                              a.name.toLowerCase().includes(q) ||
                              a.date.toLowerCase().includes(q) ||
                              String(a.distanceKm).includes(q)
                          )
                        : analysis.recentActivities;

                      const displayed = filtered.slice(0, visibleCount);

                      return (
                        <>
                          {displayed.map((act) => {
                            const equiv5kSec =
                              act.distanceKm >= 2 && act.movingTimeSec > 0
                                ? Math.round(act.movingTimeSec * Math.pow(5 / act.distanceKm, 1.06))
                                : 0;
                            const isSelected =
                              active5kSeconds !== undefined &&
                              equiv5kSec > 0 &&
                              Math.abs(active5kSeconds - equiv5kSec) <= 2;

                            return (
                              <div
                                key={act.id}
                                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all border ${
                                  isSelected
                                    ? 'bg-[#12242c] border-[#00df89] shadow-[0_0_12px_rgba(0,223,137,0.12)]'
                                    : act.isOutlier
                                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                                    : act.isShortInterval
                                    ? 'bg-[#101920] border-[#182630] text-[#7291a2]'
                                    : 'bg-[#101920] border-[#182630] hover:border-[#00df89]/40 text-[#8ba3b2]'
                                }`}
                              >
                                <div
                                  className="min-w-0 flex-1 cursor-pointer pr-2"
                                  onClick={() => {
                                    if (equiv5kSec > 0) {
                                      onApplyEstimated5k(equiv5kSec, analysis.hrProfile, analysis.calibration);
                                    }
                                  }}
                                  title={equiv5kSec > 0 ? 'Hacé clic para calcular ritmos con esta carrera' : undefined}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-semibold text-white truncate">{act.name}</span>
                                    {isSelected && (
                                      <span className="px-1.5 py-0.5 rounded bg-[#00df89] text-[#051a11] text-[9px] font-extrabold shrink-0">
                                        ✓ Activa
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#587383] flex flex-wrap items-center gap-1 mt-0.5">
                                    <span>{act.date}</span>
                                    <span>•</span>
                                    <span className="text-[#9ab4c3] font-medium">{act.distanceKm} km</span>
                                    {act.elevationGain > 50 && <span>• +{act.elevationGain}m</span>}
                                    {act.avgHr > 0 && <span>• {act.avgHr} ppm</span>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div
                                    className="text-right font-mono tabular-nums cursor-pointer"
                                    onClick={() => {
                                      if (equiv5kSec > 0) {
                                        onApplyEstimated5k(equiv5kSec, analysis.hrProfile, analysis.calibration);
                                      }
                                    }}
                                  >
                                    <div className="font-bold text-white">{act.paceFormatted}</div>
                                    {act.isOutlier || act.isShortInterval ? (
                                      <div className="text-[10px] text-sky-400 font-sans">{act.outlierReason}</div>
                                    ) : (
                                      <div className="text-[10px] text-[#00df89]">VDOT ~{act.estimatedVDOT}</div>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveActivity(act.id, act.name);
                                    }}
                                    title="Quitar esta carrera de tu historial"
                                    className="p-1.5 rounded-lg text-[#5a7280] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {filtered.length > visibleCount && (
                            <button
                              type="button"
                              onClick={() => setVisibleCount((prev) => prev + 100)}
                              className="w-full py-2 rounded-lg bg-[#0d161c] hover:bg-[#13222b] border border-[#1b2b36] text-[#00df89] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Mostrar más carreras ({filtered.length - visibleCount} restantes)
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Best Efforts Detected (5K, 10K, 21K, 42K) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#8ca4b4] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#00df89]" />
                Elegí qué marca de tu Strava usar como referencia base:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[analysis.best5k, analysis.best10k, analysis.best21k, analysis.best42k].map((effort, idx) => {
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

                {!analysis.best42k && analysis.longestRunKm >= 39 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-[#0e171d] border border-dashed border-[#00df89]/35 hover:border-[#00df89] text-left flex items-center justify-between gap-2 text-xs transition-all cursor-pointer"
                  >
                    <span className="text-[#8ba3b2]">
                      Tenés un <strong className="text-[#00df89]">42K ({analysis.longestRunKm} km)</strong> en tu historial: volvé a elegir tu <code className="text-white">activities.csv</code> para sumar la tarjeta Mejor 42K.
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#00df89]/15 text-[#00df89] font-bold text-[11px] shrink-0">
                      Actualizar CSV
                    </span>
                  </button>
                )}
              </div>
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
