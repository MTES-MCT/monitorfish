import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { Logbook } from '@features/Logbook/Logbook.types'
import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

const LIST_SEPARATOR = ' / '

const formatDate = (date: string | undefined): string =>
  date ? customDayjs(date).utc().format('DD/MM/YYYY HH:mm') : ''

const joinDistinct = (values: Array<string | undefined>): string =>
  [...new Set(values.filter((value): value is string => !!value))].join(LIST_SEPARATOR)

const sumWeight = (catches: Logbook.Catch[]): number => catches.reduce((total, { weight }) => total + (weight ?? 0), 0)

const getWeightBySpecies = (catches: Logbook.Catch[]): Array<[string, number]> => {
  const weightBySpecies = catches.reduce<Record<string, number>>((accumulator, { species, weight }) => {
    accumulator[species] = (accumulator[species] ?? 0) + (weight ?? 0)

    return accumulator
  }, {})

  return Object.entries(weightBySpecies).sort(([a], [b]) => a.localeCompare(b))
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const PRIOR_NOTIFICATIONS_CSV_MAP: DownloadAsCsvMap<PriorNotification.PriorNotification> = {
  reportId: 'Réf.',
  sentAt: {
    label: 'Date de réception (UTC)',
    transform: priorNotification => formatDate(priorNotification.sentAt)
  },
  expectedArrivalDate: {
    label: 'Arrivée estimée (UTC)',
    transform: priorNotification => formatDate(priorNotification.expectedArrivalDate)
  },
  expectedLandingDate: {
    label: 'Débarquement prévu (UTC)',
    transform: priorNotification => formatDate(priorNotification.expectedLandingDate)
  },
  vesselName: 'Navire',
  vesselInternalReferenceNumber: 'CFR',
  vesselExternalReferenceNumber: 'Marquage ext.',
  vesselIrcs: 'C/S',
  vesselFlagCountryCode: 'Pavillon',
  vesselLength: 'Longueur (m)',
  portName: 'Port',
  portLocode: 'Locode port',
  seafront: 'Façade',
  purposeCode: {
    label: 'Raison',
    transform: priorNotification =>
      priorNotification.purposeCode ? PriorNotification.PURPOSE_LABEL[priorNotification.purposeCode] : ''
  },
  types: {
    label: 'Types',
    transform: priorNotification => joinDistinct(priorNotification.types.map(({ name }) => name))
  },
  tripSegments: {
    label: 'Segments',
    transform: priorNotification => joinDistinct(priorNotification.tripSegments.map(({ code }) => code))
  },
  tripGears: {
    label: 'Engins',
    transform: priorNotification => joinDistinct(priorNotification.tripGears.map(({ gear }) => gear))
  },
  faoZones: {
    label: 'Zones FAO',
    transform: priorNotification => joinDistinct(priorNotification.onBoardCatches.map(({ faoZone }) => faoZone))
  },
  species: {
    label: 'Espèces',
    transform: priorNotification =>
      getWeightBySpecies(priorNotification.onBoardCatches)
        .map(([species]) => species)
        .join(LIST_SEPARATOR)
  },
  catchesDetail: {
    label: 'Détail captures (kg)',
    transform: priorNotification =>
      getWeightBySpecies(priorNotification.onBoardCatches)
        .map(([species, weight]) => `${species} ${weight}`)
        .join(LIST_SEPARATOR)
  },
  totalWeight: {
    label: 'Poids total (kg)',
    transform: priorNotification => sumWeight(priorNotification.onBoardCatches)
  },
  riskFactor: 'Note de risque',
  reportingCount: 'Signalements',
  vesselLastControlDateTime: {
    label: 'Dernier contrôle (UTC)',
    transform: priorNotification => formatDate(priorNotification.vesselLastControlDateTime)
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
