import * as timeago from 'timeago.js'

import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionsStage,
  beaconMalfunctionsStageColumnRecord,
  EndOfBeaconMalfunctionReason,
  endOfBeaconMalfunctionReasonRecord,
  vesselStatuses
} from '../../../domain/entities/beaconMalfunction/constants'

import type { BeaconMalfunction, BeaconMalfunctionAction } from '../../../domain/types/beaconMalfunction'

export const BeaconMalfunctionsSubMenu = {
  HISTORIC: {
    code: 'MED',
    name: 'Historique des avaries'
  },
  MALFUNCTIONING: {
    code: 'MALFUNCTIONING',
    name: 'Avaries VMS en cours'
  },
  PAIRING: {
    code: 'PAIRING',
    name: 'Apparaige des balises'
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
    default:
      return dateLastEmission
  }
}

export function getBeaconCreationOrModificationDate(beaconMalfunction: BeaconMalfunction) {
  if (beaconMalfunction.stage === beaconMalfunctionsStageColumnRecord.INITIAL_ENCOUNTER.code) {
    return `ouverte ${getReducedTimeAgo(
      getBeaconCreationDate(beaconMalfunction.malfunctionStartDateTime, beaconMalfunction.vesselStatus)
    )}`
  }

  return `modifiée ${getReducedTimeAgo(beaconMalfunction.vesselStatusLastModificationDateTime)}`
}

export function getActionText(
  action: BeaconMalfunctionAction,
  endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason | null
) {
  switch (action.propertyName) {
    case BeaconMalfunctionPropertyName.VESSEL_STATUS: {
      const previousValue = vesselStatuses.find(status => status.value === action.previousValue)?.label
      const nextValue = vesselStatuses.find(status => status.value === action.nextValue)?.label

      return (
        <>
          Le statut du ticket a été modifié, de <b>{previousValue}</b> à <b>{nextValue}</b>.
        </>
      )
    }
    case BeaconMalfunctionPropertyName.STAGE: {
      const previousValue = beaconMalfunctionsStageColumnRecord[action.previousValue].title
      const nextValue = beaconMalfunctionsStageColumnRecord[action.nextValue].title
      const additionalText = endOfBeaconMalfunctionReason
        ? endOfBeaconMalfunctionReasonRecord[endOfBeaconMalfunctionReason].label
        : ''

      return (
        <>
          Le ticket a été déplacé de <b>{previousValue}</b> à <b>{nextValue}</b>.
          {additionalText ? (
            <>
              {' '}
              Il a été clôturé pour cause de <b>{additionalText}</b>.
            </>
          ) : (
            ''
          )}
        </>
      )
    }
    default:
      throw Error('Should not happen')
  }
}

export function getReducedTimeAgo(dateTime) {
  return timeago.format(dateTime, 'fr').replace('semaines', 'sem.').replace('semaine', 'sem.')
}

function getByStage(stage: BeaconMalfunctionsStage, beaconMalfunctions: BeaconMalfunction[]): BeaconMalfunction[] {
  return beaconMalfunctions
    .filter(item => item.stage === stage)
    .sort((a, b) => b.vesselStatusLastModificationDateTime?.localeCompare(a.vesselStatusLastModificationDateTime))
}

export function getBeaconMalfunctionsByStage(
  beaconsMalfunctions: BeaconMalfunction[]
): Record<BeaconMalfunctionsStage, BeaconMalfunction[]> | undefined {
  const columns = Object.keys(beaconMalfunctionsStageColumnRecord).filter(
    stage => beaconMalfunctionsStageColumnRecord[stage as BeaconMalfunctionsStage].isColumn
  )

  if (!columns.length) {
    return undefined
  }

  return columns.reduce<Record<BeaconMalfunctionsStage, BeaconMalfunction[]>>(
    (previous, stage) => ({
      ...previous,
      [stage]: getByStage(stage as BeaconMalfunctionsStage, beaconsMalfunctions)
    }),
    {} as Record<BeaconMalfunctionsStage, BeaconMalfunction[]>
  )
}

export const BeaconMalfunctionDetailsType = {
  ACTION: 'ACTION',
  COMMENT: 'COMMENT',
  NOTIFICATION: 'NOTIFICATION'
}
