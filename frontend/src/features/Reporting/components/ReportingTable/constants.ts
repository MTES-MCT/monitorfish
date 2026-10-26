import { WSG84_PROJECTION } from '@features/Map/constants'
import { getReportingOrigin, getReportingTitle } from '@features/Reporting/components/ReportingTable/utils'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { getCoordinates } from '@mtes-mct/monitor-ui'

import type { CoordinatesFormat } from '@features/Map/constants'
import type { Reporting } from '@features/Reporting/types'
import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

function getFormattedCoordinate(
  reporting: Reporting.Reporting,
  coordinatesFormat: CoordinatesFormat,
  index: 0 | 1
): string {
  if (reporting.latitude === undefined || reporting.longitude === undefined) {
    return ''
  }

  return (
    getCoordinates([reporting.longitude, reporting.latitude], WSG84_PROJECTION, coordinatesFormat)[index]?.replace(
      / /g,
      ''
    ) ?? ''
  )
}

function getNatinfCodes(reporting: Reporting.Reporting): number | string {
  switch (reporting.type) {
    case ReportingType.ALERT:
      return reporting.value.natinfCode
    case ReportingType.INFRACTION_SUSPICION:
      return reporting.value.infractions.map(({ natinfCode }) => natinfCode).join(' / ')
    default:
      return ''
  }
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const getReportingCsvMap = (coordinatesFormat: CoordinatesFormat): DownloadAsCsvMap<Reporting.Reporting> => ({
  reportingDate: 'Date début',
  type: {
    label: 'Source',
    transform: getReportingOrigin
  },
  'value.type': {
    label: 'Titre',
    transform: getReportingTitle
  },
  'value.description': 'Description',
  natinf: {
    label: 'NATINF',
    transform: getNatinfCodes
  },
  flagState: {
    label: 'Pavillon',
    transform: reporting => (reporting.flagState === 'UNDEFINED' ? 'Inconnu' : reporting.flagState)
  },
  vesselName: 'Navire',
  cfr: 'CFR',
  externalMarker: 'Marquage ext.',
  ircs: 'C/S',
  underCharter: {
    label: 'Navire sous charte',
    transform: reporting => (reporting.underCharter ? 'OUI' : 'NON')
  },
  'value.seaFront': 'Façade',
  isArchived: {
    label: 'Statut',
    transform: reporting => (reporting.isArchived ? 'Archivé' : 'En cours')
  },
  isIUU: {
    label: 'INN',
    transform: reporting => (reporting.isIUU ? 'OUI' : 'NON')
  },
  latitude: {
    label: 'Latitude',
    transform: reporting => getFormattedCoordinate(reporting, coordinatesFormat, 0)
  },
  longitude: {
    label: 'Longitude',
    transform: reporting => getFormattedCoordinate(reporting, coordinatesFormat, 1)
  }
})
/* eslint-enable sort-keys-fix/sort-keys-fix */
