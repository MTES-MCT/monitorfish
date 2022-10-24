import * as timeago from 'timeago.js'
import {
  BeaconMalfunctionPropertyName,
  beaconMalfunctionsStageColumnRecord,
  endOfBeaconMalfunctionReasons,
  vesselStatuses
} from '../../../domain/entities/beaconMalfunction/constants'

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
  if (beaconMalfunction?.stage === beaconMalfunctionsStageColumnRecord.INITIAL_ENCOUNTER.code) {
    return `ouverte ${getReducedTimeAgo(getBeaconCreationDate(beaconMalfunction?.malfunctionStartDateTime, beaconMalfunction?.vesselStatus))}`
  }

  return `modifiée ${getReducedTimeAgo(beaconMalfunction?.vesselStatusLastModificationDateTime)}`
}

export const getActionText = (action, endOfBeaconMalfunctionReason) => {
  if (action.propertyName === BeaconMalfunctionPropertyName.VESSEL_STATUS) {
    const previousValue = vesselStatuses.find(status => status.value === action.previousValue)?.label
    const nextValue = vesselStatuses.find(status => status.value === action.nextValue)?.label

    return <>Le statut du ticket a été modifié, de <b>{previousValue}</b> à <b>{nextValue}</b>.</>
  } else if (action.propertyName === BeaconMalfunctionPropertyName.STAGE) {
    const previousValue = beaconMalfunctionsStageColumnRecord[action.previousValue].title
    const nextValue = beaconMalfunctionsStageColumnRecord[action.nextValue].title

    let additionalText = ''
    if (endOfBeaconMalfunctionReason) {
      switch (endOfBeaconMalfunctionReason) {
        case endOfBeaconMalfunctionReasons.RESUMED_TRANSMISSION.value:
          additionalText = endOfBeaconMalfunctionReasons.RESUMED_TRANSMISSION.label
          break
        case endOfBeaconMalfunctionReasons.PERMANENT_INTERRUPTION_OF_SUPERVISION.value:
          additionalText = endOfBeaconMalfunctionReasons.PERMANENT_INTERRUPTION_OF_SUPERVISION.label
          break
        case endOfBeaconMalfunctionReasons.TEMPORARY_INTERRUPTION_OF_SUPERVISION.value:
          additionalText = endOfBeaconMalfunctionReasons.TEMPORARY_INTERRUPTION_OF_SUPERVISION.label
          break
      }
    }

    return <>Le ticket a été déplacé de <b>{previousValue}</b> à <b>{nextValue}</b>.
      {
        additionalText
          ? <>{' '}Il a été clôturé pour cause de <b>{additionalText}</b>.</>
          : ''
      }
    </>
  }
}

export function getReducedTimeAgo (dateTime) {
  return timeago.format(dateTime, 'fr')
    .replace('semaines', 'sem.')
    .replace('semaine', 'sem.')
}

const getByStage = (stage, beaconMalfunctions) =>
  beaconMalfunctions
    .filter(item => item.stage === stage)
    .sort((a, b) => b.vesselStatusLastModificationDateTime?.localeCompare(a.vesselStatusLastModificationDateTime))

export const getBeaconMalfunctionsByStage = beaconsMalfunctions =>
  Object.keys(beaconMalfunctionsStageColumnRecord)
    .filter(stage => beaconMalfunctionsStageColumnRecord[stage].isColumn)
    .reduce(
      (previous, stage) => ({
        ...previous,
        [stage]: getByStage(stage, beaconsMalfunctions)
      }),
      {}
    )

export const BeaconMalfunctionDetailsType = {
  ACTION: 'ACTION',
  COMMENT: 'COMMENT',
  NOTIFICATION: 'NOTIFICATION'
}
