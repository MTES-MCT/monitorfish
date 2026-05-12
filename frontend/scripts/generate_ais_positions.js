/* eslint-disable no-restricted-syntax */

import { promises as fs } from 'fs'
import ora from 'ora'
import { join } from 'path'

const OUTPUT_PATH = join(import.meta.url, '../../../backend/src/main/resources/db/testdata/V666.42__Insert_dummy_ais_positions.sql').replace(
  'file:',
  ''
)

const INTERVAL_MINUTES = 7
const DURATION_WEEKS = 4
const TOTAL_MINUTES = DURATION_WEEKS * 7 * 24 * 60  // 40320
const STEPS = Math.floor(TOTAL_MINUTES / INTERVAL_MINUTES)  // 5760
const BATCH_SIZE = 1000

// Bounding box for EU fishing zone
const LAT_MIN = 35
const LAT_MAX = 60
const LON_MIN = -20
const LON_MAX = 15

const VESSELS = [
  { mmsi: 227123001, vesselName: 'BELLE ETOILE',      ircs: 'FZAB1', flagState: 'FR', imo: '9123001', shipType: 30, startLat: 47.5,  startLon: -5.0,  startCourse: 220 },
  { mmsi: 227123002, vesselName: 'CAP BRETON',         ircs: 'FZAC2', flagState: 'FR', imo: '9123002', shipType: 30, startLat: 50.2,  startLon: -7.3,  startCourse: 145 },
  { mmsi: 227123003, vesselName: 'NORD ATLANTIQUE',    ircs: 'FZAD3', flagState: 'FR', imo: '9123003', shipType: 30, startLat: 49.5,  startLon: -2.1,  startCourse:  90 },
  { mmsi: 224123001, vesselName: 'VIENTO DEL MAR',     ircs: 'EBVD1', flagState: 'ES', imo: '9124001', shipType: 30, startLat: 44.1,  startLon: -3.4,  startCourse: 180 },
  { mmsi: 227123004, vesselName: 'MER DU LARGE',       ircs: 'FZAE4', flagState: 'FR', imo: '9123004', shipType: 30, startLat: 46.0,  startLon: -9.2,  startCourse: 310 },
  { mmsi: 227123005, vesselName: 'SAINT PIERRE',       ircs: 'FZAF5', flagState: 'FR', imo: '9123005', shipType: 30, startLat: 43.2,  startLon:  4.1,  startCourse:  60 },
  { mmsi: 244123001, vesselName: 'NOORDZEE',           ircs: 'PBNO1', flagState: 'NL', imo: '9244001', shipType: 30, startLat: 52.1,  startLon:  3.2,  startCourse:  15 },
  { mmsi: 263123001, vesselName: 'ATLANTICO SUL',      ircs: 'CTAS1', flagState: 'PT', imo: '9263001', shipType: 30, startLat: 40.3,  startLon: -11.0, startCourse: 270 },
  { mmsi: 232123001, vesselName: 'CELTIC DAWN',        ircs: 'GBCD1', flagState: 'GB', imo: '9232001', shipType: 30, startLat: 50.5,  startLon:  0.1,  startCourse: 200 },
  { mmsi: 227123006, vesselName: 'GOLFE DE GASCOGNE',  ircs: 'FZAG6', flagState: 'FR', imo: '9123006', shipType: 30, startLat: 46.3,  startLon: -7.1,  startCourse: 190 },
]

const MODES = {
  FISHING:  { minSpeed: 2.0, maxSpeed: 4.0, courseDrift: 20, status: 'Engaged in fishing',       minSteps: 25, maxSteps: 68 },
  TRANSIT:  { minSpeed: 8.0, maxSpeed: 12.0, courseDrift:  5, status: 'Under way using engine',  minSteps: 17, maxSteps: 34 },
  ANCHORED: { minSpeed: 0.0, maxSpeed: 0.0, courseDrift:  0, status: 'At anchor',                minSteps: 68, maxSteps: 205 },
}

