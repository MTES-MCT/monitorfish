/* eslint-disable no-restricted-syntax */

import { faker } from '@faker-js/faker'
import { promises as fs } from 'fs'
import ora from 'ora'
import { join } from 'path'

const VESSEL_COUNT = 10_000

const OUTPUT_PATH = join(import.meta.url, '../../../backend/src/main/resources/db/testdata/json/V666.41__Insert_dummy_last_positions_ais.jsonc').replace(
  'file:',
  ''
)

// EU/common maritime flag states — mirrors the colors visible in the map
const FLAG_STATES = [
  'FR', 'ES', 'PT', 'GB', 'IT', 'NL', 'BE', 'DE', 'IE',
  'DK', 'NO', 'MT', 'CY', 'GR', 'HR', 'PL', 'SE', 'FI',
  'MA', 'TR', 'RU', 'LV', 'EE',
]

const NAV_STATUSES = [
  'Under way using engine',
  'At anchor',
  'Not under command',
  'Restricted manoeuvrability',
  'Constrained by draught',
  'Moored',
  'Engaged in fishing',
  'Under way sailing',
]

// Three zone types:
//   'lane' — polyline + perpendicular width; mimics shipping-lane traffic
//   'port' — circular cluster around a major port
//   'area' — rectangular zone for fishing grounds / open ocean
const ZONES = [

  // ── Shipping lanes ────────────────────────────────────────────────────
  // English Channel eastbound (S lane, France side)
  { type: 'lane', waypoints: [[-5.5,49.4],[-3.0,49.9],[-1.0,50.3],[0.5,50.6],[2.0,51.0],[2.5,51.1]], width: 0.35, weight: 16 },
  // English Channel westbound (N lane, UK side)
  { type: 'lane', waypoints: [[-5.5,49.9],[-3.0,50.4],[-1.0,50.8],[0.5,51.1],[2.0,51.3],[2.5,51.4]], width: 0.30, weight: 14 },
  // Bay of Biscay coastal route (Bayonne ↔ Brest)
  { type: 'lane', waypoints: [[-1.8,43.4],[-1.4,44.5],[-1.3,45.5],[-2.1,46.2],[-2.5,47.3],[-2.2,47.5],[-4.8,48.4]], width: 0.45, weight: 10 },
  // Atlantic approach — Cape Finisterre ↔ Bay of Biscay
  { type: 'lane', waypoints: [[-9.3,42.9],[-9.5,43.5],[-9.8,44.5],[-9.5,46.0],[-7.0,47.5],[-5.5,48.5]], width: 0.55, weight: 7 },
  // Mediterranean coastal (Marseille → Genoa)
  { type: 'lane', waypoints: [[5.3,43.3],[6.5,43.1],[7.3,43.6],[8.0,43.8],[8.8,44.0]], width: 0.28, weight: 6 },
  // Gibraltar approach → western Mediterranean
  { type: 'lane', waypoints: [[-6.0,36.0],[-5.4,36.1],[-4.5,36.3],[-3.0,36.6],[-1.0,37.5],[0.0,38.5],[2.0,39.5]], width: 0.40, weight: 5 },

  // ── Traffic Separation Schemes (TSS) ─────────────────────────────────
  // Dover Strait TSS – NE-bound lane (toward North Sea, France side)
  { type: 'lane', waypoints: [[-0.3,50.97],[0.7,51.07],[1.5,51.14],[2.1,51.20]], width: 0.10, weight: 18 },
  // Dover Strait TSS – SW-bound lane (toward Atlantic, UK side)
  { type: 'lane', waypoints: [[2.1,51.35],[1.5,51.28],[0.7,51.21],[-0.3,51.11]], width: 0.10, weight: 18 },
  // Off Ushant (Ouessant) TSS – NE-bound (Atlantic → Channel)
  { type: 'lane', waypoints: [[-7.5,47.0],[-7.0,47.8],[-6.5,48.3],[-5.7,48.7],[-5.0,49.0]], width: 0.20, weight: 12 },
  // Off Ushant TSS – SW-bound (Channel → Atlantic / Bay of Biscay)
  { type: 'lane', waypoints: [[-5.0,49.3],[-5.7,49.0],[-6.5,48.6],[-7.0,48.1],[-7.5,47.3]], width: 0.20, weight: 12 },
  // Off Finisterre (NW Spain) TSS – southbound (toward Portugal/Gibraltar)
  { type: 'lane', waypoints: [[-9.8,44.2],[-9.6,43.5],[-9.4,43.0],[-9.0,42.5]], width: 0.18, weight: 7 },
  // Off Finisterre TSS – northbound (toward Bay of Biscay)
  { type: 'lane', waypoints: [[-9.0,42.5],[-9.4,43.0],[-9.8,43.6],[-10.0,44.2]], width: 0.18, weight: 7 },

  // ── Port clusters ─────────────────────────────────────────────────────
  { type: 'port', lon:  0.10, lat: 49.50, radius: 0.50, weight: 10 }, // Le Havre
  { type: 'port', lon:  2.37, lat: 51.05, radius: 0.40, weight:  6 }, // Dunkerque
  { type: 'port', lon:  1.85, lat: 50.96, radius: 0.30, weight:  5 }, // Calais
  { type: 'port', lon: -1.64, lat: 49.63, radius: 0.40, weight:  5 }, // Cherbourg
  { type: 'port', lon: -4.49, lat: 48.39, radius: 0.50, weight:  6 }, // Brest
  { type: 'port', lon: -3.36, lat: 47.75, radius: 0.40, weight:  5 }, // Lorient
  { type: 'port', lon: -2.20, lat: 47.28, radius: 0.40, weight:  5 }, // Saint-Nazaire
  { type: 'port', lon: -1.17, lat: 46.16, radius: 0.40, weight:  4 }, // La Rochelle
  { type: 'port', lon: -1.10, lat: 45.50, radius: 0.40, weight:  3 }, // Bordeaux estuary
  { type: 'port', lon: -1.48, lat: 43.50, radius: 0.35, weight:  3 }, // Bayonne
  { type: 'port', lon:  5.35, lat: 43.30, radius: 0.55, weight:  9 }, // Marseille
  { type: 'port', lon:  5.93, lat: 43.12, radius: 0.35, weight:  4 }, // Toulon
  { type: 'port', lon:  7.27, lat: 43.70, radius: 0.35, weight:  4 }, // Nice/Antibes
  { type: 'port', lon: -2.93, lat: 43.35, radius: 0.40, weight:  5 }, // Bilbao
  { type: 'port', lon: -3.80, lat: 43.46, radius: 0.30, weight:  3 }, // Santander
  { type: 'port', lon: -8.73, lat: 42.24, radius: 0.50, weight:  5 }, // Vigo
  { type: 'port', lon: -8.70, lat: 41.19, radius: 0.40, weight:  4 }, // Leixões/Porto
  { type: 'port', lon: -9.14, lat: 38.71, radius: 0.50, weight:  5 }, // Lisbon
  { type: 'port', lon: -4.14, lat: 50.37, radius: 0.40, weight:  4 }, // Plymouth
  { type: 'port', lon: -1.40, lat: 50.90, radius: 0.40, weight:  5 }, // Southampton
  { type: 'port', lon:  1.32, lat: 51.13, radius: 0.25, weight:  4 }, // Dover

  // ── Fishing grounds & open sea ─────────────────────────────────────────
  { type: 'area', latMin: 44, latMax: 49, lonMin: -9,  lonMax: -3,  weight: 12 }, // Bay of Biscay fishing
  { type: 'area', latMin: 49, latMax: 53, lonMin: -9,  lonMax: -4,  weight:  8 }, // Celtic Sea
  { type: 'area', latMin: 48, latMax: 51, lonMin: -4,  lonMax:  0,  weight:  6 }, // Channel fishing
  { type: 'area', latMin: 36, latMax: 55, lonMin: -28, lonMax: -14, weight:  8 }, // Open Atlantic
  { type: 'area', latMin: 36, latMax: 44, lonMin: -14, lonMax: -8,  weight:  6 }, // Atlantic Iberia
  { type: 'area', latMin: 44, latMax: 52, lonMin: -14, lonMax: -8,  weight:  5 }, // Atlantic France
  { type: 'area', latMin: 41, latMax: 44, lonMin:  3,  lonMax:  7,  weight: 10 }, // Gulf of Lion
  { type: 'area', latMin: 36, latMax: 42, lonMin: -1,  lonMax:  4,  weight:  5 }, // Catalan Sea
  { type: 'area', latMin: 52, latMax: 58, lonMin:  2,  lonMax:  8,  weight:  7 }, // North Sea south
]

