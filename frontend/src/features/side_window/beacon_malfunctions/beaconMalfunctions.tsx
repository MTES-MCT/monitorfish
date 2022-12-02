import * as timeago from 'timeago.js'

import {
  BeaconMalfunctionPropertyName,
  BeaconMalfunctionsStage,
  BeaconMalfunctionVesselStatus,
  END_OF_MALFUNCTION_REASON_RECORD,
  EndOfBeaconMalfunctionReason,
  STAGE_RECORD,
  VESSEL_STATUS
} from '../../../domain/entities/beaconMalfunction/constants'
import { getDate, getTextForSearch, getTime } from '../../../utils'
import { BeaconMalfunctionsDetailsFollowUpNotification } from './BeaconMalfunctionsDetailsFollowUpNotification'

import type {
  BeaconMalfunction,
  BeaconMalfunctionAction,
  BeaconMalfunctionComment,
  BeaconMalfunctionFollowUpItem,
  BeaconMalfunctionStatusValue
} from '../../../domain/entities/beaconMalfunction/types'

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
  if (beaconMalfunction.stage === STAGE_RECORD.INITIAL_ENCOUNTER.code) {
    return `ouverte ${getReducedTimeAgo(
      getBeaconCreationDate(beaconMalfunction.malfunctionStartDateTime, beaconMalfunction.vesselStatus)
    )}`
  }

  return `modifiée ${getReducedTimeAgo(beaconMalfunction.vesselStatusLastModificationDateTime)}`
}

export function getContent(
  item: BeaconMalfunctionFollowUpItem,
  beaconMalfunction: BeaconMalfunction,
  firstVesselStatus: BeaconMalfunctionStatusValue
) {
  if (item.isBeaconCreationMessage) {
    return getFirstStatusAction(firstVesselStatus, beaconMalfunction?.malfunctionStartDateTime)
  }

  switch (item.type) {
    case BeaconMalfunctionDetailsType.COMMENT:
      return (item as BeaconMalfunctionComment).comment
    case BeaconMalfunctionDetailsType.ACTION:
      return getActionText(item as BeaconMalfunctionAction, beaconMalfunction.endOfBeaconMalfunctionReason)
    case BeaconMalfunctionDetailsType.NOTIFICATION:
      return <BeaconMalfunctionsDetailsFollowUpNotification notification={item} />
    default:
      throw new Error('This should never happen.')
  }
}

const getFirstStatusAction = (vesselStatus: BeaconMalfunctionStatusValue, malfunctionStartDateTime: string) => {
  if (
    vesselStatus.value === BeaconMalfunctionVesselStatus.AT_PORT ||
    vesselStatus.value === BeaconMalfunctionVesselStatus.AT_SEA
  ) {
    return `Avarie ${vesselStatus.label.replace(
      'Navire ',
      ''
    )} ouverte dans MonitorFish, dernière émission le ${getDate(malfunctionStartDateTime)} à ${getTime(
      malfunctionStartDateTime,
      true
    )} (UTC)`
  }

  return ''
}

export function getActionText(
  action: BeaconMalfunctionAction,
  endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason | null
) {
  switch (action.propertyName) {
    case BeaconMalfunctionPropertyName.VESSEL_STATUS: {
      const previousValue = VESSEL_STATUS.find(status => status.value === action.previousValue)?.label
      const nextValue = VESSEL_STATUS.find(status => status.value === action.nextValue)?.label

      return (
        <>
          Le statut du ticket a été modifié, de <b>{previousValue}</b> à <b>{nextValue}</b>.
        </>
      )
    }
    case BeaconMalfunctionPropertyName.STAGE: {
      const previousValue = STAGE_RECORD[action.previousValue].title
      const nextValue = STAGE_RECORD[action.nextValue].title
      const additionalText = endOfBeaconMalfunctionReason
        ? END_OF_MALFUNCTION_REASON_RECORD[endOfBeaconMalfunctionReason].label
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
  const columns = Object.keys(STAGE_RECORD).filter(stage => STAGE_RECORD[stage as BeaconMalfunctionsStage].isColumn)

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

export enum BeaconMalfunctionDetailsType {
  ACTION = 'ACTION',
  COMMENT = 'COMMENT',
  NOTIFICATION = 'NOTIFICATION'
}

export function searchInBeaconMalfunctions(
  beaconMalfunctions: Record<BeaconMalfunctionsStage, BeaconMalfunction[]>,
  searchedVessel: string,
  filteredVesselStatus: BeaconMalfunctionStatusValue | undefined
) {
  let nextFilteredItems = beaconMalfunctions

  if (searchedVessel?.length > 1) {
    nextFilteredItems = Object.keys(beaconMalfunctions).reduce(
      (previous, stage) => ({
        ...previous,
        [stage]: beaconMalfunctions[stage].filter(
          beaconMalfunction =>
            getTextForSearch(beaconMalfunction.vesselName).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconMalfunction.internalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconMalfunction.externalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
            getTextForSearch(beaconMalfunction.ircs).includes(getTextForSearch(searchedVessel))
        )
      }),
      {} as any
    )
  }

  if (filteredVesselStatus) {
    nextFilteredItems = Object.keys(nextFilteredItems).reduce(
      (previous, stage) => ({
        ...previous,
        [stage]: nextFilteredItems[stage].filter(
          beaconMalfunction => beaconMalfunction.vesselStatus === filteredVesselStatus.value
        )
      }),
      {} as any
    )
  }

  return nextFilteredItems
}