// Weighted mode transition table: next mode probabilities from current mode
const MODE_TRANSITIONS = {
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

function generateVesselPositions(vessel, seed) {
  const rand = seededRand(seed)
  const positions = []

  let lat = vessel.startLat
  let lon = vessel.startLon
  let course = vessel.startCourse
  let speed = randBetween(MODES.FISHING.minSpeed, MODES.FISHING.maxSpeed, rand)
  let modeName = 'FISHING'
  let stepsInMode = 0
  let maxStepsInMode = randInt(MODES.FISHING.minSteps, MODES.FISHING.maxSteps, rand)

  for (let step = 0; step < STEPS; step++) {
    // Mode transition check
    if (stepsInMode >= maxStepsInMode) {
      modeName = pickWeighted(MODE_TRANSITIONS[modeName], rand)
      const mode = MODES[modeName]
      maxStepsInMode = randInt(mode.minSteps, mode.maxSteps, rand)
      stepsInMode = 0
      if (modeName === 'ANCHORED') {
        speed = 0
      } else {
        speed = randBetween(mode.minSpeed, mode.maxSpeed, rand)
        // Pick a new course with some variation from current
        course = normalizeAngle(course + randBetween(-45, 45, rand))
      }
    }

    const mode = MODES[modeName]
    const minutesAgo = TOTAL_MINUTES - step * INTERVAL_MINUTES

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
    })

    // Advance position via dead reckoning
    if (modeName !== 'ANCHORED') {
      const distNm = speed * (INTERVAL_MINUTES / 60)
      const courseRad = (course * Math.PI) / 180
      const deltaLat = (distNm / 60) * Math.cos(courseRad)
      const deltaLon = (distNm / 60) * Math.sin(courseRad) / Math.cos((lat * Math.PI) / 180)

      lat += deltaLat
      lon += deltaLon

      // Reverse course if out of bounding box
      if (lat < LAT_MIN || lat > LAT_MAX || lon < LON_MIN || lon > LON_MAX) {
        lat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat))
        lon = Math.max(LON_MIN, Math.min(LON_MAX, lon))
        course = normalizeAngle(course + 180 + randBetween(-30, 30, rand))
      }

      // Drift course slightly each step
      course = normalizeAngle(course + randBetween(-mode.courseDrift, mode.courseDrift, rand) * 0.3)
    }

    stepsInMode++
  }

  return positions
}

function escapeStr(s) {
  return `'${s.replace(/'/g, "''")}'`
}

function rowToSql(p) {
  const ts = `(now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '${p.minutesAgo} minutes'`
  return `(${p.mmsi},${ts},${p.lat},${p.lon},${p.speed},${p.course},${escapeStr(p.status)},${escapeStr(p.ircs)},${escapeStr(p.vesselName)},${p.shipType},${escapeStr(p.imo)})`
}

async function run() {
  const spinner = ora(`Generating AIS positions for ${VESSELS.length} vessels (${STEPS} steps each)...`).start()

  const allRows = []
  for (let i = 0; i < VESSELS.length; i++) {
    const vessel = VESSELS[i]
    spinner.text = `Simulating route for ${vessel.shipName} (${i + 1}/${VESSELS.length})...`
    const positions = generateVesselPositions(vessel, vessel.mmsi)
    allRows.push(...positions)
  }

  spinner.text = 'Writing SQL file...'

  const cols = '(mmsi, date_time, latitude, longitude, speed, course, status, ircs, vessel_name, ship_type, imo)'
  const lines = ['TRUNCATE TABLE ais_positions;', '']

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE)
    lines.push(`INSERT INTO ais_positions ${cols} VALUES`)
    lines.push(batch.map(rowToSql).join(',\n') + ';')
    lines.push('')
  }

  await fs.writeFile(OUTPUT_PATH, lines.join('\n'), 'utf8')

  spinner.succeed(
    `Generated ${allRows.length.toLocaleString()} rows for ${VESSELS.length} vessels → ${OUTPUT_PATH}`
  )
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
