/* eslint-disable no-await-in-loop */

import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import ora from 'ora'
import postgres from 'postgres'

const BATCH_SIZE = 1000
const BATCH_SKELETON = new Array(BATCH_SIZE).fill(null)
const START_DATE = dayjs().subtract(6, 'months').toDate()
const END_DATE = dayjs().add(6, 'months').toDate()

const FAKE_PNO_COUNT = 1000000
const FAKE_PNO_BATCH_COUNT = FAKE_PNO_COUNT / BATCH_SIZE

const FAKE_VESSEL_COUNT = 10000
const FAKE_VESSEL_BATCH_COUNT = FAKE_VESSEL_COUNT / BATCH_SIZE

const FAKE_REPORTING_COUNT = FAKE_VESSEL_COUNT * 3
const FAKE_REPORTING_BATCH_COUNT = FAKE_REPORTING_COUNT / BATCH_SIZE

function getFakePnoLogbookRawMessages(index) {
  return [
    {
      operation_number: `FAKE_OPERATION_${FAKE_PNO_COUNT + index}`,
      xml_message: `<Flux>Message FLUX xml</Flux>`
    },
    {
      operation_number: `FAKE_OPERATION_${FAKE_PNO_COUNT + index}_RET`,
      xml_message: `<Flux>Message FLUX xml</Flux>`
    }
  ]
}

function getFakePnoLogbookReports(index) {
  const vesselId = faker.number.int({ max: FAKE_VESSEL_COUNT * 2, min: FAKE_VESSEL_COUNT + 1 })
  const cfr = `FAKCFR_${vesselId}`
  const vessel_name = `FAUX NAVIRE ${vesselId}`

  const tripStartDateAsDayjs = dayjs(
    faker.date.between({
      from: START_DATE,
      to: END_DATE
    })
  )

  const operation_datetime_utc = tripStartDateAsDayjs.add(26, 'hours').format('YYYY-MM-DD HH:mm:ss')
  const report_id = `FAKE_OPERATION_${FAKE_PNO_COUNT + index}`
  const transmission_format = 'ERS'

  return [
    {
      cfr,
      enriched: true,
      flag_state: 'FRA',
      id: FAKE_PNO_COUNT + index,
      integration_datetime_utc: operation_datetime_utc,
      log_type: 'PNO',
      operation_datetime_utc,
      operation_number: report_id,
      operation_type: 'DAT',
      referenced_report_id: null,
      report_datetime_utc: operation_datetime_utc,
      report_id,
      transmission_format,
      trip_gears: [
        { dimensions: '250;180', gear: 'TBN', mesh: 100 },
        { dimensions: '250;280', gear: 'OTT', mesh: 120.5 }
      ],
      trip_segments: [
        { segment: 'SWW04', segmentName: 'Chaluts pélagiques' },
        { segment: 'SWW06', segmentName: 'Sennes' }
      ],
      value: {
        authorTrigram: null,
        catchOnboard: [
          {
            economicZone: 'FRA',
            effortZone: 'C',
            faoZone: '27.8.a',
            nbFish: null,
            species: 'ANF',
            statisticalRectangle: '23E6',
            weight: 150
          }
        ],
        pnoTypes: [
          {
            hasDesignatedPorts: false,
            minimumNotificationPeriod: 4,
            pnoTypeName: 'Préavis type Z'
          }
        ],
        port: 'BROIA',
        predictedArrivalDatetimeUtc: tripStartDateAsDayjs.add(30, 'hours').format('YYYY-MM-DDTHH:mm:ss[Z]'),
        predictedLandingDatetimeUtc: tripStartDateAsDayjs.add(31, 'hours').format('YYYY-MM-DDTHH:mm:ss[Z]'),
        purpose: 'LAN',
        riskFactor: 2.9,
        tripStartDate: tripStartDateAsDayjs.format('YYYY-MM-DDTHH:mm:ss[Z]'),
        updatedAt: null,
        updatedBy: null
      },
      vessel_name
    },
    // We need to have the exact same props as the DAT report otherwise `sql()` batch insert will fail
    {
      cfr: null,
      enriched: true,
      flag_state: null,
      id: 2 * FAKE_PNO_COUNT + index,
      integration_datetime_utc: operation_datetime_utc,
      log_type: null,
      operation_datetime_utc,
      operation_number: `${report_id}_RET`,
      operation_type: 'RET',
      referenced_report_id: report_id,
      report_datetime_utc: null,
      report_id: null,
      transmission_format,
      trip_gears: null,
      trip_segments: null,
      value: {
        returnStatus: '000'
      },
      vessel_name: null
    }
  ]
}

function getFakeReporting(index) {
  const vessel_id = faker.number.int({ max: FAKE_VESSEL_COUNT * 2, min: FAKE_VESSEL_COUNT + 1 })
  const internal_reference_number = `FAKCFR_${vessel_id}`
  const vessel_name = `FAUX NAVIRE ${vessel_id}`

  const creationDate = dayjs(
    faker.date.between({
      from: START_DATE,
      to: END_DATE
    })
  )

  const type = faker.helpers.arrayElement(['ALERT', 'INFRACTION_SUSPICION', 'OBSERVATION'])
  const value =
    type === 'ALERT'
      ? {
          natinfCode: 7059,
          riskFactor: faker.number.float({ max: 5, min: 0 }),
          seaFront: faker.helpers.arrayElement(['MED', 'MEMN', 'NAMO', 'SA']),
          type: 'THREE_MILES_TRAWLING_ALERT'
        }
      : {
          authorContact: '',
          authorTrigram: faker.string.alpha(3).toUpperCase(),
          controlUnitId: null,
          description: faker.lorem.sentence(),
          dml: 'DML 29',
          natinfCode: 23588,
          reportingActor: faker.helpers.arrayElement(['OPS', 'UNIT']),
          seaFront: faker.helpers.arrayElement(['MED', 'MEMN', 'NAMO', 'SA']),
          title: faker.lorem.sentence(),
          type
        }

  return {
    archived: false,
    creation_date: creationDate.format('YYYY-MM-DD HH:mm:ss'),
    deleted: false,
    external_reference_number: null,
    flag_state: 'FR',
    id: FAKE_REPORTING_COUNT + index,
    internal_reference_number,
    ircs: null,
    latitude: faker.location.latitude({ max: 51, min: 42, precision: 3 }),
    longitude: faker.location.longitude({ max: 10, min: -7, precision: 3 }),
    type,
    validation_date: creationDate.add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
    value,
    vessel_id,
    vessel_identifier: 'INTERNAL_REFERENCE_NUMBER',
    vessel_name
  }
}

