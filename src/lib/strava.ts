// Strava CSV Parser, Outlier Filter, Best Efforts & Heart Rate Zones Analyzer
import { calculateVDOT, formatTime, StravaCalibration, velocityFromVO2 } from './calculator';

export interface StravaActivity {
  id: string;
  name: string;
  date: string;
  timestamp: number;
  type: string;
  distanceKm: number;
  movingTimeSec: number;
  paceSecPerKm: number;
  paceFormatted: string;
  elevationGain: number;
  avgHr: number;
  maxHr: number;
  estimatedVDOT: number;
  isOutlier: boolean;
  isShortInterval: boolean;
  outlierReason?: string;
}

export interface BestEffort {
  label: string;
  activityName: string;
  date: string;
  distanceKm: number;
  timeFormatted: string;
  paceFormatted: string;
  vdot: number;
  equivalent5kSeconds: number;
  avgHr?: number;
}

export interface HeartRateProfile {
  maxHrRecorded: number;
  avgEasyHr: number; // from runs at comfortable pace
  avgThresholdHr: number; // from fast runs
  zones: {
    z2: string;       // 70-77% FCmax
    fondo: string;    // 72-79% FCmax
    ritmoCarrera: string; // 82-88% FCmax
    tempo: string;    // 87-91% FCmax
    vo2max: string;   // 93-98% FCmax
  };
}

export interface StrengthSynergyProfile {
  totalStrengthSessions: number;
  weeklyStrengthSessions: number;
  avgDurationMinutes: number;
  crossTrainingCount: number;
  strengthBeforeQualityCount: number;
  strengthBeforeLongRunCount: number;
  status: 'optimo' | 'atencion_series' | 'atencion_fondos' | 'bajo_volumen';
  headline: string;
  summaryText: string;
  recommendationText: string;
}

export interface StravaAnalysisSummary {
  totalActivitiesParsed: number;
  runsCount: number;
  validContinuousRunsCount: number;
  shortIntervalsCount: number;
  outliersCount: number;
  weeklyKmAvg: number;
  longestRunKm: number;
  fastestPaceFormatted: string;
  averagePaceFormatted: string;
  bestEstimatedVDOT: number;
  recommendedVDOT: number;
  recommended5kSeconds: number;
  recommended5kTimeFormatted: string;
  best5k: BestEffort | null;
  best10k: BestEffort | null;
  best21k: BestEffort | null;
  hrProfile: HeartRateProfile | null;
  calibration?: StravaCalibration | null;
  strengthSynergy?: StrengthSynergyProfile | null;
  recentActivities: StravaActivity[];
}

/**
 * Computes physiological calibration (Personal Riegel Exponent + Critical Speed / Aerobic Engine adjustment)
 * from Strava best efforts, weekly volume, and longest run.
 */
