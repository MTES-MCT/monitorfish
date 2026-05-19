/* eslint-disable no-restricted-syntax */

export const INTERVAL_MINUTES = 7
export const TOTAL_MINUTES = 4 * 7 * 24 * 60  // 40320 — 4 weeks
export const DURATION_12H_MINUTES = 12 * 60    // 720

// Bounding box for EU fishing zone
export const LAT_MIN = 35
export const LAT_MAX = 60
export const LON_MIN = -20
export const LON_MAX = 15

export const VESSELS = [
  { cfr: null, mmsi: 227123001, vesselName: 'BELLE ETOILE',      ircs: 'FZAB1',  flagState: 'FR', imo: '9123001', shipType: 30, startLat: 47.5,  startLon:  -5.0,  startCourse: 220 },
  { cfr: null, mmsi: 227123002, vesselName: 'CAP BRETON',         ircs: 'FZAC2',  flagState: 'FR', imo: '9123002', shipType: 30, startLat: 50.2,  startLon:  -7.3,  startCourse: 145 },
  { cfr: null, mmsi: 227123003, vesselName: 'NORD ATLANTIQUE',    ircs: 'FZAD3',  flagState: 'FR', imo: '9123003', shipType: 30, startLat: 49.5,  startLon:  -2.1,  startCourse:  90 },
  { cfr: null, mmsi: 224123001, vesselName: 'VIENTO DEL MAR',     ircs: 'EBVD1',  flagState: 'ES', imo: '9124001', shipType: 30, startLat: 44.1,  startLon:  -3.4,  startCourse: 180 },
  { cfr: null, mmsi: 227123004, vesselName: 'MER DU LARGE',       ircs: 'FZAE4',  flagState: 'FR', imo: '9123004', shipType: 30, startLat: 46.0,  startLon:  -9.2,  startCourse: 310 },
  { cfr: null, mmsi: 227123005, vesselName: 'SAINT PIERRE',       ircs: 'FZAF5',  flagState: 'FR', imo: '9123005', shipType: 30, startLat: 43.2,  startLon:   4.1,  startCourse:  60 },
  { cfr: null, mmsi: 244123001, vesselName: 'NOORDZEE',           ircs: 'PBNO1',  flagState: 'NL', imo: '9244001', shipType: 30, startLat: 52.1,  startLon:   3.2,  startCourse:  15 },
  { cfr: null, mmsi: 263123001, vesselName: 'ATLANTICO SUL',      ircs: 'CTAS1',  flagState: 'PT', imo: '9263001', shipType: 30, startLat: 40.3,  startLon: -11.0,  startCourse: 270 },
  { cfr: null, mmsi: 232123001, vesselName: 'CELTIC DAWN',        ircs: 'GBCD1',  flagState: 'GB', imo: '9232001', shipType: 30, startLat: 50.5,  startLon:   0.1,  startCourse: 200 },
  { cfr: null, mmsi: 227123006, vesselName: 'GOLFE DE GASCOGNE',  ircs: 'FZAG6',  flagState: 'FR', imo: '9123006', shipType: 30, startLat: 46.3,  startLon:  -7.1,  startCourse: 190 },
  // VMS vessels: 12 h of AIS positions at 10-minute intervals, starting from last_positions coordinates
  { cfr: 'ABC000339263', mmsi: 23858744,  vesselName: 'PAYSAGE ROMAN LIER',  ircs: 'YHIZ',   flagState: 'FR', imo: null, shipType: 30, startLat: 48.097, startLon: -4.323, startCourse: 351, intervalMinutes: 10, totalMinutes: DURATION_12H_MINUTES },
  { cfr: 'ABC000570464', mmsi: 819527780, vesselName: 'POÉSIE POUVOIR RESTE', ircs: 'QO0830', flagState: 'FR', imo: null, shipType: 30, startLat: 45.468, startLon: -1.551, startCourse:  90, intervalMinutes: 10, totalMinutes: DURATION_12H_MINUTES },
]

