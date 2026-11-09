'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import { Header } from '@/components/Header';
import { TestInput } from '@/components/TestInput';
import { PaceTable } from '@/components/PaceTable';
import {
  TerrainType,
  calculateVDOT,
  formatTime,
  getStandardPaces,
  getIntervals,
  TERRAINS,
  StravaCalibration,
} from '@/lib/calculator';
import {
  HeartRateProfile,
  StrengthSynergyProfile,
  StravaAnalysisSummary,
  computeStravaCalibration,
} from '@/lib/strava';

const TIME_STORAGE_KEY = 'running_calc_time_v2';
const TERRAIN_STORAGE_KEY = 'running_calc_terrain_v2';
const METHOD_STORAGE_KEY = 'running_calc_method_v2';
const STRAVA_STORAGE_KEY = 'running_calc_strava_v3';

export default function Home() {
  // Default test 5K time: 25:30 (1530 seconds)
  const [inputMethod, setInputMethod] = useState<'manual' | 'strava'>('manual');
  const [timeSeconds, setTimeSeconds] = useState<number>(1530);
  const [terrain, setTerrain] = useState<TerrainType>('calle');
  const [hrProfile, setHrProfile] = useState<HeartRateProfile | null>(null);
  const [calibration, setCalibration] = useState<StravaCalibration | null>(null);
  const [strengthSynergy, setStrengthSynergy] = useState<StrengthSynergyProfile | null>(null);
  const [useStravaCalibration, setUseStravaCalibration] = useState<boolean>(true);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);
  const [downloadingImage, setDownloadingImage] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Restore saved 5K time, terrain, method & Strava data on mount
  useEffect(() => {
    try {
      const savedTime = localStorage.getItem(TIME_STORAGE_KEY);
      if (savedTime) {
        const parsed = parseInt(savedTime, 10);
        if (!isNaN(parsed) && parsed >= 600 && parsed <= 5400) {
          setTimeSeconds(parsed);
        }
      }
      const savedTerrain = localStorage.getItem(TERRAIN_STORAGE_KEY) as TerrainType | null;
      if (savedTerrain && TERRAINS.some((t) => t.id === savedTerrain)) {
        setTerrain(savedTerrain);
      }
      const savedMethod = localStorage.getItem(METHOD_STORAGE_KEY);
      if (savedMethod === 'manual' || savedMethod === 'strava') {
        setInputMethod(savedMethod);
      }
      const savedStrava = localStorage.getItem(STRAVA_STORAGE_KEY);
      if (savedStrava) {
        const parsedStrava: StravaAnalysisSummary = JSON.parse(savedStrava);
        if (parsedStrava.hrProfile) setHrProfile(parsedStrava.hrProfile);
        if (parsedStrava.strengthSynergy) setStrengthSynergy(parsedStrava.strengthSynergy);
        const cal =
          parsedStrava.calibration ||
          computeStravaCalibration({
            best5k: parsedStrava.best5k,
            best10k: parsedStrava.best10k,
            best21k: parsedStrava.best21k,
            best42k: parsedStrava.best42k,
            weeklyKmAvg: parsedStrava.weeklyKmAvg,
            longestRunKm: parsedStrava.longestRunKm,
            recommendedVDOT: parsedStrava.recommendedVDOT,
          });
        setCalibration(cal);
        if (!savedMethod) {
          setInputMethod('strava');
        }
      }
    } catch {
      // ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist changes to 5K time
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(TIME_STORAGE_KEY, String(timeSeconds));
    } catch {
      // ignore
    }
  }, [timeSeconds, hydrated]);

  // Persist changes to terrain
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(TERRAIN_STORAGE_KEY, terrain);
    } catch {
      // ignore
    }
  }, [terrain, hydrated]);

  const vdot = calculateVDOT(timeSeconds);
  const formatted5k = formatTime(timeSeconds);

  const handleCopyWhatsApp = () => {
    const currentTerrain = TERRAINS.find((t) => t.id === terrain) || TERRAINS[0];
    const activeCal = calibration && useStravaCalibration ? calibration : null;
    const paces = getStandardPaces(timeSeconds, currentTerrain.multiplier, activeCal);
    const intervals = getIntervals(timeSeconds, currentTerrain.multiplier);

    let text = `🏃‍♂️ *MIS RITMOS DE ENTRENAMIENTO - TEST 5K (${formatted5k})*\n`;
    text += `📊 *VDOT:* ${vdot.toFixed(1)} | *Terreno:* ${currentTerrain.name} (${currentTerrain.badge})`;
    if (hrProfile) {
      text += ` | ❤️ *FC Máx:* ${hrProfile.maxHrRecorded} ppm`;
    }
    if (activeCal) {
      text += `\n⚙️ *Calibración Strava:* ${activeCal.profileLabel} (Fatiga Riegel ${activeCal.personalRiegelExponent.toFixed(2)})`;
    }
    text += `\n\n`;

    text += `🟢 *1. RODAJES CONTINUOS (Z2, FONDO Y UMBRAL)*\n`;
    text += `• ${paces[0].name}: ${paces[0].paceFormatted} (${paces[0].badge})${hrProfile ? ` [${hrProfile.zones.z2}]` : ''}\n`;
    text += `• ${paces[1].name}: ${paces[1].paceFormatted} (${paces[1].badge})${hrProfile ? ` [${hrProfile.zones.fondo}]` : ''}\n`;
    text += `• ${paces[2].name}: ${paces[2].paceFormatted} (${paces[2].badge})${hrProfile ? ` [${hrProfile.zones.tempo}]` : ''}\n\n`;

    text += `🔴 *2. SERIES Y PASADAS POR DISTANCIA (200M A 2000M)*${hrProfile ? ` (${hrProfile.zones.vo2max})` : ''}\n`;
    intervals.forEach((inv) => {
      text += `• ${inv.distance}: ${inv.repTimeFormatted} por pasada (${inv.paceFormatted})\n`;
    });
    text += `• Cuestas cortas: 8-10 seg en subida fuerte\n\n`;

    text += `🏆 *3. RITMOS Y TIEMPOS DE CARRERA (8K A 42K)*\n`;
    paces.slice(3).forEach((p) => {
      const cleanName = p.name.replace('Ritmo Objetivo ', '');
      const meta = p.totalTimeFormatted ? ` [Meta: ${p.totalTimeFormatted}]` : '';
      text += `• ${cleanName}: ${p.paceFormatted}${meta}\n`;
    });
    text += `\n`;

    text += `💡 *Regla de oro: si en Z2 Suave te cuesta hablar, bajá un poco el ritmo.*`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }

    setCopiedWhatsApp(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00df89', '#05b06c', '#ffffff'],
      });
    } catch {
      // fallback
    }

    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleDownloadImage = async () => {
    const node = document.getElementById('pace-table-capture');
    if (!node) return;

    try {
      setDownloadingImage(true);
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0f171d',
        filter: (el) => {
          if (el instanceof HTMLElement && el.dataset?.exportIgnore === 'true') {
            return false;
          }
          return true;
        },
      });

      const safe5k = formatted5k.replace(':', 'm') + 's';
      const link = document.createElement('a');
      link.download = `tabla-ritmos-5k-${safe5k}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen:', err);
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleInputMethodChange = (method: 'manual' | 'strava') => {
    setInputMethod(method);
    try {
      localStorage.setItem(METHOD_STORAGE_KEY, method);
    } catch {
      // ignore
    }
    if (method === 'manual') {
      setUseStravaCalibration(false);
    } else {
      setUseStravaCalibration(true);
      // If we already have a saved Strava summary in localStorage, apply its recommended 5K time
      try {
        const savedStrava = localStorage.getItem(STRAVA_STORAGE_KEY);
        if (savedStrava) {
          const parsedStrava: StravaAnalysisSummary = JSON.parse(savedStrava);
          if (parsedStrava.recommended5kSeconds) {
            setTimeSeconds(parsedStrava.recommended5kSeconds);
          }
        }
      } catch {
        // ignore
      }
    }
  };

  const handleApplyStrava5k = (
    newSeconds: number,
    detectedHr?: HeartRateProfile | null,
    detectedCalibration?: StravaCalibration | null
  ) => {
    setTimeSeconds(newSeconds);
    setUseStravaCalibration(true);
    if (detectedHr !== undefined) {
      setHrProfile(detectedHr);
    }
    if (detectedCalibration !== undefined) {
      setCalibration(detectedCalibration);
    }
  };

  return (
    <main className="min-h-screen bg-[#070c0f] px-3 sm:px-5 lg:px-6 py-5 max-w-[1860px] mx-auto flex flex-col justify-between">
      <div className="space-y-5">
        {/* Top Header + 3-Step Guide */}
        <Header vdot={vdot} fiveKmFormatted={formatted5k} />

        {/* Four-Column Overall Layout on Desktop (Col 1: Reference Input [3/12], Cols 2-4: PaceTable [9/12 split in 3]) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Column 1 (lg:4, xl:3 cols): Unified Reference Input (Manual 5K or Strava) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">
            <TestInput
              inputMethod={inputMethod}
              onInputMethodChange={handleInputMethodChange}
              timeSeconds={timeSeconds}
              onTimeChange={setTimeSeconds}
              onApplyStrava5k={handleApplyStrava5k}
              onHrProfileDetected={setHrProfile}
              onCalibrationDetected={setCalibration}
              onStrengthSynergyDetected={setStrengthSynergy}
            />
          </div>

          {/* Columns 2, 3 & 4 (lg:8, xl:9 cols): Always-visible Pace Table with 3 columns (1. Rodajes | 2. Series | 3. Carreras) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">
            <PaceTable
              fiveKmSeconds={timeSeconds}
              terrainType={terrain}
              onTerrainChange={setTerrain}
              onCopyWhatsApp={handleCopyWhatsApp}
              copiedWhatsApp={copiedWhatsApp}
              onDownloadImage={handleDownloadImage}
              downloadingImage={downloadingImage}
              hrProfile={inputMethod === 'strava' ? hrProfile : null}
              calibration={calibration}
              strengthSynergy={inputMethod === 'strava' ? strengthSynergy : null}
              useStravaCalibration={inputMethod === 'strava'}
            />
          </div>
        </div>
      </div>

      {/* Footer with discreet methodological note */}
      <footer className="mt-12 pt-5 pb-4 border-t border-[#121c23] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#526b7b]">
        <span>
          Pensado para entrenar por sensaciones y cuidar tu base aeróbica.
        </span>
        <span className="font-mono text-[11px] text-[#455c6b]">
          Modelo fisiológico: Jack Daniels VDOT (VO2 = -4.6 + 0.18225·v + 0.000104·v²) + Proyección Riegel (D^1.06)
        </span>
      </footer>
    </main>
  );
}