export function computeStravaCalibration(summary: {
  best5k: BestEffort | null;
  best10k: BestEffort | null;
  best21k: BestEffort | null;
  weeklyKmAvg: number;
  longestRunKm: number;
  recommendedVDOT: number;
}): StravaCalibration {
  const { best5k, best10k, best21k, weeklyKmAvg, longestRunKm, recommendedVDOT } = summary;

  // 1. Volume-based Riegel exponent baseline (Vickers-Vertosick model)
  let volumeExponent = 1.06;
  if (weeklyKmAvg >= 45 || (weeklyKmAvg >= 30 && longestRunKm >= 20)) {
    volumeExponent = 1.049;
  } else if (weeklyKmAvg >= 24 && longestRunKm >= 15) {
    volumeExponent = 1.055;
  } else if (weeklyKmAvg < 18 || longestRunKm < 11) {
    volumeExponent = 1.076;
  }

  // 2. Empirical multi-distance Riegel exponent if runner has both 5K and 10K/21K best efforts
  let personalRiegelExponent = volumeExponent;
  const longEffort = best21k || best10k;

  if (best5k && longEffort && longEffort.distanceKm > best5k.distanceKm + 3) {
    // Only use empirical comparison if the long effort was a representative effort (within 3.5 VDOT points of 5K)
    if (longEffort.vdot >= best5k.vdot - 3.5) {
      const t5kApprox = best5k.equivalent5kSeconds * Math.pow(best5k.distanceKm / 5, 1.06);
      const tLongApprox = longEffort.equivalent5kSeconds * Math.pow(longEffort.distanceKm / 5, 1.06);
      const empiricalExp =
        Math.log(tLongApprox / t5kApprox) / Math.log(longEffort.distanceKm / best5k.distanceKm);

      if (!isNaN(empiricalExp) && empiricalExp > 1.01 && empiricalExp < 1.14) {
        personalRiegelExponent = empiricalExp * 0.65 + volumeExponent * 0.35;
      }
    }
  }

  // Clamp exponent to physiological bounds [1.040, 1.088]
  personalRiegelExponent = Math.round(Math.max(1.04, Math.min(1.088, personalRiegelExponent)) * 1000) / 1000;

  // 3. Aerobic Engine / Critical Speed adjustment (comparing 10K/21K VDOT vs 5K VDOT)
  let aerobicVdotAdjustment = 0;
  const enduranceVdot = Math.max(best21k?.vdot || 0, best10k?.vdot || 0);
  if (best5k && enduranceVdot > 0 && enduranceVdot >= best5k.vdot - 3.0) {
    aerobicVdotAdjustment = Math.round((enduranceVdot - best5k.vdot) * 10) / 10;
  } else if (weeklyKmAvg >= 40 && longestRunKm >= 20) {
    aerobicVdotAdjustment = 0.6;
  } else if (weeklyKmAvg < 18 && longestRunKm < 12) {
    aerobicVdotAdjustment = -0.8;
  }

  aerobicVdotAdjustment = Math.max(-2.0, Math.min(2.0, aerobicVdotAdjustment));

  const csVdot = Math.max(20, recommendedVDOT + aerobicVdotAdjustment * 0.75);
  const csSecPerKm = velocityFromVO2(csVdot * 0.875);
  const criticalSpeedPaceFormatted = `${formatTime(csSecPerKm)}/km`;

  // 4. Classify Runner Profile
  let profileType: 'fondista' | 'equilibrado' | 'explosivo' = 'equilibrado';
  let profileLabel = 'Equilibrado (Velocidad y Fondo parejos)';
  let profileExplanation = `Tu relación entre 5K, distancias largas y volumen (${weeklyKmAvg} km/sem) sigue de cerca la curva clásica (factor Riegel ${personalRiegelExponent.toFixed(2)}).`;

  if (personalRiegelExponent <= 1.054 || aerobicVdotAdjustment >= 0.6) {
    profileType = 'fondista';
    profileLabel = 'Fondista / Alta Resistencia';
    profileExplanation = `Sostenés el ritmo en distancias largas mejor que el promedio (factor de fatiga ${personalRiegelExponent.toFixed(2)} vs 1.06 de Riegel y fondo de ${longestRunKm} km). Ajustamos tu Umbral y tus ritmos de 10K a 42K a tu resistencia aeróbica real.`;
  } else if (personalRiegelExponent >= 1.068 || aerobicVdotAdjustment <= -0.7) {
    profileType = 'explosivo';
    profileLabel = 'Velocista / Mediofondo';
    profileExplanation = `Hoy tenés más chispa en 5K que volumen acumulado para largas distancias (factor ${personalRiegelExponent.toFixed(2)} vs 1.06 de Riegel). Ajustamos 21K y 42K a ritmos más prudentes y seguros.`;
  }

  return {
    personalRiegelExponent,
    aerobicVdotAdjustment,
    criticalSpeedPaceFormatted,
    profileType,
    profileLabel,
    profileExplanation,
    weeklyKmAvg,
    longestRunKm,
  };
}

/**
 * Split CSV line taking quotes into account
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parse Spanish or English Strava dates into timestamp (ms)
 * e.g. "28 oct 2026, 10:37:58 p.m." or "14 sept 2026, 10:48:44 p.m."
 */