export const MODES = {
  FISHING:  { minSpeed: 2.0, maxSpeed:  4.0, courseDrift: 20, status: 'Engaged in fishing',      minSteps: 25, maxSteps:  68 },
  TRANSIT:  { minSpeed: 8.0, maxSpeed: 12.0, courseDrift:  5, status: 'Under way using engine',  minSteps: 17, maxSteps:  34 },
  ANCHORED: { minSpeed: 0.0, maxSpeed:  0.0, courseDrift:  0, status: 'At anchor',               minSteps: 68, maxSteps: 205 },
}

// Weighted mode transition table: next mode probabilities from current mode
export const MODE_TRANSITIONS = {
  FISHING:  [{ mode: 'FISHING', w: 3 }, { mode: 'TRANSIT', w: 2 }, { mode: 'ANCHORED', w: 1 }],
  TRANSIT:  [{ mode: 'FISHING', w: 3 }, { mode: 'TRANSIT', w: 1 }, { mode: 'ANCHORED', w: 1 }],
  ANCHORED: [{ mode: 'FISHING', w: 2 }, { mode: 'TRANSIT', w: 3 }, { mode: 'ANCHORED', w: 1 }],
}

function seededRand(seed) {
  let s = seed
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pickWeighted(options, rand) {
  const total = options.reduce((sum, o) => sum + o.w, 0)
  let r = rand() * total
  for (const o of options) {
    r -= o.w
    if (r <= 0) return o.mode
  }
  return options[options.length - 1].mode
}

function randBetween(min, max, rand) {
  return min + rand() * (max - min)
}

function randInt(min, max, rand) {
  return Math.floor(randBetween(min, max + 1, rand))
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360
}

export function generateVesselPositions(vessel, seed) {
  const intervalMinutes = vessel.intervalMinutes ?? INTERVAL_MINUTES
  const totalMinutes    = vessel.totalMinutes    ?? TOTAL_MINUTES
  const steps           = Math.floor(totalMinutes / intervalMinutes)

  const rand = seededRand(seed)
  const positions = []

  let lat = vessel.startLat
  let lon = vessel.startLon
  let course = vessel.startCourse
  let speed = randBetween(MODES.FISHING.minSpeed, MODES.FISHING.maxSpeed, rand)
  let modeName = 'FISHING'
  let stepsInMode = 0
  let maxStepsInMode = randInt(MODES.FISHING.minSteps, MODES.FISHING.maxSteps, rand)

  for (let step = 0; step < steps; step++) {
    if (stepsInMode >= maxStepsInMode) {
      modeName = pickWeighted(MODE_TRANSITIONS[modeName], rand)
      const mode = MODES[modeName]
      maxStepsInMode = randInt(mode.minSteps, mode.maxSteps, rand)
      stepsInMode = 0
      if (modeName === 'ANCHORED') {
        speed = 0
      } else {
        speed = randBetween(mode.minSpeed, mode.maxSpeed, rand)
        course = normalizeAngle(course + randBetween(-45, 45, rand))
      }
    }

    const mode = MODES[modeName]
    const minutesAgo = totalMinutes - step * intervalMinutes

    positions.push({
      mmsi:       vessel.mmsi,
      minutesAgo,
      lat:        parseFloat(lat.toFixed(5)),
      lon:        parseFloat(lon.toFixed(5)),
      speed:      parseFloat(speed.toFixed(1)),
      course:     parseFloat(course.toFixed(1)),
      status:     mode.status,
      ircs:       vessel.ircs,
      vesselName: vessel.vesselName,
      shipType:   vessel.shipType,
      imo:        vessel.imo,
      cfr:        vessel.cfr,
    })

    if (modeName !== 'ANCHORED') {
      const distNm = speed * (intervalMinutes / 60)
      const courseRad = (course * Math.PI) / 180
      const deltaLat = (distNm / 60) * Math.cos(courseRad)
      const deltaLon = (distNm / 60) * Math.sin(courseRad) / Math.cos((lat * Math.PI) / 180)

      lat += deltaLat
      lon += deltaLon

      if (lat < LAT_MIN || lat > LAT_MAX || lon < LON_MIN || lon > LON_MAX) {
        lat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat))
        lon = Math.max(LON_MIN, Math.min(LON_MAX, lon))
        course = normalizeAngle(course + 180 + randBetween(-30, 30, rand))
      }

      course = normalizeAngle(course + randBetween(-mode.courseDrift, mode.courseDrift, rand) * 0.3)
    }

    stepsInMode++
  }

  return positions
}
