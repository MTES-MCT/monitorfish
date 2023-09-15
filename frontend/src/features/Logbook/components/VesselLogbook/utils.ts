import {
  areAllMessagesNotAcknowledged,
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

export const emptyLogbookTripSummary = {
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
    return emptyLogbookTripSummary
  }

  const messages = fishingActivities.logbookMessages

  const depMessage = getDEPMessage(messages)
  const totalDEPWeight = getTotalDEPWeight(depMessage)

  const lanMessage = getLANMessage(messages)

  const disMessages = getDISMessages(messages)
  const totalDISWeight = getTotalDISWeight(disMessages)

  const farMessages = getFARMessages(messages)
  const totalFARWeight = getTotalFARWeight(farMessages)

  const pnoMessage = getPNOMessage(messages)
  const totalPNOWeight = getTotalPNOWeight(pnoMessage)

  return {
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
