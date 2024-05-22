import { expect } from '@jest/globals'

import {
  correctedLANMessage,
  correctedPNOMessage,
  dummyCpsMessage,
  dummyLogbookMessages,
  dummyLanMessageWithLVRCPresentationSpecies
} from './__mocks__/logbookMessages'
import {
  buildCatchArray,
  getCPSDistinctSpecies,
  getDEPMessage,
  getDISMessages,
  getFARMessages,
  getLANMessage,
  getPNOMessage,
  getTotalDEPWeight,
  getTotalDISWeight,
  getTotalFARWeight,
  getTotalLANWeight,
  getTotalPNOWeight
} from '../utils'

describe('Logbook/utils.tsx', () => {
  it('getPNOMessage Should get the first valid PNO message', async () => {
    const pnosWithAnotherCorrectedMessage = dummyLogbookMessages.concat(correctedPNOMessage)

    // When (we reverse the array to have the corrected message first)
    const pno = getPNOMessage(pnosWithAnotherCorrectedMessage.reverse())

    // Then
    expect(pno?.internalReferenceNumber).toEqual('FAK000999999')
    expect(pno?.messageType).toEqual('PNO')
    expect(pno?.isCorrectedByNewerMessage).toBeFalsy()
    expect(pno?.isDeleted).toBeFalsy()
  })

  it('getLANMessage Should get the first valid LAN message', async () => {
    const lansWithAnotherCorrectedMessage = dummyLogbookMessages.concat(correctedLANMessage)

    // When (we reverse the array to have the corrected message first)
    const lan = getLANMessage(lansWithAnotherCorrectedMessage.reverse())

    // Then
    expect(lan?.internalReferenceNumber).toEqual('FAK000999999')
    expect(lan?.messageType).toEqual('LAN')
    expect(lan?.isCorrectedByNewerMessage).toBeFalsy()
    expect(lan?.isDeleted).toBeFalsy()
  })

  it('getTotalFARWeight Should get the total weight of FAR messages', async () => {
    // Given there is two FAR messages but one is corrected (so not taken into account in the total)
    const farMessages = getFARMessages(dummyLogbookMessages)

    // When
    const weight = getTotalFARWeight(farMessages)

    // Then
    expect(weight).toEqual(2256)
  })

  it('getTotalDISWeight Should get the total weight of DIS messages', async () => {
    // Given there is no DIS message acknowledged
    const disMessages = getDISMessages(dummyLogbookMessages)

    // When
    const weight = getTotalDISWeight(disMessages)

    // Then
    expect(weight).toEqual(0)
  })

  it('getTotalDEPWeight Should get the total weight of DEP message', async () => {
    // Given
    const depMessage = getDEPMessage(dummyLogbookMessages)

    // When
    const weight = getTotalDEPWeight(depMessage!)

    // Then
    expect(weight).toEqual(579)
  })

  it('getTotalLANWeight Should get the total weight of LAN message', async () => {
    // Given
    const lanMessage = getLANMessage(dummyLogbookMessages)

    // When
    const weight = getTotalLANWeight(lanMessage!)

    // Then
    // A conversion factor of 1.2 is applied to the species "LANGOUSTE DU SUD" of 10kg
    expect(weight).toEqual(1918)
  })

  it('getTotalPNOWeight Should get the total weight of PNO message', async () => {
    // Given
    const pnoMessage = getPNOMessage(dummyLogbookMessages)

    // When
    const weight = getTotalPNOWeight(pnoMessage?.message)

    // Then
    expect(weight).toEqual(1675)
  })

  it('getTotalCPSDistinctSpecies Should get the total number of distinct CPS species', async () => {
    // When
    const total = getCPSDistinctSpecies([dummyCpsMessage])

    // Then
    expect(total).toEqual(2)
  })

  it('buildCatchArray Should get the an array of catches', async () => {
    // When
    const catches = buildCatchArray(dummyLanMessageWithLVRCPresentationSpecies.message.catchLanded)

    // Then
    expect(catches).toHaveLength(30)

    const ANFSpecy = catches.find(specyCatch => specyCatch.species === 'ANF')
    expect(ANFSpecy).toEqual({
      properties: [
        {
          conversionFactor: 1.22,
          economicZone: 'GBR',
          effortZone: 'A',
          faoZone: '27.6.a',
          packaging: 'BOX',
          presentation: 'GUT',
          preservationState: 'FRE',
          statisticalRectangle: '49E5',
          weight: 8385.87
        },
        {
          conversionFactor: 1.22,
          economicZone: 'IRL',
          effortZone: 'A',
          faoZone: '27.6.a',
          packaging: 'BOX',
          presentation: 'GUT',
          preservationState: 'FRE',
          statisticalRectangle: '41E0',
          weight: 2060.35
        },
        {
          conversionFactor: 0,
          economicZone: 'GBR',
          effortZone: 'A',
          faoZone: '27.6.a',
          packaging: 'BOX',
          presentation: 'LVR-C',
          preservationState: 'FRE',
          statisticalRectangle: '47E2',
          weight: 385.11
        },
        {
          conversionFactor: 0,
          economicZone: 'IRL',
          effortZone: 'A',
          faoZone: '27.6.a',
          packaging: 'BOX',
          presentation: 'LVR-C',
          preservationState: 'FRE',
          statisticalRectangle: '41E0',
          weight: 145.89
        }
      ],
      species: 'ANF',
      speciesName: 'Baudroies, etc. nca',
      weight: 10977.220000000001
    })
  })
})