function getFakeVessel(index) {
  const id = FAKE_VESSEL_COUNT + index

  return {
    cfr: `FAKCFR_${id}`,
    flag_state: 'FR',
    id,
    length: 99,
    vessel_name: `FAUX NAVIRE ${id}`
  }
}

const sql = postgres('postgres://postgres:postgres@localhost:5432/monitorfishdb')

async function run() {
  let batchIndex
  const spinner = ora('Starting...').start()

  try {
    // Ignore SQL notices
    await sql`SET client_min_messages TO WARNING`

    spinner.text = 'Deleting fake vessels...'
    await sql`DELETE FROM vessels WHERE id >= ${FAKE_VESSEL_COUNT + 1} AND id <= ${FAKE_VESSEL_COUNT * 2}`
    spinner.succeed('Fake vessels successfully deleted.')

    spinner.start('Generating fake vessels...')
    batchIndex = 1
    while (batchIndex <= FAKE_VESSEL_BATCH_COUNT) {
      const startIndex = (batchIndex - 1) * BATCH_SIZE + 1
      const endIndex = batchIndex * BATCH_SIZE
      spinner.text = `Generating fake vessels ${startIndex}->${endIndex} / ${FAKE_VESSEL_COUNT} (${Math.round((10000 * startIndex) / FAKE_VESSEL_COUNT) / 100}%)...`

      const fakeVessels = BATCH_SKELETON.map((_, index) => getFakeVessel(startIndex + index))
      await sql`INSERT INTO vessels ${sql(fakeVessels)}`

      batchIndex += 1
    }
    spinner.succeed('Fake vessels successfully generated.')

    spinner.start('Deleting fake reportings...')
    await sql`DELETE FROM reportings WHERE id >= ${FAKE_REPORTING_COUNT + 1} AND id <= ${FAKE_REPORTING_COUNT * 2}`
    spinner.succeed('Fake reportings successfully deleted.')

    spinner.start('Generating fake reporting...')
    batchIndex = 1
    while (batchIndex <= FAKE_REPORTING_BATCH_COUNT) {
      const startIndex = (batchIndex - 1) * BATCH_SIZE + 1
      const endIndex = batchIndex * BATCH_SIZE
      spinner.text = `Generating fake reportings ${startIndex}->${endIndex} / ${FAKE_REPORTING_COUNT} (${Math.round((10000 * startIndex) / FAKE_REPORTING_COUNT) / 100}%)...`

      const fakeReportings = BATCH_SKELETON.map((_, index) => getFakeReporting(startIndex + index))
      await sql`INSERT INTO reportings ${sql(fakeReportings)}`

      batchIndex += 1
    }
    spinner.succeed('Fake reportings successfully generated.')

    spinner.start('Deleting fake PNO logbook reports...')
    // Prevent TimescaleDB truncate cascade notices from spamming output (`truncate cascades to table "_hyper_2_135_chunk"`)
    await sql`SET client_min_messages TO WARNING`
    await sql`TRUNCATE TABLE logbook_raw_messages CASCADE`
    await sql`TRUNCATE TABLE logbook_reports`
    await sql`RESET client_min_messages`
    spinner.succeed('Fake PNO logbook reports successfully deleted.')

    spinner.start('Generating fake PNO logbook report...')
    batchIndex = 1
    while (batchIndex <= FAKE_PNO_BATCH_COUNT) {
      const startIndex = (batchIndex - 1) * BATCH_SIZE + 1
      const endIndex = batchIndex * BATCH_SIZE
      spinner.text = `Generating fake PNO logbook report ${startIndex}->${endIndex} / ${FAKE_PNO_COUNT} (${Math.round((10000 * startIndex) / FAKE_PNO_COUNT) / 100}%)...`

      const fakeLogbookRawMessages = BATCH_SKELETON.flatMap((_, index) =>
        getFakePnoLogbookRawMessages(startIndex + index)
      )
      const fakeLogbookReports = BATCH_SKELETON.flatMap((_, index) => getFakePnoLogbookReports(startIndex + index))

      spinner.text = `Generating fake PNO logbook report ${startIndex}->${endIndex} / ${FAKE_PNO_COUNT} (${Math.round((10000 * startIndex) / FAKE_PNO_COUNT) / 100}%) [RANDOMNESS CHECK: ${fakeLogbookReports[0].operation_datetime_utc}]...`
      await sql`INSERT INTO logbook_raw_messages ${sql(fakeLogbookRawMessages)}`
      await sql`INSERT INTO logbook_reports ${sql(fakeLogbookReports)}`

      batchIndex += 1
    }
    spinner.succeed('Fake PNO logbook report successfully generated.')
  } catch (error) {
    spinner.fail('Failed to generate perf data.')

    console.error(error)

    process.exit(1)
  } finally {
    await sql.end()
  }
}

run()
