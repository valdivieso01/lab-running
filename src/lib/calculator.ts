// Jack Daniels VDOT & Riegel Running Pace Calculator (Based on 5K Test)

export interface TrainingPace {
  name: string;
  badge: string;
  badgeColor?: string;
  description: string;
  paceSecondsPerKm: number; // in seconds/km
  paceFormatted: string; // MM:SS/km
  totalTimeFormatted?: string;
  repTimeSeconds?: number;
  repTimeFormatted?: string;
  notes?: string;
  deltaSecondsPerKm?: number; // difference vs standard Daniels/Riegel when Strava calibration is active
  standardPaceFormatted?: string;
}

export interface StravaCalibration {
  personalRiegelExponent: number; // e.g. 1.048 (fondista) vs 1.060 (estándar) vs 1.078 (explosivo/poco fondo)
  aerobicVdotAdjustment: number;  // difference between endurance VDOT (10K/21K) and 5K VDOT
  criticalSpeedPaceFormatted: string; // estimated Critical Speed (CS) pace
  profileType: 'fondista' | 'equilibrado' | 'explosivo';
  profileLabel: string;
  profileExplanation: string;
  weeklyKmAvg: number;
  longestRunKm: number;
}

export interface IntervalPace {
  distance: string;
  meters: number;
  paceSecondsPerKm: number;
  paceFormatted: string;
  percentageText: string;
  repTimeFormatted: string;
  restText: string;
}

export interface RaceProjection {
  name: string;
  distanceKm: number;
  distanceMeters: number;
  predictedSeconds: number;
  predictedTimeFormatted: string;
  paceSecondsPerKm: number;
  paceFormatted: string;
}

export type TerrainType = 'calle' | 'sendero' | 'tecnico' | 'montana';

export interface TerrainConfig {
  id: TerrainType;
  name: string;
  description: string;
  multiplier: number;
  badge: string;
}

export const PRESET_TIMES = [
  '18:00', '19:00', '20:00', '21:00', '22:00',
  '22:30', '23:00', '23:30', '24:00', '24:30',
  '25:00', '25:30', '26:00', '27:00', '28:00',
  '29:00', '30:00', '32:00', '35:00', '38:00',
  '40:00',
];

export const TERRAINS: TerrainConfig[] = [
  {
    id: 'calle',
    name: 'Calle',
    description: 'Asfalto o pista llana',
    multiplier: 1.0,
    badge: 'x1.00',
  },
  {
    id: 'sendero',
    name: 'Sendero suave',
    description: 'Tierra firme, desnivel leve (+5%)',
    multiplier: 1.06,
    badge: 'x1.06',
  },
  {
    id: 'tecnico',
    name: 'Trail técnico',
    description: 'Piedra, raíz y desnivel medio (+12%)',
    multiplier: 1.12,
    badge: 'x1.12',
  },
  {
    id: 'montana',
    name: 'Montaña fuerte',
    description: 'Trepadas duras >30m+/km (+18%)',
    multiplier: 1.18,
    badge: 'x1.18',
  },
];

/**
 * Convert seconds into MM:SS or HH:MM:SS format
 */
export function formatTime(totalSeconds: number, forceHours: boolean = false): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '0:00';
  const total = Math.round(totalSeconds);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0 || forceHours) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse MM:SS or M:SS string into total seconds
 */
export function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.trim().split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0] * 60;
  }
  return 0;
}

/**
 * Jack Daniels VDOT formula based on 5000m test time in seconds
 */
export function calculateVDOT(fiveKmSeconds: number): number {
  if (fiveKmSeconds <= 0) return 0;
  const tMin = fiveKmSeconds / 60;
  const vMetersPerMin = 5000 / tMin;

  const vo2Cost = -4.60 + 0.182258 * vMetersPerMin + 0.000104 * Math.pow(vMetersPerMin, 2);
  const fractionVo2 =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * tMin) +
    0.2989558 * Math.exp(-0.1932605 * tMin);

  const vdot = vo2Cost / fractionVo2;
  return Math.round(vdot * 10) / 10;
}

/**
 * Given target VO2 (fraction of VDOT), solve quadratic equation for velocity (m/min)
 * Returns pace in seconds per kilometer
 */
export function velocityFromVO2(targetVO2: number): number {
  const a = 0.000104;
  const b = 0.182258;
  const c = -(4.60 + targetVO2);

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 0;

  const vMetersPerMin = (-b + Math.sqrt(discriminant)) / (2 * a);
  const minPerKm = 1000 / vMetersPerMin;
  return minPerKm * 60; // seconds per km
}

/**
 * Riegel race time predictor: T2 = T1 * (D2 / D1)^exponent (default 1.06)
 */
export function riegelTime(
  t1Seconds: number,
  d1Meters: number,
  d2Meters: number,
  exponent: number = 1.06
): number {
  return t1Seconds * Math.pow(d2Meters / d1Meters, exponent);
}

