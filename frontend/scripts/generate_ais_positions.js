/* eslint-disable no-restricted-syntax */

import { promises as fs } from 'fs'
import ora from 'ora'
import { join } from 'path'

import { generateVesselPositions, VESSELS } from './ais_vessels_shared.js'

const OUTPUT_PATH = join(import.meta.url, '../../../backend/src/main/resources/db/testdata/V666.42__Insert_dummy_ais_positions.sql').replace(
  'file:',
  ''
)

const BATCH_SIZE = 1000

function escapeStr(s) {
  return `'${s.replace(/'/g, "''")}'`
}

function rowToSql(p) {
  const ts  = `(now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '${p.minutesAgo} minutes'`
  const imo = p.imo ? escapeStr(p.imo) : 'NULL'
  const cfr = p.cfr ? escapeStr(p.cfr) : 'NULL'
  return `(${p.mmsi},${ts},${p.lat},${p.lon},${p.speed},${p.course},${escapeStr(p.status)},${escapeStr(p.ircs)},${escapeStr(p.vesselName)},${p.shipType},${imo},${cfr})`
}

async function run() {
  const spinner = ora(`Generating AIS positions for ${VESSELS.length} vessels...`).start()

  const allRows = []
  for (let i = 0; i < VESSELS.length; i++) {
    const vessel = VESSELS[i]
    spinner.text = `Simulating route for ${vessel.vesselName} (${i + 1}/${VESSELS.length})...`
    const positions = generateVesselPositions(vessel, vessel.mmsi)
    allRows.push(...positions)
  }

  spinner.text = 'Writing SQL file...'

  const cols = '(mmsi, date_time, latitude, longitude, speed, course, status, ircs, vessel_name, ship_type, imo, cfr)'
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
