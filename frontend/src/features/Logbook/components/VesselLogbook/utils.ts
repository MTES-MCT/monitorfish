import { getOptionsFromStrings } from '../../../../utils/getOptionsFromStrings'
import { LogbookMessageType, LogbookSoftware } from '../../constants'
import {
  areAllMessagesNotAcknowledged,
  getCPSMessages,
  getCPSNumberOfDistinctSpecies,
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
import type { Logbook } from '@features/Logbook/Logbook.types'
import type { Option } from '@mtes-mct/monitor-ui'

export function getLogbookSoftware(software: string | undefined): LogbookSoftware {
  if (!software) {
    return LogbookSoftware.NONE
  }

  if (software.includes('TurboCatch') || software.includes('IKTUS')) {
    return LogbookSoftware.JPE
  }

  // Fiche de pêche papier
  if (software.includes('FP')) {
    return LogbookSoftware.FPP
  }

  // Journal de pêche papier
  if (software.includes('JP')) {
    return LogbookSoftware.JPP
  }

  // Fiche de pêche télétransmise ou journal de pêche télétransmis
  if (software.includes('FT') || software.includes('JT')) {
    return LogbookSoftware.VIS
  }

  return LogbookSoftware.NONE
}

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

export function getLogbookTripSummary(logbookMessages: Logbook.Message[] | undefined): LogbookTripSummary {
  if (!logbookMessages?.length) {
    return EMPTY_LOGBOOK_TRIP_SUMMARY
  }

  const depMessage = getDEPMessage(logbookMessages)
  const totalDEPWeight = getTotalDEPWeight(depMessage)

  const lanMessage = getLANMessage(logbookMessages)

  const disMessages = getDISMessages(logbookMessages)
  const totalDISWeight = getTotalDISWeight(disMessages)

  const cpsMessages = getCPSMessages(logbookMessages)
  const numberOfSpecies = getCPSNumberOfDistinctSpecies(cpsMessages)

  const farMessages = getFARMessages(logbookMessages)
  const totalFARWeight = getTotalFARWeight(farMessages)

  const pnoMessage = getPNOMessage(logbookMessages)
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

export function getLogbookMessagesTypeOptions(): Option[] {
  const displayedMessages = Object.values(LogbookMessageType)
    .filter(message => message.isFilterable)
    .map(message => message.code)

  return getOptionsFromStrings(displayedMessages)
}