const ZONE_POOL = ZONES.flatMap((zone, idx) => Array(zone.weight).fill(idx))

// Simplified land polygons for rejection sampling — [lon, lat] pairs
const LAND_POLYGONS = [
  // France mainland
  [[-1.77,43.39],[-2.21,47.27],[-5.10,48.43],[-2.03,48.62],
   [1.63,49.68],[2.56,51.09],[7.62,47.59],[7.26,44.13],
   [7.07,43.73],[3.05,43.24],[1.50,42.50],[-1.77,43.39]],
  // Iberian Peninsula (Spain + Portugal)
  [[-1.77,43.39],[-9.30,43.74],[-9.50,39.00],[-8.99,36.99],
   [-5.36,36.00],[3.32,42.43],[1.50,42.50],[-1.77,43.39]],
  // Great Britain
  [[-5.72,50.02],[1.80,51.14],[0.20,54.00],[-2.00,57.70],
   [-5.00,58.65],[-8.20,57.90],[-5.15,54.85],[-5.72,50.02]],
  // Italian peninsula
  [[7.07,43.73],[13.69,44.54],[18.30,40.05],[15.69,37.91],
   [12.35,37.80],[7.73,38.22],[7.07,43.73]],
]

function isPointInPolygon(lat, lon, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function isOnLand(lat, lon) {
  return LAND_POLYGONS.some(poly => isPointInPolygon(lat, lon, poly))
}

function randomPointOnLane({ waypoints, width }) {
  const segments = []
  let totalLen = 0
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [lon1, lat1] = waypoints[i]
    const [lon2, lat2] = waypoints[i + 1]
    const len = Math.hypot(lon2 - lon1, lat2 - lat1)
    segments.push({ lon1, lat1, lon2, lat2, len })
    totalLen += len
  }

  let dist = faker.number.float({ min: 0, max: totalLen })
  let chosen = segments[segments.length - 1]
  let t = 1
  for (const s of segments) {
    if (dist <= s.len) { chosen = s; t = dist / s.len; break }
    dist -= s.len
  }

  const centerLon = chosen.lon1 + t * (chosen.lon2 - chosen.lon1)
  const centerLat = chosen.lat1 + t * (chosen.lat2 - chosen.lat1)

  const dLon = chosen.lon2 - chosen.lon1
  const dLat = chosen.lat2 - chosen.lat1
  const invLen = 1 / Math.hypot(dLon, dLat)
  const offset = faker.number.float({ min: -width / 2, max: width / 2 })

  return {
    latitude:  parseFloat((centerLat + offset *  dLon * invLen).toFixed(5)),
    longitude: parseFloat((centerLon + offset * -dLat * invLen).toFixed(5)),
  }
}

