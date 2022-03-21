import * as timeago from 'timeago.js'
import { beaconMalfunctionsStages } from '../../../domain/entities/beaconMalfunction'

export const BeaconMalfunctionsSubMenu = {
  PAIRING: {
    name: 'Apparaige des balises',
    code: 'PAIRING'
  },
  MALFUNCTIONING: {
    name: 'Avaries VMS en cours',
    code: 'MALFUNCTIONING'
  },
  HISTORIC: {
    name: 'Historique des avaries',
    code: 'MED'
  }
}

const BEACON_CREATION_AT_SEA_OFFSET = 6
const BEACON_CREATION_AT_PORT_OFFSET = 24

export const getBeaconCreationDate = (dateLastEmission, status) => {
  switch (status) {
    case 'AT_PORT': {
      const beaconCreationDate = new Date(dateLastEmission)
      beaconCreationDate.setHours(beaconCreationDate.getHours() + BEACON_CREATION_AT_PORT_OFFSET)

      return beaconCreationDate
    }
    case 'AT_SEA': {
      const beaconCreationDate = new Date(dateLastEmission)
      beaconCreationDate.setHours(beaconCreationDate.getHours() + BEACON_CREATION_AT_SEA_OFFSET)

      return beaconCreationDate
    }
    default: return dateLastEmission
  }
}

export function getBeaconCreationOrModificationDate (beaconMalfunction) {
  if (beaconMalfunction?.stage === beaconMalfunctionsStages.INITIAL_ENCOUNTER.code) {
    return `ouverte ${getReducedTimeAgo(getBeaconCreationDate(beaconMalfunction?.malfunctionStartDateTime, beaconMalfunction?.vesselStatus))}`
  }

  return `modifiée ${getReducedTimeAgo(beaconMalfunction?.vesselStatusLastModificationDateTime)}`
}

export function getReducedTimeAgo (dateTime) {
  return timeago.format(dateTime, 'fr')
    .replace('semaines', 'sem.')
    .replace('semaine', 'sem.')
}
