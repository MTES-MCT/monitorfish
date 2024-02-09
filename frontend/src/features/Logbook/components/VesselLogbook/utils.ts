import { getOptionsFromStrings } from '../../../../utils/getOptionsFromStrings'
import { LogbookMessageType } from '../../constants'
import {
  areAllMessagesNotAcknowledged,
  getCPSDistinctSpecies,
  getCPSMessages,
  getDEPMessage,
  getDISMessages,
  getDISSpeciesInsightRecord,
  getFARMessages,
  getFARSpeciesInsightListRecord,
  getFARSpeciesInsightRecord,
  getLANMessage,
  getLANSpeciesInsightRecord,
  getPNOMessage,
  getPNOSpeciesInsightRecord,
  getTotalDEPWeight,
  getTotalDISWeight,
  getTotalFARWeight,
  getTotalLANWeight,
  getTotalPNOWeight
} from '../../utils'

import type { LogbookTripSummary } from './types'
import type { FishingActivities, Gear } from '../../Logbook.types'

export const EMPTY_LOGBOOK_TRIP_SUMMARY = {
  cps: {
    areAllMessagesNotAcknowledged: false,
    logs: [],
    numberOfSpecies: 0
  },
  dep: {
    log: undefined,
    totalWeight: 0
  },
  dis: {
    areAllMessagesNotAcknowledged: false,
    logs: [],
    speciesToWeight: undefined,
    totalWeight: 0
  },
  far: {
    areAllMessagesNotAcknowledged: false,
    logs: [],
    speciesAndPresentationToWeight: undefined,
    speciesToWeight: undefined,
    totalWeight: 0
  },
  lan: {
    log: undefined,
    speciesToWeight: undefined,
    totalWeight: 0
  },
  pno: {
    log: undefined,
    speciesToWeight: undefined,
    totalFARAndDEPWeight: 0,
    totalWeight: 0
  }
}

export function getLogbookTripSummary(fishingActivities: FishingActivities | undefined): LogbookTripSummary {
  if (!fishingActivities?.logbookMessages?.length) {
    return EMPTY_LOGBOOK_TRIP_SUMMARY
  }

  const messages = fishingActivities.logbookMessages

  const depMessage = getDEPMessage(messages)
  const totalDEPWeight = getTotalDEPWeight(depMessage)

  const lanMessage = getLANMessage(messages)

  const disMessages = getDISMessages(messages)
  const totalDISWeight = getTotalDISWeight(disMessages)

  const cpsMessages = getCPSMessages(messages)
  const numberOfSpecies = getCPSDistinctSpecies(cpsMessages)

  const farMessages = getFARMessages(messages)
  const totalFARWeight = getTotalFARWeight(farMessages)

  const pnoMessage = getPNOMessage(messages)
  const totalPNOWeight = getTotalPNOWeight(pnoMessage?.message)

  return {
    cps: {
      areAllMessagesNotAcknowledged: areAllMessagesNotAcknowledged(cpsMessages),
      logs: cpsMessages.map(message => message.message),
      numberOfSpecies
    },
    dep: {
      log: depMessage,
      totalWeight: totalDEPWeight
    },
    dis: {
      areAllMessagesNotAcknowledged: areAllMessagesNotAcknowledged(disMessages),
      logs: disMessages,
      speciesToWeight: getDISSpeciesInsightRecord(disMessages, totalDISWeight),
      totalWeight: totalDISWeight
    },
    far: {
      areAllMessagesNotAcknowledged: areAllMessagesNotAcknowledged(farMessages),
      logs: farMessages,
      speciesAndPresentationToWeight: getFARSpeciesInsightListRecord(farMessages),
      speciesToWeight: getFARSpeciesInsightRecord(farMessages, totalFARWeight),
      totalWeight: totalFARWeight
    },
    lan: {
      log: lanMessage,
      speciesToWeight: getLANSpeciesInsightRecord(lanMessage),
      totalWeight: getTotalLANWeight(lanMessage)
    },
    pno: {
      log: pnoMessage,
      speciesToWeight: getPNOSpeciesInsightRecord(pnoMessage, totalPNOWeight),
      totalFARAndDEPWeight: totalDEPWeight + totalFARWeight,
      totalWeight: totalPNOWeight
    }
  }
}

export function getUniqueGears(gearOnboard: Gear[] | undefined): Gear[] {
  return (
    gearOnboard?.reduce((acc: Gear[], current) => {
      const found = acc.find(item => item.gear === current.gear && item.gearName === current.gearName)

      if (!found) {
        return acc.concat([current])
      }

      return acc
    }, []) || []
  )
}

export function getLogbookMessagesTypeOptions() {
  const displayedMessages = Object.values(LogbookMessageType)
    .filter(message => message.isFilterable)
    .map(message => message.code)

  return getOptionsFromStrings(displayedMessages)
}
