import { CoordinatesFormat, OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'

import { getCoordinates } from '../../../../coordinates'

import type { DownloadAsCsvMap } from '@utils/downloadAsCsv'

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const VESSEL_LIST_CSV_MAP_BASE: DownloadAsCsvMap<Vessel.VesselLastPosition> = {
  riskFactor: 'Note de risque',
  flagState: {
    label: 'Nationalité',
    transform: vessel => countries.getName(vessel.flagState, 'fr') ?? ''
  },
  vesselName: 'Nom',
  internalReferenceNumber: 'CFR',
  ircs: 'C/S',
  mmsi: 'MMSI',
  externalReferenceNumber: 'Marquage extérieur',
  length: {
    label: 'Longueur du navire',
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
    transform: vessel => vessel.speciesArray.join(', ')
  },
  lastControlDateTime: {
    label: 'Date dernier contrôle',
    transform: vessel =>
      vessel.lastControlDateTime ? customDayjs(vessel.lastControlDateTime).utc().format('YYYY-MM-DD') : ''
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
