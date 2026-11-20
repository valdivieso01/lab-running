// Pacing Strategy & Splits Engine for Lab Running
import { formatTime } from './calculator';

export type StrategyType = 'negative' | 'even' | 'cautious';

export type RaceDistance = '5k' | '10k' | '21k' | '42k';

export interface RaceDistanceConfig {
  id: RaceDistance;
  name: string;
  nameEn: string;
  distanceKm: number;
  label: string;
}

export const RACE_DISTANCES: RaceDistanceConfig[] = [
  { id: '5k', name: '5K', nameEn: '5K', distanceKm: 5.0, label: '5 km' },
  { id: '10k', name: '10K', nameEn: '10K', distanceKm: 10.0, label: '10 km' },
  { id: '21k', name: 'Media Maratón (21K)', nameEn: 'Half Marathon (21K)', distanceKm: 21.0975, label: '21.1 km' },
  { id: '42k', name: 'Maratón (42K)', nameEn: 'Marathon (42K)', distanceKm: 42.195, label: '42.2 km' },
];

export interface StrategyOption {
  id: StrategyType;
  nameEs: string;
  nameEn: string;
  badgeEs: string;
  badgeEn: string;
  descriptionEs: string;
  descriptionEn: string;
  tagColor: string;
}

export const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    id: 'negative',
    nameEs: 'Negative Split (Recomendado)',
    nameEn: 'Negative Split (Recommended)',
    badgeEs: 'Táctica Élite',
    badgeEn: 'Elite Tactic',
    descriptionEs: 'Iniciás 2-3% más suave en el primer tercio para preservar glucógeno, ritmo medio en el segundo tercio y remate fuerte en el último tercio.',
    descriptionEn: 'Start 2-3% easier in the first third to preserve glycogen, lock into cruise pace in the middle, and push strong in the final third.',
    tagColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'even',
    nameEs: 'Ritmo Parejo (Even Pace)',
    nameEn: 'Even Pace (Metronome)',
    badgeEs: 'Constante',
    badgeEn: 'Steady',
    descriptionEs: 'Mantenés el mismo ritmo exacto por kilómetro desde la largada hasta la meta. Ideal para circuitos 100% llanos sin viento.',
    descriptionEn: 'Hold the exact same pace per kilometer from gun to tape. Ideal for flat courses without headwinds.',
    tagColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
  },
  {
    id: 'cautious',
    nameEs: 'Estrategia Progresiva / Con Cuestas',
    nameEn: 'Progressive / Rolling Hills',
    badgeEs: 'Circuito Desafiante',
    badgeEn: 'Challenging Course',
    descriptionEs: 'Distribución adaptada para carreras con desniveles o para corredores debutantes que priorizan terminar con reservas.',
    descriptionEn: 'Pacing adapted for rolling hills or debut runners who prioritize finishing with reserves in the tank.',
    tagColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
  },
];

export interface SplitCheckpoint {
  km: number;
  label: string;
  segmentDistanceKm: number;
  segmentPaceSec: number;
  segmentPaceFormatted: string;
  elapsedSec: number;
  elapsedTimeFormatted: string;
  tacticalCueEs: string;
  tacticalCueEn: string;
  nutritionCueEs?: string;
  nutritionCueEn?: string;
  nutritionType?: 'water' | 'gel' | 'caffeine';
}

/**
 * Calculates kilometer or 5K-block splits for a given distance and target time in seconds.
 */