function parseStravaDate(dateStr: string): number {
  if (!dateStr) return 0;
  const clean = dateStr.toLowerCase().replace(/\./g, '').trim();
  const monthsEs: Record<string, number> = {
    ene: 0, enero: 0, jan: 0,
    feb: 1, febrero: 1,
    mar: 2, marzo: 2,
    abr: 3, abril: 3, apr: 3,
    may: 4, mayo: 4,
    jun: 5, junio: 5,
    jul: 6, julio: 6,
    ago: 7, agosto: 7, aug: 7,
    sep: 8, sept: 8, septiembre: 8,
    oct: 9, octubre: 9,
    nov: 10, noviembre: 10,
    dic: 11, diciembre: 11, dec: 11,
  };

  // Match pattern: DD MMM YYYY
  const match = clean.match(/(\d{1,2})\s+([a-záéíóú]+)\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2];
    const year = parseInt(match[3], 10);
    const month = monthsEs[monthName];
    if (month !== undefined) {
      return new Date(year, month, day).getTime();
    }
  }

  const fallback = Date.parse(dateStr);
  return isNaN(fallback) ? 0 : fallback;
}

/**
 * Parses activities.csv exported from Strava
 */
export function parseStravaCSV(csvContent: string): StravaAnalysisSummary {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('El archivo CSV está vacío o no contiene suficientes filas.');
  }
  if (lines.length > 20000) {
    throw new Error('El archivo contiene más de 20.000 filas. Por seguridad y rendimiento del navegador, verificá que sea el activities.csv de Strava.');
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/['"]/g, '').trim());

  const findCol = (candidates: string[], startFrom: number = 0): number => {
    for (let i = startFrom; i < headers.length; i++) {
      if (candidates.some((c) => headers[i] === c || headers[i].includes(c))) {
        return i;
      }
    }
    return -1;
  };

  const typeIdx = findCol(['tipo de actividad', 'activity type', 'type']);
  const timeMovingIdx = findCol(['tiempo en movimiento', 'moving time']);
  const timeElapsedIdx = findCol(['tiempo transcurrido', 'elapsed time']);
  const timeIdx = timeMovingIdx !== -1 ? timeMovingIdx : timeElapsedIdx;

  // Prefer the Distance column in meters (appears after moving time in Strava exports)
  let distMetersIdx = timeMovingIdx !== -1 ? findCol(['distancia', 'distance'], timeMovingIdx) : -1;
  const distFirstIdx = findCol(['distancia', 'distance']);
  if (distMetersIdx === -1) distMetersIdx = distFirstIdx;

  if (typeIdx === -1 && distMetersIdx === -1 && distFirstIdx === -1) {
    throw new Error('El archivo CSV no parece ser un export de Strava (no se encontraron columnas de tipo de actividad ni distancia).');
  }

  const dateIdx = findCol(['fecha de la actividad', 'activity date', 'fecha', 'date']);
  const nameIdx = findCol(['nombre de la actividad', 'activity name', 'nombre', 'name']);
  const elevIdx = findCol(['desnivel positivo', 'elevation gain']);
  const maxSpeedIdx = findCol(['velocidad máxima', 'max speed']);
  const maxHrIdx = findCol(['frecuencia cardiaca máx', 'max heart rate']);
  const maxHrSecondIdx = maxHrIdx !== -1 ? findCol(['frecuencia cardiaca máx', 'max heart rate'], maxHrIdx + 1) : -1;
  const avgHrIdx = findCol(['frecuencia cardiaca promedio', 'average heart rate']);

  const activities: StravaActivity[] = [];
  const strengthActivities: { dateStr: string; timestamp: number; durationSec: number; name: string }[] = [];
  const crossActivities: { dateStr: string; timestamp: number; durationSec: number; type: string }[] = [];
  let runsCount = 0;
  let outliersCount = 0;
  let shortIntervalsCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 5) continue;

    const rawType = (typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx] : '').toLowerCase();
    const rawName = (nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : '').toLowerCase();
    const dateStr = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx].replace(/^"|"$/g, '') : '';
    const timestamp = parseStravaDate(dateStr);
    const movingTimeSecRaw = timeIdx !== -1 && cols[timeIdx] ? parseFloat(cols[timeIdx].replace(/,/g, '')) || 0 : 0;

    const isStrength =
      rawType.includes('pesas') ||
      rawType.includes('weight') ||
      rawType.includes('workout') ||
      rawType.includes('crossfit') ||
      rawType.includes('fuerza') ||
      rawType.includes('gimnasio') ||
      rawName.includes('pesas') ||
      rawName.includes('weight training') ||
      rawName.includes('gimnasio');

    const isCross =
      rawType.includes('ciclista') ||
      rawType.includes('ride') ||
      rawType.includes('natación') ||
      rawType.includes('swim') ||
      rawType.includes('elíptica') ||
      rawType.includes('elliptical');

    if (isStrength) {
      strengthActivities.push({
        dateStr,
        timestamp,
        durationSec: movingTimeSecRaw,
        name: nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].replace(/^"|"$/g, '') : 'Fuerza',
      });
      continue;
    }

    if (isCross) {
      crossActivities.push({
        dateStr,
        timestamp,
        durationSec: movingTimeSecRaw,
        type: cols[typeIdx] || 'Entrenamiento cruzado',
      });
      continue;
    }

    const isRun =
      rawType.includes('carrera') ||
      rawType.includes('run') ||
      rawType.includes('trail') ||
      rawType.includes('virtualrun');

    if (!isRun) continue;
    runsCount++;

    // Parse distance
    let rawDist = distMetersIdx !== -1 && cols[distMetersIdx] ? parseFloat(cols[distMetersIdx].replace(/,/g, '')) : 0;
    if ((isNaN(rawDist) || rawDist <= 0) && distFirstIdx !== -1 && cols[distFirstIdx]) {
      rawDist = parseFloat(cols[distFirstIdx].replace(/,/g, ''));
    }
    if (isNaN(rawDist) || rawDist <= 0) continue;

    // If rawDist > 100, it's in meters (e.g., 11012.9 -> 11.01 km). Otherwise it's already in km.
    const distanceKm = rawDist > 100 ? rawDist / 1000 : rawDist;

    const movingTimeSec = timeIdx !== -1 && cols[timeIdx] ? parseFloat(cols[timeIdx].replace(/,/g, '')) : 0;
    if (isNaN(movingTimeSec) || movingTimeSec <= 0) continue;

    const elapsedTimeSec =
      timeElapsedIdx !== -1 && cols[timeElapsedIdx]
        ? parseFloat(cols[timeElapsedIdx].replace(/,/g, '')) || movingTimeSec
        : movingTimeSec;

    const paceSecPerKm = movingTimeSec / distanceKm;
    const elevationGain = elevIdx !== -1 && cols[elevIdx] ? parseFloat(cols[elevIdx]) || 0 : 0;
    const maxSpeedMetersPerSec =
      maxSpeedIdx !== -1 && cols[maxSpeedIdx] ? parseFloat(cols[maxSpeedIdx]) || 0 : 0;

    let rawMaxHr = maxHrIdx !== -1 && cols[maxHrIdx] ? parseFloat(cols[maxHrIdx]) || 0 : 0;
    if (rawMaxHr <= 0 && maxHrSecondIdx !== -1 && cols[maxHrSecondIdx]) {
      rawMaxHr = parseFloat(cols[maxHrSecondIdx]) || 0;
    }
    const maxHr = Math.round(rawMaxHr);
    const avgHr = avgHrIdx !== -1 && cols[avgHrIdx] ? Math.round(parseFloat(cols[avgHrIdx]) || 0) : 0;

    // 1. Filter GPS outliers & paused/interval workouts
    const isMountainTrail = elevationGain / distanceKm > 25; // >25m+ per km
    const pauseRatio = movingTimeSec > 0 ? (elapsedTimeSec - movingTimeSec) / movingTimeSec : 0;

    let isOutlier = false;
    let isShortInterval = false;
    let outlierReason = '';

    if (paceSecPerKm < 150) {
      isOutlier = true;
      outlierReason = 'Ritmo < 2:30/km (error GPS)';
      outliersCount++;
    } else if (maxSpeedMetersPerSec > 9.5) {
      // >9.5 m/s = >34.2 km/h (<1:45/km spike): GPS teleportation glitch
      isOutlier = true;
      outlierReason = 'Salto brusco de GPS detectado';
      outliersCount++;
    } else if (paceSecPerKm < 260 && avgHr > 0 && avgHr < 156) {
      // Claiming sub-4:20/km pace while HR is in easy Z2 (<156 bpm) -> GPS distance jump
      isOutlier = true;
      outlierReason = 'Incoherencia GPS (ritmo rápido con pulso bajo)';
      outliersCount++;
    } else if (paceSecPerKm > 600 && !isMountainTrail) {
      isOutlier = true;
      outlierReason = 'Ritmo > 10:00/km (caminata)';
      outliersCount++;
    } else if (distanceKm < 4.5) {
      // Runs under 4.5 km are warmups, cooldowns, or single intervals
      isShortInterval = true;
      outlierReason = 'Serie corta / Entrada en calor (<4.5 km)';
      shortIntervalsCount++;
    } else if (pauseRatio > 0.12 && !isMountainTrail) {
      // More than 12% of total time was spent stopped (e.g., interval session with standing rests)
      isShortInterval = true;
      outlierReason = `Con pausas (${Math.round((elapsedTimeSec - movingTimeSec) / 60)} min detenido)`;
      shortIntervalsCount++;
    }

    // Estimate VDOT only for continuous runs >= 4.5 km on road/runnable terrain
    let estimatedVDOT = 0;
    if (!isOutlier && !isShortInterval) {
      const projected5kSec = movingTimeSec * Math.pow(5 / distanceKm, 1.06);
      estimatedVDOT = calculateVDOT(projected5kSec);
    }

    activities.push({
      id: `act-${i}`,
      name: nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].replace(/^"|"$/g, '') : `Carrera ${i}`,
      date: dateStr,
      timestamp,
      type: cols[typeIdx] || 'Carrera',
      distanceKm: Math.round(distanceKm * 100) / 100,
      movingTimeSec: Math.round(movingTimeSec),
      paceSecPerKm: Math.round(paceSecPerKm),
      paceFormatted: `${formatTime(paceSecPerKm)}/km`,
      elevationGain: Math.round(elevationGain),
      avgHr,
      maxHr,
      estimatedVDOT,
      isOutlier,
      isShortInterval,
      outlierReason,
    });
  }

  // Valid continuous runs (>= 4.5km, not GPS outlier)
  const validRuns = activities.filter((a) => !a.isOutlier && !a.isShortInterval && a.estimatedVDOT > 0);
  const latestValidTs = validRuns.length > 0 ? Math.max(...validRuns.map((r) => r.timestamp)) : 0;
  const oneYearMs = 365 * 24 * 3600 * 1000;

  // Detect Best Efforts by distance category (prioritizing last 12 months for current fitness)
  const findBestInRange = (minKm: number, maxKm: number, label: string): BestEffort | null => {
    const allInRange = validRuns.filter((r) => r.distanceKm >= minKm && r.distanceKm <= maxKm);
    if (allInRange.length === 0) return null;

    const recentInRange =
      latestValidTs > 0
        ? allInRange.filter((r) => r.timestamp > 0 && latestValidTs - r.timestamp <= oneYearMs)
        : [];
    const candidates = recentInRange.length > 0 ? recentInRange : allInRange;

    // Sort by highest VDOT (best performance for that distance)
    const best = [...candidates].sort((a, b) => b.estimatedVDOT - a.estimatedVDOT)[0];
    const eq5k = Math.round(best.movingTimeSec * Math.pow(5 / best.distanceKm, 1.06));
    return {
      label,
      activityName: best.name,
      date: best.date.split(',')[0] || best.date,
      distanceKm: best.distanceKm,
      timeFormatted: formatTime(best.movingTimeSec),
      paceFormatted: best.paceFormatted,
      vdot: best.estimatedVDOT,
      equivalent5kSeconds: eq5k,
      avgHr: best.avgHr > 0 ? best.avgHr : undefined,
    };
  };

  const best5k = findBestInRange(4.8, 6.5, 'Mejor 5K');
  const best10k = findBestInRange(9.5, 11.5, 'Mejor 10K');
  const best21k = findBestInRange(18.0, 23.0, 'Mejor 20K / 21K');

  // Longest run in history
  const longestRunKm =
    activities.length > 0
      ? Math.max(...activities.filter((a) => !a.isOutlier).map((a) => a.distanceKm))
      : 0;

  // Calculate Weekly Volume (last 28 days from the most recent activity)
  let weeklyKmAvg = 0;
  const datedRuns = activities.filter((a) => !a.isOutlier && a.timestamp > 0);
  if (datedRuns.length > 0) {
    const latestTs = Math.max(...datedRuns.map((a) => a.timestamp));
    const twentyEightDaysMs = 28 * 24 * 3600 * 1000;
    const recentMonthRuns = datedRuns.filter((a) => latestTs - a.timestamp <= twentyEightDaysMs);
    const totalRecentKm = recentMonthRuns.reduce((acc, r) => acc + r.distanceKm, 0);
    weeklyKmAvg = Math.round((totalRecentKm / 4) * 10) / 10;
  }

  // Heart Rate Profile extraction
  let hrProfile: HeartRateProfile | null = null;
  const runsWithHr = activities.filter((a) => !a.isOutlier && a.maxHr > 130 && a.avgHr > 100);
  if (runsWithHr.length > 0) {
    // Filter out single spike glitches (>210 bpm)
    const validMaxHrs = runsWithHr.map((r) => r.maxHr).filter((hr) => hr <= 208);
    const maxHrRecorded = validMaxHrs.length > 0 ? Math.max(...validMaxHrs) : 185;

    // Easy runs: continuous runs >= 6km with HR between 68% and 80% maxHR
    const easyRuns = validRuns.filter(
      (r) => r.avgHr >= maxHrRecorded * 0.68 && r.avgHr <= maxHrRecorded * 0.80
    );
    const avgEasyHr =
      easyRuns.length > 0
        ? Math.round(easyRuns.reduce((s, r) => s + r.avgHr, 0) / easyRuns.length)
        : Math.round(maxHrRecorded * 0.75);

    // Fast / Threshold runs: avgHr >= 85% maxHR
    const fastRuns = runsWithHr.filter((r) => r.avgHr >= maxHrRecorded * 0.85);
    const avgThresholdHr =
      fastRuns.length > 0
        ? Math.round(fastRuns.reduce((s, r) => s + r.avgHr, 0) / fastRuns.length)
        : Math.round(maxHrRecorded * 0.88);

    hrProfile = {
      maxHrRecorded,
      avgEasyHr,
      avgThresholdHr,
      zones: {
        z2: `${Math.round(maxHrRecorded * 0.71)}-${Math.round(maxHrRecorded * 0.77)} ppm`,
        fondo: `${Math.round(maxHrRecorded * 0.73)}-${Math.round(maxHrRecorded * 0.80)} ppm`,
        ritmoCarrera: `${Math.round(maxHrRecorded * 0.82)}-${Math.round(maxHrRecorded * 0.88)} ppm`,
        tempo: `${Math.round(maxHrRecorded * 0.86)}-${Math.round(maxHrRecorded * 0.91)} ppm`,
        vo2max: `${Math.round(maxHrRecorded * 0.92)}-${Math.round(maxHrRecorded * 0.98)} ppm`,
      },
    };
  }

  // VDOT & Pace summary
  let bestVDOT = 0;
  let recommendedVDOT = 37.4;
  let recommended5kSeconds = 1530;
  let avgPaceSec = 0;
  let fastestPaceSec = Infinity;

  if (validRuns.length > 0) {
    const sortedByVDOT = [...validRuns].sort((a, b) => b.estimatedVDOT - a.estimatedVDOT);
    bestVDOT = sortedByVDOT[0].estimatedVDOT;

    // Prefer actual 5K best if recent/strong, or top 3 continuous performances
    if (best5k) {
      recommendedVDOT = best5k.vdot;
      recommended5kSeconds = best5k.equivalent5kSeconds;
    } else {
      const top3 = sortedByVDOT.slice(0, Math.min(3, sortedByVDOT.length));
      recommendedVDOT =
        Math.round((top3.reduce((s, r) => s + r.estimatedVDOT, 0) / top3.length) * 10) / 10;
      recommended5kSeconds = Math.round(
        top3[0].movingTimeSec * Math.pow(5 / top3[0].distanceKm, 1.06)
      );
    }

    avgPaceSec = validRuns.reduce((sum, r) => sum + r.paceSecPerKm, 0) / validRuns.length;
    fastestPaceSec = Math.min(...validRuns.map((r) => r.paceSecPerKm));
  }

  const calibration = computeStravaCalibration({
    best5k,
    best10k,
    best21k,
    weeklyKmAvg,
    longestRunKm,
    recommendedVDOT,
  });

  // Compute Strength & Cross-Training Synergy
  let strengthSynergy: StrengthSynergyProfile | null = null;
  if (strengthActivities.length > 0 || crossActivities.length > 0) {
    const allTimestamps = [
      ...activities.map((a) => a.timestamp),
      ...strengthActivities.map((s) => s.timestamp),
      ...crossActivities.map((c) => c.timestamp),
    ].filter((ts) => ts > 0);

    const latestOverallTs = allTimestamps.length > 0 ? Math.max(...allTimestamps) : 0;
    const sixWeeksMs = 42 * 24 * 3600 * 1000;

    const recentStrength =
      latestOverallTs > 0
        ? strengthActivities.filter((s) => s.timestamp > 0 && latestOverallTs - s.timestamp <= sixWeeksMs)
        : strengthActivities;

    const recentCross =
      latestOverallTs > 0
        ? crossActivities.filter((c) => c.timestamp > 0 && latestOverallTs - c.timestamp <= sixWeeksMs)
        : crossActivities;

    // Calculate active span in weeks (up to 6 weeks) for recent strength
    let activeWeeks = 6;
    if (recentStrength.length >= 2) {
      const minTs = Math.min(...recentStrength.map((s) => s.timestamp));
      const maxTs = Math.max(...recentStrength.map((s) => s.timestamp));
      const spanWeeks = Math.max(1, (maxTs - minTs) / (7 * 24 * 3600 * 1000) + 0.5);
      activeWeeks = Math.min(6, spanWeeks);
    }

    const weeklyStrengthSessions =
      recentStrength.length > 0
        ? Math.round((recentStrength.length / activeWeeks) * 10) / 10
        : 0;

    const validDurations = strengthActivities.filter((s) => s.durationSec > 300);
    const avgDurationMinutes =
      validDurations.length > 0
        ? Math.round(
            validDurations.reduce((acc, s) => acc + s.durationSec, 0) / validDurations.length / 60
          )
        : 60;

    let strengthBeforeQualityCount = 0;
    let strengthBeforeLongRunCount = 0;
    const qualityRegex =
      /pasada|serie|interval|z4|z5|cambio|fartlek|farlek|tempo|\d+\s*x\s*\d+|1000|800|600|400|200|3000|2000|1500|1200/i;

    for (const st of strengthActivities) {
      if (st.timestamp <= 0) continue;
      // Runs on the next calendar day (18h to 36h difference between midnight dates)
      const nextDayRuns = activities.filter(
        (r) =>
          !r.isOutlier &&
          r.timestamp > 0 &&
          r.timestamp - st.timestamp >= 18 * 3600 * 1000 &&
          r.timestamp - st.timestamp <= 36 * 3600 * 1000
      );

      if (nextDayRuns.length === 0) continue;

      const hasLongRunNextDay = nextDayRuns.some((r) => r.distanceKm >= 15);
      const hasQualityRunNextDay = nextDayRuns.some(
        (r) =>
          qualityRegex.test(r.name) ||
          r.isShortInterval ||
          (hrProfile && r.avgHr >= hrProfile.maxHrRecorded * 0.85)
      );

      if (hasLongRunNextDay) strengthBeforeLongRunCount++;
      if (hasQualityRunNextDay) strengthBeforeQualityCount++;
    }

    let status: StrengthSynergyProfile['status'] = 'optimo';
    let headline = 'Fuerza bien integrada con tu semana de running';
    let summaryText = `Promediás ${weeklyStrengthSessions} sesiones de fuerza/sem (~${avgDurationMinutes} min) y dejás margen de recuperación antes de tus fondos largos.`;
    let recommendationText =
      'Mantené las 2 sesiones semanales lejos de tu tirada larga del fin de semana para sostener tu economía de carrera.';

    if (weeklyStrengthSessions < 1.0) {
      status = 'bajo_volumen';
      headline = 'Poca frecuencia de fuerza reciente';
      summaryText = `Registramos ${recentStrength.length} sesiones de fuerza en las últimas 6 semanas (${weeklyStrengthSessions}/sem).`;
      recommendationText =
        'Sumar 1 a 2 sesiones de fuerza por semana mejora hasta un 4-5% tu economía de carrera y protege tendones en fondos largos.';
    } else if (strengthBeforeLongRunCount >= 2) {
      status = 'atencion_fondos';
      headline = 'Atención: Fuerza el día previo al Fondo Largo';
      summaryText = `En ${strengthBeforeLongRunCount} ocasiones hiciste pesas el día anterior a tu tirada larga (+15 km).`;
      recommendationText =
        'Tratá de dejar al menos 48 horas entre el gimnasio de piernas y el fondo del fin de semana para evitar sobrecarga articular.';
    } else if (strengthBeforeQualityCount >= 2) {
      status = 'atencion_series';
      headline = 'Buena constancia (2x/sem), ojo con el día previo a Series';
      summaryText = `Excelente base (${weeklyStrengthSessions} sesiones/sem de ~${avgDurationMinutes} min y 48-72h libres antes del fondo${
        recentCross.length > 0 ? `, más ${recentCross.length} salidas de bici/cruzado` : ''
      }), pero en ${strengthBeforeQualityCount} semanas hiciste pesas el día antes de tus pasadas en Z4.`;
      recommendationText =
        'Si hacés gimnasio el día previo a las series (ej. martes pesas → miércoles pasadas), priorizá ese día tren superior, core o activación reactiva corta (3-5 reps sin llegar al fallo), y dejá la carga pesada de piernas para después del día de velocidad.';
    }

    strengthSynergy = {
      totalStrengthSessions: strengthActivities.length,
      weeklyStrengthSessions,
      avgDurationMinutes,
      crossTrainingCount: recentCross.length,
      strengthBeforeQualityCount,
      strengthBeforeLongRunCount,
      status,
      headline,
      summaryText,
      recommendationText,
    };
  }

  return {
    totalActivitiesParsed: lines.length - 1,
    runsCount,
    validContinuousRunsCount: validRuns.length,
    shortIntervalsCount,
    outliersCount,
    weeklyKmAvg,
    longestRunKm,
    fastestPaceFormatted: fastestPaceSec !== Infinity ? `${formatTime(fastestPaceSec)}/km` : '--:--',
    averagePaceFormatted: avgPaceSec > 0 ? `${formatTime(avgPaceSec)}/km` : '--:--',
    bestEstimatedVDOT: bestVDOT,
    recommendedVDOT,
    recommended5kSeconds,
    recommended5kTimeFormatted: formatTime(recommended5kSeconds),
    best5k,
    best10k,
    best21k,
    hrProfile,
    calibration,
    strengthSynergy,
    recentActivities: activities.slice(0, 15),
  };
}