function randomPointInPort({ lon, lat, radius }) {
  const angle = faker.number.float({ min: 0, max: 2 * Math.PI })
  const r = radius * Math.sqrt(faker.number.float({ min: 0, max: 1 }))
  return {
    latitude:  parseFloat((lat + r * Math.sin(angle)).toFixed(5)),
    longitude: parseFloat((lon + r * Math.cos(angle)).toFixed(5)),
  }
}

function randomPointInArea({ latMin, latMax, lonMin, lonMax }) {
  return {
    latitude:  faker.number.float({ fractionDigits: 5, min: latMin, max: latMax }),
    longitude: faker.number.float({ fractionDigits: 5, min: lonMin, max: lonMax }),
  }
}

function randomRegionCoord() {
  let coord, attempts = 0
  do {
    const zone = ZONES[faker.helpers.arrayElement(ZONE_POOL)]
    switch (zone.type) {
      case 'lane': coord = randomPointOnLane(zone); break
      case 'port': coord = randomPointInPort(zone); break
      default:     coord = randomPointInArea(zone)
    }
    attempts++
    if (attempts > 100) break
  } while (isOnLand(coord.latitude, coord.longitude))
  return coord
}

function randomVesselName() {
  // Mix of French-style fishing vessel names and generic names
  const prefixes = ['BELLE', 'BONNE', 'NOTRE DAME', 'SAINTE', 'SAINT', 'CAP', 'CÔTE', 'MER', 'VENT', 'ETOILE']
  const suffixes = [
    'DU NORD', 'DES ILES', 'DE BRETAGNE', 'ATLANTIQUE', 'DES MERS', 'DU LARGE',
    'BLEUE', 'ROUGE', 'BLANCHE', 'NOIRE',
  ]

  if (faker.datatype.boolean(0.6)) {
    return `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(suffixes)}`
  }

  return faker.person.fullName().toUpperCase().slice(0, 40)
}