export function riegelPace(
  t1Seconds: number,
  d1Meters: number,
  d2Meters: number,
  exponent: number = 1.06
): number {
  const t2Seconds = riegelTime(t1Seconds, d1Meters, d2Meters, exponent);
  return t2Seconds / (d2Meters / 1000); // sec/km
}

/**
 * Standard training paces derived from 5K Test (including more target distances: 8K, 10K, 15K, 21K, 42K).
 * When `calibration` (from Strava) is provided, adjusts the aerobic engine (Z2/Fondo/Tempo via Critical Speed/VDOT delta)
 * and uses the runner's personalized Riegel exponent + weekly volume readiness for 8K–42K projections.
 */
export function getStandardPaces(
  fiveKmSeconds: number,
  terrainMultiplier: number = 1.0,
  calibration?: StravaCalibration | null
): TrainingPace[] {
  const vdot = calculateVDOT(fiveKmSeconds);

  // Standard uncalibrated baseline (Daniels + Riegel 1.06)
  const stdZ2Flat = velocityFromVO2(vdot * 0.723);
  const stdFondoFlat = velocityFromVO2(vdot * 0.705);
  const stdTempoFlat = velocityFromVO2(vdot * 0.865);

  const std8kFlat = riegelPace(fiveKmSeconds, 5000, 8000, 1.06);
  const std10kFlat = riegelPace(fiveKmSeconds, 5000, 10000, 1.06);
  const std15kFlat = riegelPace(fiveKmSeconds, 5000, 15000, 1.06);
  const std21kFlat = riegelPace(fiveKmSeconds, 5000, 21097.5, 1.06);
  const std30kFlat = riegelPace(fiveKmSeconds, 5000, 30000, 1.06);
  const std42kFlat = riegelPace(fiveKmSeconds, 5000, 42195, 1.06);

  // Calibrated values (if Strava calibration is active)
  const aerobicVdot = calibration
    ? Math.max(20, vdot + Math.max(-2.0, Math.min(2.0, calibration.aerobicVdotAdjustment * 0.75)))
    : vdot;

  const riegelExp = calibration ? calibration.personalRiegelExponent : 1.06;

  // Vickers-style marathon/30K volume readiness safety adjustment if weekly volume or longest run is low
  let longDistanceVolumePenalty30k = 1.0;
  let longDistanceVolumePenalty42k = 1.0;
  if (calibration) {
    if (calibration.longestRunKm < 16 || calibration.weeklyKmAvg < 25) {
      longDistanceVolumePenalty30k = 1.015;
      longDistanceVolumePenalty42k = 1.03;
    } else if (calibration.longestRunKm >= 21 && calibration.weeklyKmAvg >= 40) {
      longDistanceVolumePenalty42k = 0.995;
    }
  }

  const z2SecFlat = velocityFromVO2(aerobicVdot * 0.723);
  const fondoSecFlat = velocityFromVO2(aerobicVdot * 0.705);
  const tempoSecFlat = velocityFromVO2(aerobicVdot * 0.865);

  const pace8kFlat = riegelPace(fiveKmSeconds, 5000, 8000, riegelExp);
  const pace10kFlat = riegelPace(fiveKmSeconds, 5000, 10000, riegelExp);
  const pace15kFlat = riegelPace(fiveKmSeconds, 5000, 15000, riegelExp);
  const pace21kFlat = riegelPace(fiveKmSeconds, 5000, 21097.5, riegelExp);
  const pace30kFlat = riegelPace(fiveKmSeconds, 5000, 30000, riegelExp) * longDistanceVolumePenalty30k;
  const pace42kFlat = riegelPace(fiveKmSeconds, 5000, 42195, riegelExp) * longDistanceVolumePenalty42k;

  const list: {
    name: string;
    badge: string;
    badgeColor?: string;
    description: string;
    flatSec: number;
    stdFlatSec: number;
    distanceKm?: number;
  }[] = [
    {
      name: 'Rodaje suave Z2 / Regenerativo',
      badge: '74%',
      badgeColor: 'emerald',
      description: '65-75% • Charla cómoda • Base aeróbica',
      flatSec: z2SecFlat,
      stdFlatSec: stdZ2Flat,
    },
    {
      name: 'Fondo largo',
      badge: '79%',
      badgeColor: 'emerald',
      description: '68-70% • 60-120min • Terminar entero',
      flatSec: fondoSecFlat,
      stdFlatSec: stdFondoFlat,
    },
    {
      name: 'Tempo / Umbral',
      badge: '87%',
      badgeColor: 'emerald',
      description: '87-88% • 20min incómodo pero controlado • 1x semana',
      flatSec: tempoSecFlat,
      stdFlatSec: stdTempoFlat,
    },
    {
      name: 'Ritmo Objetivo 8K',
      badge: calibration ? `Riegel ${riegelExp.toFixed(2)}` : 'Riegel',
      badgeColor: 'teal',
      description: 'Esfuerzo de carrera 8K • Controlado',
      flatSec: pace8kFlat,
      stdFlatSec: std8kFlat,
      distanceKm: 8,
    },
    {
      name: 'Ritmo Objetivo 10K',
      badge: calibration ? `Riegel ${riegelExp.toFixed(2)}` : 'Riegel',
      badgeColor: 'teal',
      description: 'Esfuerzo de carrera 10K • Ritmo sostenido',
      flatSec: pace10kFlat,
      stdFlatSec: std10kFlat,
      distanceKm: 10,
    },
    {
      name: 'Ritmo Objetivo 15K',
      badge: calibration ? `Riegel ${riegelExp.toFixed(2)}` : 'Riegel',
      badgeColor: 'teal',
      description: 'Esfuerzo de carrera 15K • Progresivo',
      flatSec: pace15kFlat,
      stdFlatSec: std15kFlat,
      distanceKm: 15,
    },
    {
      name: 'Ritmo Objetivo 21K (Media Maratón)',
      badge: calibration ? `Riegel ${riegelExp.toFixed(2)}` : 'Riegel',
      badgeColor: 'teal',
      description: 'Esfuerzo de Media Maratón • Resistencia aeróbica',
      flatSec: pace21kFlat,
      stdFlatSec: std21kFlat,
      distanceKm: 21.0975,
    },
    {
      name: 'Ritmo Objetivo 30K (Trail / Pre-Maratón)',
      badge: calibration ? `Riegel ${riegelExp.toFixed(2)}` : 'Riegel',
      badgeColor: 'teal',
      description: 'Esfuerzo específico 30K • Fondo específico',
      flatSec: pace30kFlat,
      stdFlatSec: std30kFlat,
      distanceKm: 30,
    },
    {
      name: 'Ritmo Objetivo 42K (Maratón)',
      badge: calibration ? `Riegel ${riegelExp.toFixed(2)}` : 'Riegel',
      badgeColor: 'teal',
      description: 'Esfuerzo de Maratón • Economía y glucógeno',
      flatSec: pace42kFlat,
      stdFlatSec: std42kFlat,
      distanceKm: 42.195,
    },
  ];

  return list.map((item) => {
    const adjustedSec = item.flatSec * terrainMultiplier;
    const stdAdjustedSec = item.stdFlatSec * terrainMultiplier;
    const totalSec = item.distanceKm ? adjustedSec * item.distanceKm : undefined;
    const deltaSec = Math.round(adjustedSec) - Math.round(stdAdjustedSec);

    return {
      name: item.name,
      badge: item.badge,
      badgeColor: item.badgeColor,
      description: item.description,
      paceSecondsPerKm: adjustedSec,
      paceFormatted: `${formatTime(adjustedSec)}/km`,
      totalTimeFormatted: totalSec ? formatTime(totalSec) : undefined,
      deltaSecondsPerKm: calibration ? deltaSec : 0,
      standardPaceFormatted: `${formatTime(stdAdjustedSec)}/km`,
    };
  });
}

