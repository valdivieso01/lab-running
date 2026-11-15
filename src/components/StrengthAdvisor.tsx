'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  STRENGTH_ROUTINES,
  RUNNING_STRENGTH_SYNERGY_TIPS,
  StrengthRoutine,
  TrainingDay,
  Exercise,
} from '@/lib/strengthData';
import { ExerciseDiagram } from '@/components/ExerciseDiagram';
import {
  Dumbbell,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Info,
  HelpCircle,
  Activity,
  Layers,
  Eye,
  X,
} from 'lucide-react';

export function StrengthAdvisor() {
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('split-hipertrofia-3dias');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [showSynergyTips, setShowSynergyTips] = useState<boolean>(true);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [activeModalExercise, setActiveModalExercise] = useState<Exercise | null>(null);

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalExercise(null);
      }
    };
    if (activeModalExercise) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeModalExercise]);

  // Active routine memo
  const activeRoutine = useMemo<StrengthRoutine>(() => {
    return (
      STRENGTH_ROUTINES.find((r) => r.id === selectedRoutineId) ||
      STRENGTH_ROUTINES[0]
    );
  }, [selectedRoutineId]);

  // Active training day memo
  const activeDay = useMemo<TrainingDay>(() => {
    const day = activeRoutine.days.find((d) => d.dayNumber === selectedDayNumber);
    return day || activeRoutine.days[0];
  }, [activeRoutine, selectedDayNumber]);

  // Switch routine handler (resets to day 1 safely)
  const handleSelectRoutine = (routineId: string) => {
    setSelectedRoutineId(routineId);
    setSelectedDayNumber(1);
  };

  const toggleExerciseCheck = (exerciseId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0c161d] via-[#101e27] to-[#0a1217] border border-[#1e3442] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00df89]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#00df89]/15 text-[#00df89] border border-[#00df89]/30">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Entrenamiento de Fuerza Concurrente</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Guías de Gimnasio para Corredores
            </h2>
            <p className="text-sm text-[#8ca4b4] max-w-2xl leading-relaxed">
              Rutinas científicamente diseñadas para ganar fuerza máxima y masa muscular sin fatigar en exceso las piernas ni perjudicar tus ritmos de fondo y pasadas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSynergyTips((prev) => !prev)}
            className="self-start md:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#13232c] hover:bg-[#1a2f3b] text-[#8ca4b4] hover:text-white border border-[#223949] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            aria-expanded={showSynergyTips}
          >
            <HelpCircle className="w-4 h-4 text-[#00df89]" />
            <span>{showSynergyTips ? 'Ocultar Reglas Gym + Running' : 'Ver Reglas Gym + Running'}</span>
          </button>
        </div>
      </div>

      {/* Routine Selector Tabs */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#8ca4b4] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#00df89]" />
          <span>Elegí tu Plan de Fuerza:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STRENGTH_ROUTINES.map((routine) => {
            const isSelected = routine.id === selectedRoutineId;
            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => handleSelectRoutine(routine.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#102029] border-[#00df89] shadow-md shadow-[#00df89]/10'
                    : 'bg-[#0c141a] border-[#182832] hover:border-[#223949] hover:bg-[#0f1921]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>{routine.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                      isSelected
                        ? 'bg-[#00df89] text-[#051a11]'
                        : 'bg-[#182832] text-[#8ca4b4]'
                    }`}
                  >
                    {routine.badge}
                  </span>
                </div>
                <p className="text-xs text-[#8ca4b4] line-clamp-2 leading-relaxed mb-2">
                  {routine.description}
                </p>
                <div className="text-[11px] text-[#00df89] flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Frecuencia: {routine.daysPerWeek} días a la semana</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Days Tabs within active routine */}
      <div className="bg-[#0c141a] border border-[#182832] rounded-2xl p-4 sm:p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182832] pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00df89]" />
              <span>{activeRoutine.name}</span>
            </h3>
            <p className="text-xs text-[#8ca4b4] mt-0.5">{activeRoutine.bestFor}</p>
          </div>

          {/* Day selection buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {activeRoutine.days.map((day) => {
              const isDayActive = day.dayNumber === activeDay.dayNumber;
              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isDayActive
                      ? 'bg-[#00df89] text-[#051a11] shadow-md shadow-[#00df89]/20'
                      : 'bg-[#13232c] text-[#8ca4b4] hover:text-white border border-[#223949]'
                  }`}
                >
                  <span>Día {day.dayNumber}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details Banner */}
        <div className="bg-[#101c24] border border-[#1d3240] rounded-xl p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#00df89]/20 text-[#00df89] flex items-center justify-center text-xs font-black">
                {activeDay.dayNumber}
              </span>
              <span>{activeDay.title}</span>
            </h4>
            <span className="text-xs text-[#8ca4b4] font-medium bg-[#162732] px-2.5 py-1 rounded-md border border-[#223949]">
              {activeDay.subtitle}
            </span>
          </div>

          <p className="text-xs text-[#a3b8c6] leading-relaxed">
            <strong className="text-white">Objetivo:</strong> {activeDay.focus}
          </p>

          <div className="text-xs text-[#00df89] bg-[#00df89]/10 border border-[#00df89]/20 rounded-lg p-2.5 flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Cuándo realizarlo: </strong>
              <span>{activeDay.recommendedTiming}</span>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8ca4b4] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00df89]" />
              <span>Ejercicios del Día ({activeDay.exercises.length})</span>
            </span>
            <span className="text-xs text-[#8ca4b4]">
              Hacé clic en el círculo para marcar como completado
            </span>
          </div>

          {/* Quick Glossary: RIR & Intensity */}
          <div className="bg-[#0b151b] border border-[#1a2d39] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#ffc83b]/20 text-[#ffc83b] flex items-center justify-center text-xs font-bold shrink-0">
                ?
              </span>
              <div>
                <strong className="text-white">¿Qué significa RIR? </strong>
                <span className="text-[#a3b8c6]">
                  <strong>Repeticiones en Reserva:</strong> cuántas repeticiones te guardás antes de llegar al fallo muscular total.
                </span>
              </div>
            </div>
            <div className="bg-[#14232c] px-2.5 py-1 rounded-md border border-[#223949] text-[11px] text-[#ffc83b] shrink-0">
              💡 <strong>RIR 1-2:</strong> Detenerte cuando aún podrías hacer 1 o 2 más. Ganás músculo sin quemarte para correr.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {activeDay.exercises.map((exercise: Exercise, idx: number) => {
              const isChecked = !!completedExercises[exercise.id];
              return (
                <article
                  key={exercise.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isChecked
                      ? 'bg-[#0a1217]/60 border-[#1a2d39] opacity-75'
                      : 'bg-[#101c24] border-[#1d3240] hover:border-[#28465a]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Left: Checkbox & Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox for exercise tracking */}
                      <button
                        type="button"
                        onClick={() => toggleExerciseCheck(exercise.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                          isChecked
                            ? 'bg-[#00df89] border-[#00df89] text-[#051a11]'
                            : 'border-[#2d4757] hover:border-[#00df89] text-transparent'
                        }`}
                        aria-label={`Marcar ${exercise.name} como completado`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="flex-1 space-y-3 min-w-0">
                        {/* Name & Quick Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#8ca4b4]">
                              #{idx + 1}
                            </span>
                            <h5
                              className={`text-sm sm:text-base font-bold ${
                                isChecked ? 'line-through text-[#8ca4b4]' : 'text-white'
                              }`}
                            >
                              {exercise.name}
                            </h5>
                          </div>

                          {/* Sets & Reps Pill */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#00df89]/15 text-[#00df89] border border-[#00df89]/30">
                              {exercise.sets} series × {exercise.reps}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#1a2d38] text-[#a3b8c6] border border-[#274050]">
                              Descanso: {exercise.rest}
                            </span>
                            <span
                              title="RIR (Repeticiones en Reserva): detenerse sintiendo que aún podés hacer 1 o 2 repeticiones más con buena técnica, sin llegar al fallo muscular total."
                              className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#1a2d38] text-[#ffc83b] border border-[#ffc83b]/30 flex items-center gap-1 cursor-help"
                            >
                              <span>Intensidad: {exercise.rir} (guardar 1-2 reps)</span>
                            </span>
                          </div>
                        </div>

                        {/* Muscles targeted */}
                        <div className="flex flex-wrap gap-1.5">
                          {exercise.targetMuscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-2 py-0.5 rounded text-[11px] bg-[#162732] text-[#8ca4b4] border border-[#223949]"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>

                        {/* Running Benefit Highlight */}
                        <div className="bg-[#0b151b] border-l-2 border-[#00df89] rounded-r-lg p-2.5 text-xs text-[#a3b8c6]">
                          <strong className="text-white block sm:inline sm:mr-1">
                            🏃 Beneficio para Correr:
                          </strong>
                          <span>{exercise.runningBenefit}</span>
                        </div>

                        {/* Technique Cues */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-[#8ca4b4] uppercase tracking-wider block">
                            Claves de ejecución:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#8ca4b4]">
                            {exercise.cues.map((cue, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1.5">
                                <span className="text-[#00df89] shrink-0 font-bold">•</span>
                                <span>{cue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right: Technical Exercise Diagram Thumbnail */}
                    <div
                      onClick={() => setActiveModalExercise(exercise)}
                      className="self-center sm:self-start relative w-full sm:w-36 h-36 sm:h-28 rounded-xl overflow-hidden border border-[#223949] bg-[#091014] shrink-0 cursor-pointer group shadow-sm hover:border-[#00df89] transition-all"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveModalExercise(exercise);
                        }
                      }}
                      aria-label={`Ver diagrama técnico y postura de ${exercise.name}`}
                    >
                      {exercise.imageUrl ? (
                        <img
                          src={exercise.imageUrl}
                          alt={exercise.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ExerciseDiagram exerciseId={exercise.id} className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00df89] text-[#051a11] flex items-center gap-1 shadow-sm">
                          <Eye className="w-3 h-3" />
                          <span>Ver técnica</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Running + Strength Synergy Rules (Collapsible) */}
      {showSynergyTips && (
        <section
          aria-labelledby="synergy-rules-heading"
          className="bg-[#0c141a] border border-[#182832] rounded-2xl p-5 space-y-4 shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-[#182832] pb-3">
            <Sparkles className="w-5 h-5 text-[#ffc83b]" />
            <h3 id="synergy-rules-heading" className="text-base font-bold text-white">
              Reglas de Oro: Cómo Compatibilizar Gym y Running sin Romperte
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RUNNING_STRENGTH_SYNERGY_TIPS.map((tip, idx) => (
              <div
                key={idx}
                className="bg-[#101c24] border border-[#1e3442] rounded-xl p-4 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ffc83b]/20 text-[#ffc83b] flex items-center justify-center text-xs font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span>{tip.title}</span>
                  </h4>
                  <p className="text-xs text-[#8ca4b4] leading-relaxed">
                    {tip.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1a2d3a] mt-2">
                  <span className="text-[11px] font-semibold text-[#00df89] block">
                    ✓ Regla práctica:
                  </span>
                  <p className="text-xs text-[#c5d8e4] italic">
                    &quot;{tip.ruleOfThumb}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exercise Posture Modal */}
      {activeModalExercise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercise-modal-title"
          onClick={() => setActiveModalExercise(null)}
        >
          <div
            className="bg-[#0f171d] border border-[#223949] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-[#091014] overflow-hidden border-b border-[#1e3442]">
              {activeModalExercise.imageUrl ? (
                <img
                  src={activeModalExercise.imageUrl}
                  alt={activeModalExercise.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ExerciseDiagram
                  exerciseId={activeModalExercise.id}
                  detailed
                  className="w-full h-full"
                />
              )}
              <button
                type="button"
                onClick={() => setActiveModalExercise(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-all cursor-pointer shadow-md"
                aria-label="Cerrar vista de postura"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 pt-0 space-y-3.5">
              <div>
                <h3 id="exercise-modal-title" className="text-lg font-bold text-white">
                  {activeModalExercise.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeModalExercise.targetMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#162732] text-[#00df89] border border-[#223949]"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#14232c] rounded-xl p-3.5 border border-[#223949] space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Claves de ejecución y postura:
                </span>
                <ul className="space-y-1.5 text-xs text-[#a3b8c6]">
                  {activeModalExercise.cues.map((cue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#00df89] font-bold">•</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0b151b] border-l-2 border-[#00df89] rounded-r-lg p-2.5 text-xs text-[#a3b8c6]">
                <strong className="text-white block sm:inline sm:mr-1">
                  🏃 ¿Por qué le sirve al corredor?
                </strong>
                <span>{activeModalExercise.runningBenefit}</span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModalExercise(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00df89] text-[#051a11] hover:bg-[#00c578] transition-all cursor-pointer shadow-md shadow-[#00df89]/20"
                >
                  Entendido, volver a la rutina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