function generateVessel(mmsi) {
  const flagState = faker.helpers.weightedArrayElement([
    { value: 'FR', weight: 30 },
    { value: 'ES', weight: 15 },
    { value: 'PT', weight: 8 },
    { value: 'GB', weight: 10 },
    { value: 'IT', weight: 10 },
    { value: 'NL', weight: 5 },
    { value: 'BE', weight: 3 },
    { value: 'DE', weight: 4 },
    { value: 'IE', weight: 3 },
    { value: 'DK', weight: 2 },
    { value: 'NO', weight: 2 },
    { value: 'MT', weight: 1 },
    { value: 'GR', weight: 3 },
    ...FLAG_STATES.slice(12).map(v => ({ value: v, weight: 1 })),
  ])

  const isAtPort = faker.datatype.boolean(0.05)
  const { latitude, longitude } = randomRegionCoord()
  const isFast = faker.datatype.boolean(0.90)
  const speed = isFast
    ? faker.number.float({ fractionDigits: 1, max: 18,  min: 1.1 })
    : faker.number.float({ fractionDigits: 1, max: 1.0, min: 0.0 })
  const course = faker.number.float({ fractionDigits: 1, max: 360, min: 0 })
  const heading = faker.number.float({ fractionDigits: 1, max: 360, min: 0 })

  const status = isAtPort
    ? faker.helpers.arrayElement(['At anchor', 'Moored'])
    : faker.helpers.arrayElement(NAV_STATUSES)

  const hasNavpro = faker.datatype.boolean(0.7)
  const minutesAgo = faker.number.int({ max: 240, min: 1 })

  return {
    cfr: hasNavpro ? `${flagState}${faker.string.alphanumeric({ casing: 'upper', length: 9 })}` : null,
    course,
    external_immatriculation: hasNavpro ? faker.string.alphanumeric({ casing: 'upper', length: 8 }) : null,
    flag_state: flagState,
    heading,
    imo: faker.datatype.boolean(0.6) ? `${faker.number.int({ max: 9999999, min: 1000000 })}` : null,
    is_at_port: isAtPort,
    ircs: hasNavpro ? faker.string.alphanumeric({ casing: 'upper', length: { max: 5, min: 4 } }) : null,
    'last_position_datetime_utc:sql': `NOW() - ('${minutesAgo} minutes')::interval`,
    latitude,
    length: faker.datatype.boolean(0.7) ? faker.number.float({ fractionDigits: 1, max: 80, min: 6 }) : null,
    longitude,
    mmsi,
    speed,
    status,
    vessel_id: null,
    vessel_name: randomVesselName(),
  }
}

async function run() {
  const spinner = ora(`Generating ${VESSEL_COUNT} AIS last positions...`).start()

  // Generate unique MMSIs: real MMSIs are 9-digit numbers, MMSI 200000000-799999999 are assigned to vessels
  const usedMmsis = new Set()
  const vessels = []

  for (let i = 0; i < VESSEL_COUNT; i++) {
    let mmsi

    do {
      mmsi = faker.number.int({ max: 799_999_999, min: 200_000_000 })
    } while (usedMmsis.has(mmsi))

    usedMmsis.add(mmsi)
    vessels.push(generateVessel(mmsi))

    if (i % 1000 === 0) {
      spinner.text = `Generating vessels ${i}/${VESSEL_COUNT}...`
    }
  }

  const jsonc = [
    {
      beforeAll: 'TRUNCATE TABLE last_positions_ais;',
      data: vessels,
      table: 'last_positions_ais',
    },
  ]

  spinner.text = 'Writing .jsonc file...'
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(jsonc, null, 2), 'utf8')

  spinner.succeed(`Generated ${VESSEL_COUNT} vessels → ${OUTPUT_PATH}`)
  console.info('Run `make generate-test-data` to convert to SQL.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
