import dotenv from 'dotenv'
import { promises as fs } from 'fs'
import _ from 'lodash/fp.js'
import got from 'got'

const CURRENT_DIRECTORY = process.cwd()

dotenv.config({ path: `${CURRENT_DIRECTORY}/scripts/.env` })

const SELECTED_CONTROL_UNIT_NAMES = [
  // Le Havre
  `PAM Jeanne Barret`,
  // Marseille
  `PAM Gyptis`,
  // Lorient
  `BGC Lorient - DF 36 Kan An Avel`,
  `BSL Lorient`,
  `PGMAR Lorient - P720 Geranium`,
  // Vannes
  `Cultures Marines - Ddtm 56 (historique)`, // <- Archived
  `Cultures marines 56`,
  `OFB Brigade Mobile d'Intervention – Bretagne`,
  `OFB SD 56`,
  `Police de l'eau 56`,
  // Lorient & Vannes
  `DPM 56`,
  `ULAM 56 ` // <- Trailing space
]

// Additional administations that are not automatically selected via the selected control units
const ADDITIONAL_ADMINISTRATION_NAMES = [
  `AFB` // <- Archived
]

const GOT_OPTIONS = {
  https: {
    pfx: await fs.readFile(`${CURRENT_DIRECTORY}/scripts/production.p12`),
    passphrase: process.env.P12_PASSWORD
  },
  username: process.env.BASIC_AUTH_USERNAME,
  password: process.env.BASIC_AUTH_PASSWORD
}

async function getWireMockStubSource(name, version, id = null) {
  return JSON.stringify(
    {
      request: {
        method: 'GET',
        url: `/api/${version}/${name}s${id ? `/${id}` : ''}`
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        },
        jsonBody: data
      }
    },
    null,
    2
  )
}

async function generateWireMockStub(name, version, data, id = null) {
  const sourceAsJson = JSON.stringify(
    {
      request: {
        method: 'GET',
        url: `/api/${version}/${name}${id !== null ? `/${id}` : ''}`
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*'
        },
        jsonBody: data
      }
    },
    null,
    2
  )

  await fs.writeFile(
    `${CURRENT_DIRECTORY}/cypress/mappings/get-${name}${id !== null ? `-${id}` : ''}.${version}.json`,
    sourceAsJson,
    'utf-8'
  )
}

async function getFromMonitorenvPubliApi(path) {
  return got.get(`https://monitorenv.din.developpement-durable.gouv.fr/api${path}`, GOT_OPTIONS).json()
}

const administrations = await getFromMonitorenvPubliApi('/v1/administrations')
const legacyControlUnits = await getFromMonitorenvPubliApi('/v1/control_units')
const controlUnits = await getFromMonitorenvPubliApi('/v2/control_units')
const controlUnitContacts = await getFromMonitorenvPubliApi('/v1/control_unit_contacts')
const controlUnitResources = await getFromMonitorenvPubliApi('/v1/control_unit_resources')
const stations = await getFromMonitorenvPubliApi('/v1/stations')

const selectedLegacyControlUnits = []
SELECTED_CONTROL_UNIT_NAMES.forEach(legacyControlUnitName => {
  const selectedControlUnitMatch = legacyControlUnits.find(
    legacyControlUnit => legacyControlUnit.name === legacyControlUnitName
  )
  if (!selectedControlUnitMatch) {
    console.error(`[ERROR] Control unit "${legacyControlUnitName}" not found.`)
    process.exit(1)
  }

  selectedLegacyControlUnits.push(selectedControlUnitMatch)
})
console.info(
  `[INFO] Selected legacy control units:\n${selectedLegacyControlUnits
    .map(legacyControlUnit => `  - ${legacyControlUnit.name}`)
    .join('\n')}`
)

const selectedControlUnits = []
SELECTED_CONTROL_UNIT_NAMES.forEach(controlUnitName => {
  const selectedControlUnitMatch = controlUnits.find(controlUnit => controlUnit.name === controlUnitName)
  if (!selectedControlUnitMatch) {
    console.error(`[ERROR] Control unit "${controlUnitName}" not found.`)
    process.exit(1)
  }

  selectedControlUnits.push(selectedControlUnitMatch)
})
console.info(
  `[INFO] Selected control units:\n${selectedControlUnits.map(controlUnit => `  - ${controlUnit.name}`).join('\n')}`
)

const selectedControlUnitContactIds = _.uniq(
  selectedControlUnits.map(controlUnit => controlUnit.controlUnitContactIds).flat()
)
const selectedControlUnitContacts = controlUnitContacts.filter(controlUnitContact =>
  selectedControlUnitContactIds.includes(controlUnitContact.id)
)
console.info(
  `[INFO] Selected control unit contacts:\n${selectedControlUnitContacts
    .map(controlUnitContact => `  - ${controlUnitContact.name}`)
    .join('\n')}`
)

const selectedControlUnitResourceIds = _.uniq(
  selectedControlUnits.map(controlUnit => controlUnit.controlUnitResourceIds).flat()
)
const selectedControlUnitResources = controlUnitResources.filter(controlUnitResource =>
  selectedControlUnitResourceIds.includes(controlUnitResource.id)
)
console.info(
  `[INFO] Selected control unit resources:\n${selectedControlUnitResources
    .map(controlUnitResource => `  - ${controlUnitResource.name}`)
    .join('\n')}`
)

const selectedStationIds = _.uniq(selectedControlUnitResources.map(controlUnit => controlUnit.stationId))
const selectedStations = stations.filter(station => selectedStationIds.includes(station.id))
console.info(`[INFO] Selected stations:\n${selectedStations.map(station => `  - ${station.name}`).join('\n')}`)

const selectedAdministrationIds = _.uniq([
  ...selectedControlUnits.map(controlUnit => controlUnit.administrationId),
  ...administrations
    .filter(administration => ADDITIONAL_ADMINISTRATION_NAMES.includes(administration.name))
    .map(administration => administration.id)
])
const selectedAdministrations = administrations.filter(administration =>
  selectedAdministrationIds.includes(administration.id)
)
console.info(
  `[INFO] Selected administrations:\n${selectedAdministrations
    .map(administration => `  - ${administration.name}`)
    .join('\n')}`
)

await generateWireMockStub('administrations', 'v1', selectedAdministrations)
await generateWireMockStub('control_units', 'v1', selectedLegacyControlUnits)
await generateWireMockStub('control_units', 'v2', selectedControlUnits)
await Promise.all(
  selectedControlUnits.map(async controlUnit => {
    await generateWireMockStub('control_units', 'v2', controlUnit, controlUnit.id)
  })
)
await generateWireMockStub('control_unit_contacts', 'v1', selectedControlUnitContacts)
await generateWireMockStub('control_unit_resources', 'v1', selectedControlUnitResources)
await generateWireMockStub('stations', 'v1', selectedStations)