/**
 * VO2max intervals derived from 5K Test (200m up to 2000m)
 */
export function getIntervals(fiveKmSeconds: number, terrainMultiplier: number = 1.0): IntervalPace[] {
  const fiveKmPaceSec = fiveKmSeconds / 5;

  const intervalConfigs = [
    { distance: '200m', meters: 200, factor: 0.855, pct: '108%' },
    { distance: '300m', meters: 300, factor: 0.878, pct: '106%' },
    { distance: '400m', meters: 400, factor: 0.892, pct: '104%' },
    { distance: '500m', meters: 500, factor: 0.915, pct: '101%' },
    { distance: '600m', meters: 600, factor: 0.925, pct: '102%' },
    { distance: '800m', meters: 800, factor: 0.935, pct: '102%' },
    { distance: '1000m', meters: 1000, factor: 0.951, pct: '100%' },
    { distance: '1200m', meters: 1200, factor: 0.967, pct: '98%' },
    { distance: '1600m', meters: 1600, factor: 0.980, pct: '97%' },
    { distance: '2000m', meters: 2000, factor: 0.992, pct: '96%' },
  ];

  return intervalConfigs.map((cfg) => {
    const flatPaceSec = fiveKmPaceSec * cfg.factor;
    const adjustedPaceSec = flatPaceSec * terrainMultiplier;
    const repTimeSec = adjustedPaceSec * (cfg.meters / 1000);

    return {
      distance: cfg.distance,
      meters: cfg.meters,
      paceSecondsPerKm: adjustedPaceSec,
      paceFormatted: `${formatTime(adjustedPaceSec)}/km`,
      percentageText: cfg.pct,
      repTimeFormatted: formatTime(repTimeSec),
      restText: 'pausas 1:1',
    };
  });
}
