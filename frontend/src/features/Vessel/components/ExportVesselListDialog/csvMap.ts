import { CoordinatesFormat, OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import { sortBy } from 'lodash-es'

import { getCoordinates } from '../../../../coordinates'

import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const VESSEL_LIST_CSV_MAP_BASE: DownloadAsCsvMap<Omit<Vessel.ActiveVesselEmittingPosition, 'id'>> = {
  riskFactor: 'Note de risque',
  flagState: {
    label: 'Nationalité',
    transform: vessel => countries.getName(vessel.flagState, 'fr') ?? ''
  },
  vesselName: 'Nom',
  internalReferenceNumber: 'CFR',
  ircs: 'C/S',
  mmsi: 'MMSI',
  externalReferenceNumber: 'Marquage externe',
  length: {
    label: 'Longueur',
    transform: vessel => `${vessel.length} m`
  },
  segments: {
    label: 'Segment de flotte',
    transform: vessel => vessel.segments.join(', ')
  },
  gearsArray: {
    label: 'Engins à bord',
    transform: vessel => vessel.gearsArray.join(', ')
  },
  speciesArray: {
    label: 'Espèces à bord',
    transform: vessel =>
      sortBy(vessel.speciesOnboard, ['weight'])
        .map(specy => specy.species)
        .reverse()
        .join(', ')
  },
  lastControlAtSeaDateTime: {
    label: 'Date dernier contrôle en mer',
    transform: vessel =>
      vessel.lastControlAtSeaDateTime ? customDayjs(vessel.lastControlAtSeaDateTime).utc().format('YYYY-MM-DD') : ''
  },
  lastControlAtQuayDateTime: {
    label: 'Date dernier contrôle à quai',
    transform: vessel =>
      vessel.lastControlAtQuayDateTime ? customDayjs(vessel.lastControlAtQuayDateTime).utc().format('YYYY-MM-DD') : ''
  },
  dateTime: {
    label: 'GDH (UTC)',
    transform: vessel => customDayjs(vessel.dateTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
  },
  latitude: {
    label: 'Latitude',
    transform: vessel =>
      getCoordinates(vessel.coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_DECIMALS)[0]?.replace(
        / /g,
        ''
      )
  },
  longitude: {
    label: 'Longitude',
    transform: vessel =>
      getCoordinates(vessel.coordinates, OPENLAYERS_PROJECTION, CoordinatesFormat.DEGREES_MINUTES_DECIMALS)[1]?.replace(
        / /g,
        ''
      )
  },
  course: 'Cap',
  speed: 'Vitesse',
  lastLogbookMessageDateTime: {
    label: 'Statut de JPE',
    transform: vessel => (vessel.lastLogbookMessageDateTime ? 'Equipé' : 'Non équipé')
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
