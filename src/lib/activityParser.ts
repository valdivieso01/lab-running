// Single Activity Parser for GPX and TCX files
import { calculateVDOT, formatTime } from './calculator';

export interface ParsedSingleActivity {
  fileName: string;
  name: string;
  dateStr: string;
  timestamp: number;
  distanceKm: number;
  movingTimeSec: number;
  paceSecPerKm: number;
  paceFormatted: string;
  elevationGain: number;
  avgHr: number;
  maxHr: number;
  equivalent5kSeconds: number;
  equivalent5kFormatted: string;
  vdot: number;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDisplayDate(date: Date): string {
  try {
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Parses a TCX XML string
 */
function parseTCX(xmlDoc: Document, fileName: string): ParsedSingleActivity {
  const laps = xmlDoc.getElementsByTagName('Lap');
  let totalDistMeters = 0;
  let totalTimeSec = 0;
  let maxHr = 0;
  let hrSum = 0;
  let hrCount = 0;

  for (let i = 0; i < laps.length; i++) {
    const lap = laps[i];
    const distEl = lap.getElementsByTagName('DistanceMeters')[0];
    if (distEl && distEl.textContent) {
      totalDistMeters += parseFloat(distEl.textContent) || 0;
    }

    const timeEl = lap.getElementsByTagName('TotalTimeSeconds')[0];
    if (timeEl && timeEl.textContent) {
      totalTimeSec += parseFloat(timeEl.textContent) || 0;
    }

    const maxHrEl = lap.getElementsByTagName('MaximumHeartRateBpm')[0];
    if (maxHrEl) {
      const valEl = maxHrEl.getElementsByTagName('Value')[0];
      if (valEl && valEl.textContent) {
        const val = parseInt(valEl.textContent, 10);
        if (val > maxHr) maxHr = val;
      }
    }

    const avgHrEl = lap.getElementsByTagName('AverageHeartRateBpm')[0];
    if (avgHrEl) {
      const valEl = avgHrEl.getElementsByTagName('Value')[0];
      if (valEl && valEl.textContent) {
        const val = parseInt(valEl.textContent, 10);
        if (val > 0) {
          hrSum += val;
          hrCount++;
        }
      }
    }
  }

  // If laps lacked summary, check trackpoints
  if (totalDistMeters === 0 || totalTimeSec === 0) {
    const trackpoints = xmlDoc.getElementsByTagName('Trackpoint');
    let prevTime: number | null = null;
    for (let i = 0; i < trackpoints.length; i++) {
      const tp = trackpoints[i];
      const distEl = tp.getElementsByTagName('DistanceMeters')[0];
      if (distEl && distEl.textContent) {
        const d = parseFloat(distEl.textContent);
        if (d > totalDistMeters) totalDistMeters = d;
      }

      const timeEl = tp.getElementsByTagName('Time')[0];
      if (timeEl && timeEl.textContent) {
        const t = new Date(timeEl.textContent).getTime();
        if (prevTime !== null && t > prevTime) {
          const delta = (t - prevTime) / 1000;
          if (delta < 20) totalTimeSec += delta; // skip long pauses
        }
        prevTime = t;
      }

      const hrEl = tp.getElementsByTagName('HeartRateBpm')[0];
      if (hrEl) {
        const valEl = hrEl.getElementsByTagName('Value')[0];
        if (valEl && valEl.textContent) {
          const hr = parseInt(valEl.textContent, 10);
          if (hr > 0 && hr < 225) {
            hrSum += hr;
            hrCount++;
            if (hr > maxHr) maxHr = hr;
          }
        }
      }
    }
  }

  const idEl = xmlDoc.getElementsByTagName('Id')[0];
  const dateObj = idEl && idEl.textContent ? new Date(idEl.textContent) : new Date();
  const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();
  const dateStr = formatDisplayDate(dateObj);

  const nameEl = xmlDoc.getElementsByTagName('Name')[0];
  const activityName = nameEl && nameEl.textContent ? nameEl.textContent.trim() : fileName.replace(/\.[^/.]+$/, '');

  const distanceKm = Math.round((totalDistMeters / 1000) * 100) / 100;
  if (distanceKm <= 0 || totalTimeSec <= 0) {
    throw new Error('No se pudo extraer distancia o tiempo válido del archivo TCX.');
  }

  const movingTimeSec = Math.round(totalTimeSec);
  const paceSecPerKm = Math.round(movingTimeSec / distanceKm);
  const avgHr = hrCount > 0 ? Math.round(hrSum / hrCount) : 0;

  // Riegel projection to 5K: T2 = T1 * (5 / D1)^1.06
  const eq5kSec = Math.round(movingTimeSec * Math.pow(5 / distanceKm, 1.06));
  const vdot = calculateVDOT(eq5kSec);

  return {
    fileName,
    name: activityName,
    dateStr,
    timestamp,
    distanceKm,
    movingTimeSec,
    paceSecPerKm,
    paceFormatted: `${formatTime(paceSecPerKm)}/km`,
    elevationGain: 0,
    avgHr,
    maxHr,
    equivalent5kSeconds: eq5kSec,
    equivalent5kFormatted: formatTime(eq5kSec),
    vdot,
  };
}

/**
 * Parses a GPX XML string
 */
function parseGPX(xmlDoc: Document, fileName: string): ParsedSingleActivity {
  const trkpts = xmlDoc.getElementsByTagName('trkpt');
  if (trkpts.length === 0) {
    throw new Error('El archivo GPX no contiene puntos de track (<trkpt>).');
  }

  let totalDistMeters = 0;
  let movingTimeSec = 0;
  let elevationGain = 0;
  let hrSum = 0;
  let hrCount = 0;
  let maxHr = 0;

  let prevLat: number | null = null;
  let prevLon: number | null = null;
  let prevEle: number | null = null;
  let prevTime: number | null = null;
  let startTime: number | null = null;

  for (let i = 0; i < trkpts.length; i++) {
    const pt = trkpts[i];
    const lat = parseFloat(pt.getAttribute('lat') || '');
    const lon = parseFloat(pt.getAttribute('lon') || '');

    if (isNaN(lat) || isNaN(lon)) continue;

    // Elevation
    const eleEl = pt.getElementsByTagName('ele')[0];
    const ele = eleEl && eleEl.textContent ? parseFloat(eleEl.textContent) : null;
    if (ele !== null && prevEle !== null && ele > prevEle) {
      const diff = ele - prevEle;
      if (diff > 0.5 && diff < 50) elevationGain += diff; // filter GPS elevation jitter
    }
    if (ele !== null) prevEle = ele;

    // Time
    const timeEl = pt.getElementsByTagName('time')[0];
    const timeMs = timeEl && timeEl.textContent ? new Date(timeEl.textContent).getTime() : null;
    if (timeMs !== null) {
      if (startTime === null) startTime = timeMs;
      if (prevTime !== null) {
        const deltaSec = (timeMs - prevTime) / 1000;
        // If gap between points is less than 20 seconds, count as moving time
        if (deltaSec > 0 && deltaSec < 20) {
          movingTimeSec += deltaSec;
        }
      }
      prevTime = timeMs;
    }

    // Distance
    if (prevLat !== null && prevLon !== null) {
      const d = haversineMeters(prevLat, prevLon, lat, lon);
      if (d > 0.3 && d < 200) {
        totalDistMeters += d;
      }
    }
    prevLat = lat;
    prevLon = lon;

    // Heart rate extensions (supports gpxtpx:hr or hr)
    const hrEl = pt.getElementsByTagName('gpxtpx:hr')[0] || pt.getElementsByTagName('hr')[0];
    if (hrEl && hrEl.textContent) {
      const hr = parseInt(hrEl.textContent, 10);
      if (hr > 40 && hr < 225) {
        hrSum += hr;
        hrCount++;
        if (hr > maxHr) maxHr = hr;
      }
    }
  }

  const nameEl = xmlDoc.getElementsByTagName('name')[0];
  const activityName = nameEl && nameEl.textContent ? nameEl.textContent.trim() : fileName.replace(/\.[^/.]+$/, '');

  const dateObj = startTime ? new Date(startTime) : new Date();
  const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();
  const dateStr = formatDisplayDate(dateObj);

  const distanceKm = Math.round((totalDistMeters / 1000) * 100) / 100;
  if (distanceKm <= 0.1) {
    throw new Error('La distancia detectada en el archivo GPX es inferior a 100 metros.');
  }

  // If moving time couldn't be calculated accurately from point deltas, fallback to average speed
  if (movingTimeSec <= 0 && startTime !== null && prevTime !== null && prevTime > startTime) {
    movingTimeSec = Math.round((prevTime - startTime) / 1000);
  }

  if (movingTimeSec <= 0) {
    throw new Error('No se pudo determinar el tiempo en movimiento del archivo GPX.');
  }

  const paceSecPerKm = Math.round(movingTimeSec / distanceKm);
  const avgHr = hrCount > 0 ? Math.round(hrSum / hrCount) : 0;

  // Projected 5K
  const eq5kSec = Math.round(movingTimeSec * Math.pow(5 / distanceKm, 1.06));
  const vdot = calculateVDOT(eq5kSec);

  return {
    fileName,
    name: activityName,
    dateStr,
    timestamp,
    distanceKm,
    movingTimeSec: Math.round(movingTimeSec),
    paceSecPerKm,
    paceFormatted: `${formatTime(paceSecPerKm)}/km`,
    elevationGain: Math.round(elevationGain),
    avgHr,
    maxHr,
    equivalent5kSeconds: eq5kSec,
    equivalent5kFormatted: formatTime(eq5kSec),
    vdot,
  };
}

/**
 * Universal single activity parser for .gpx and .tcx files
 */
export async function parseSingleActivityFile(file: File): Promise<ParsedSingleActivity> {
  const name = file.name.toLowerCase();
  const isGpx = name.endsWith('.gpx');
  const isTcx = name.endsWith('.tcx');

  if (!isGpx && !isTcx) {
    throw new Error('Formato no soportado. Por favor subí un archivo con extensión .gpx o .tcx.');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('El archivo supera los 15 MB.');
  }

  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');

  // Check for XML parsing error
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error('El archivo no tiene un formato XML válido.');
  }

  if (isTcx) {
    return parseTCX(xmlDoc, file.name);
  } else {
    return parseGPX(xmlDoc, file.name);
  }
}
