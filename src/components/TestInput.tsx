'use client';

import React, { useState, useEffect } from 'react';
import {
  Minus,
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  Timer,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PRESET_TIMES,
  formatTime,
  parseTimeToSeconds,
  StravaCalibration,
} from '@/lib/calculator';
import { HeartRateProfile } from '@/lib/strava';
import { StravaValidator } from './StravaValidator';

interface TestInputProps {
  inputMethod: 'manual' | 'strava';
  onInputMethodChange: (method: 'manual' | 'strava') => void;
  timeSeconds: number;
  onTimeChange: (newSeconds: number) => void;
  onApplyStrava5k: (
    seconds: number,
    hrProfile?: HeartRateProfile | null,
    calibration?: StravaCalibration | null
  ) => void;
  onHrProfileDetected?: (hrProfile: HeartRateProfile | null) => void;
  onCalibrationDetected?: (calibration: StravaCalibration | null) => void;
}

export const TestInput: React.FC<TestInputProps> = ({
  inputMethod,
  onInputMethodChange,
  timeSeconds,
  onTimeChange,
  onApplyStrava5k,
  onHrProfileDetected,
  onCalibrationDetected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState(formatTime(timeSeconds));
  const [showTestTips, setShowTestTips] = useState(false);

  useEffect(() => {
    setInputVal(formatTime(timeSeconds));
  }, [timeSeconds]);

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
    <div className="flex flex-col gap-6 p-5 md:p-6 rounded-2xl bg-[#0f171d] border border-[#192731] shadow-xl text-white">
      {/* Reference Input Selector (Manual 5K vs Strava CSV) */}
      <div className="space-y-4">
        <div className="space-y-2.5">
          <div>
            <h2 className="text-base font-bold text-white">
              ¿Cómo querés calcular tus ritmos?
            </h2>
            <p className="text-xs text-[#728e9f] mt-0.5">
              Elegí entre cargar un Test de 5K manual o analizar tu historial real de Strava.
            </p>
          </div>

          {/* 2-Option Selector Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#090f13] border border-[#1a2933]">
            <button
              onClick={() => onInputMethodChange('manual')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                inputMethod === 'manual'
                  ? 'bg-[#00df89] text-[#051a11] shadow-md'
                  : 'text-[#7d98a8] hover:text-white'
              }`}
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span>Test de 5K (Manual)</span>
            </button>

            <button
              onClick={() => onInputMethodChange('strava')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                inputMethod === 'strava'
                  ? 'bg-[#00df89] text-[#051a11] shadow-md'
                  : 'text-[#7d98a8] hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Con mi Strava (.csv)</span>
            </button>
          </div>
        </div>

        {inputMethod === 'manual' ? (
          <>
            {/* Counter Display & Controls */}
            <div className="flex items-center justify-between gap-3 p-3 bg-[#090f13] rounded-2xl border border-[#1a2933]">
              <button
                onClick={handleMinus}
                title="Restar 15 segundos"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#142028] hover:bg-[#1d2d38] active:scale-95 text-[#8da4b4] hover:text-white transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBlur();
                    }}
                    className="w-full text-center bg-transparent text-3xl md:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white focus:outline-none"
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
                    <div className="text-3xl md:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white group-hover:text-[#00df89] transition-colors">
                      {currentTimeFormatted}
                    </div>
                    <div className="text-xs font-mono text-[#6b8798] mt-0.5">
                      Equivale a correr a <strong className="text-[#00df89]">{fiveKmPaceFormatted}/km</strong>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlus}
                title="Sumar 15 segundos"
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#142028] hover:bg-[#1d2d38] active:scale-95 text-[#8da4b4] hover:text-white transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-[#6d8899] flex items-center justify-between">
                <span>O elegí un tiempo rápido:</span>
                <span className="text-[10px] text-[#526c7c]">Tocá el número de arriba para editar exacto</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_TIMES.map((preset) => {
                  const isSelected = currentTimeFormatted === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-mono tabular-nums font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#00df89] text-[#051a11] shadow-[0_0_12px_rgba(0,223,137,0.35)] font-bold'
                          : 'bg-[#131d24] text-[#8ca4b3] hover:bg-[#1a2730] hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Tip: How to run the 5K test */}
            <div className="rounded-xl bg-[#0b1318] border border-[#17252f] overflow-hidden">
              <button
                onClick={() => setShowTestTips(!showTestTips)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-[#8da4b4] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#00df89]" />
                  ¿Cómo se corre el Test de 5K?
                </span>
                {showTestTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showTestTips && (
                <div className="px-3.5 pb-3 pt-1 text-xs text-[#7994a4] space-y-1.5 border-t border-[#142029] leading-relaxed">
                  <p>• <strong className="text-white">Entrada en calor:</strong> Trotá 10 a 15 minutos muy suave antes de empezar.</p>
                  <p>• <strong className="text-white">Terreno llano:</strong> Buscá una calle plana, parque o pista sin cruces ni desnivel.</p>
                  <p>• <strong className="text-white">Ritmo parejo:</strong> Salí a un ritmo fuerte pero que puedas sostener los 5 km sin desfondarte en el kilómetro 2.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <StravaValidator
            embedded={true}
            active5kSeconds={timeSeconds}
            onApplyEstimated5k={onApplyStrava5k}
            onHrProfileDetected={onHrProfileDetected}
            onCalibrationDetected={onCalibrationDetected}
          />
        )}
      </div>
    </div>
  );
};