export function calculateRaceSplits(
  distanceKm: number,
  targetTimeSeconds: number,
  strategy: StrategyType,
  granularity: 'every-km' | 'milestones' = 'every-km'
): SplitCheckpoint[] {
  const avgPaceSec = targetTimeSeconds / distanceKm;
  const isLongRace = distanceKm > 15;
  const useMilestones = granularity === 'milestones' && isLongRace;

  // Define distance segments
  const checkpointsKm: number[] = [];
  if (useMilestones) {
    let current = 5;
    while (current < distanceKm) {
      checkpointsKm.push(current);
      current += 5;
    }
    checkpointsKm.push(Math.round(distanceKm * 10) / 10);
  } else {
    const fullKms = Math.floor(distanceKm);
    for (let i = 1; i <= fullKms; i++) {
      checkpointsKm.push(i);
    }
    if (distanceKm > fullKms) {
      checkpointsKm.push(Math.round(distanceKm * 10) / 10);
    }
  }

  const splits: SplitCheckpoint[] = [];
  let elapsedSec = 0;
  let prevKm = 0;

  checkpointsKm.forEach((km) => {
    const segmentDist = km - prevKm;
    const progressRatio = km / distanceKm; // 0.0 to 1.0

    // Pace adjustment multiplier depending on strategy
    let paceMultiplier = 1.0;

    if (strategy === 'negative') {
      if (progressRatio <= 0.33) {
        // First third: 2.5% slower
        paceMultiplier = 1.025;
      } else if (progressRatio <= 0.67) {
        // Middle third: target pace
        paceMultiplier = 1.00;
      } else {
        // Final third: 2.5% faster
        paceMultiplier = 0.975;
      }
    } else if (strategy === 'cautious') {
      if (progressRatio <= 0.25) {
        paceMultiplier = 1.015;
      } else if (progressRatio <= 0.75) {
        paceMultiplier = 1.00;
      } else {
        paceMultiplier = 0.985;
      }
    }

    const segmentPaceSec = avgPaceSec * paceMultiplier;
    const segmentTimeSec = segmentPaceSec * segmentDist;
    elapsedSec += segmentTimeSec;

    // Tactical cues
    let tacticalCueEs = 'Ritmo crucero constante.';
    let tacticalCueEn = 'Steady cruise pace.';
    if (progressRatio <= 0.25) {
      tacticalCueEs = 'Cabeza fría. Dejá pasar corredores y no te cebes.';
      tacticalCueEn = 'Stay cool. Let overeager runners go; keep your heart rate in check.';
    } else if (progressRatio <= 0.60) {
      tacticalCueEs = 'Encontrá tu cadencia, postura erguida y respiración rítmica.';
      tacticalCueEn = 'Lock into your cadence, tall posture, rhythmic breathing.';
    } else if (progressRatio <= 0.85) {
      tacticalCueEs = 'Foco mental. Aquí se construye tu marca personal.';
      tacticalCueEn = 'Mental focus. This is where your personal best is forged.';
    } else {
      tacticalCueEs = 'Vaciá el tanque: cambio de ritmo progresivo y remate.';
      tacticalCueEn = 'Empty the tank: pick up the stride and kick to the line.';
    }

    // Nutrition cues
    let nutritionCueEs: string | undefined;
    let nutritionCueEn: string | undefined;
    let nutritionType: 'water' | 'gel' | 'caffeine' | undefined;

    if (distanceKm >= 10 && km >= 5 && km <= 6) {
      nutritionCueEs = '💧 Sorbos de agua / sales';
      nutritionCueEn = '💧 Sips of water / electrolytes';
      nutritionType = 'water';
    } else if (distanceKm >= 21) {
      if (km >= 7 && km <= 8) {
        nutritionCueEs = '⚡ Gel #1 (con agua)';
        nutritionCueEn = '⚡ Gel #1 (with water)';
        nutritionType = 'gel';
      } else if (km >= 14 && km <= 15) {
        nutritionCueEs = '⚡ Gel #2 (energía para el cierre)';
        nutritionCueEn = '⚡ Gel #2 (energy for the finish)';
        nutritionType = 'gel';
      } else if (distanceKm >= 42) {
        if (km >= 21 && km <= 22) {
          nutritionCueEs = '⚡ Gel #3 (mitad de carrera)';
          nutritionCueEn = '⚡ Gel #3 (halfway fuel)';
          nutritionType = 'gel';
        } else if (km >= 28 && km <= 29) {
          nutritionCueEs = '⚡ Gel #4 (anticipar el km 30)';
          nutritionCueEn = '⚡ Gel #4 (fuel before km 30)';
          nutritionType = 'gel';
        } else if (km >= 35 && km <= 36) {
          nutritionCueEs = '⚡ Gel #5 (con cafeína para el remate)';
          nutritionCueEn = '⚡ Gel #5 (caffeine boost for final push)';
          nutritionType = 'caffeine';
        }
      }
    }

    splits.push({
      km,
      label: km === distanceKm ? `Meta (${km}k)` : `Km ${km}`,
      segmentDistanceKm: segmentDist,
      segmentPaceSec,
      segmentPaceFormatted: formatTime(segmentPaceSec),
      elapsedSec,
      elapsedTimeFormatted: formatTime(elapsedSec, distanceKm >= 21),
      tacticalCueEs,
      tacticalCueEn,
      nutritionCueEs,
      nutritionCueEn,
      nutritionType,
    });

    prevKm = km;
  });

  return splits;
}
