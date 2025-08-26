import { farMessagesWithCorrections } from '@features/Logbook/__tests__/__mocks__/logbookMessageWithCorrections'
import { Logbook } from '@features/Logbook/Logbook.types'
import { expect } from '@jest/globals'

import {
  buildCatchArray,
  getCPSNumberOfDistinctSpecies,
  getDEPMessage,
  getDISMessages,
  getFARMessages,
  getFARSpeciesInsightRecord,
  getLANMessage,
  getPNOMessage,
  getTotalDEPWeight,
  getTotalDISWeight,
  getTotalFARWeight,
  getTotalLANWeight,
  getTotalPNOWeight
} from '../utils'
import {
  correctedLANMessage,
  correctedPNOMessage,
  dummyCpsMessage,
  dummyLogbookMessages,
  dummyLanMessageWithLVRCPresentationSpecies
} from './__mocks__/logbookMessages'

describe('Logbook/utils.ts', () => {
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

  it('getTotalPNOWeight Should return 0 when logbookMessageValue is undefined', async () => {
    // When
    const weight = getTotalPNOWeight(undefined)

    // Then
    expect(weight).toEqual(0)
  })

  it('getTotalPNOWeight Should return 0 when catchOnboard is empty', async () => {
    // Given
    const pnoMessageValue = {
      catchOnboard: [],
      catchToLand: []
    }

    // When
    const weight = getTotalPNOWeight(pnoMessageValue as unknown as Logbook.PnoMessageValue)

    // Then
    expect(weight).toEqual(0)
  })

  it('getTotalPNOWeight Should exclude bluefin tuna extended species codes', async () => {
    // Given
    const pnoMessageValue = {
      catchOnboard: [
        {
          species: 'BON',
          weight: 100
        },
        {
          species: 'BF1', // Should be excluded
          weight: 50
        },
        {
          species: 'BF2', // Should be excluded
          weight: 75
        },
        {
          species: 'BF3', // Should be excluded
          weight: 25
        },
        {
          species: 'SOL',
          weight: 200
        }
      ],
      catchToLand: []
    }

    // When
    const weight = getTotalPNOWeight(pnoMessageValue as unknown as Logbook.PnoMessageValue)

    // Then
    // Should only include BON (100) + SOL (200) = 300, excluding BF1, BF2, BF3
    expect(weight).toEqual(300)
  })

  it('getTotalPNOWeight Should handle catches with undefined weight', async () => {
    // Given
    const pnoMessageValue = {
      catchOnboard: [
        {
          species: 'BON',
          weight: 100
        },
        {
          species: 'SOL',
          weight: undefined
        },
        {
          species: 'HKE',
          weight: 50
        }
      ],
      catchToLand: []
    }

    // When
    const weight = getTotalPNOWeight(pnoMessageValue as unknown as Logbook.PnoMessageValue)

    // Then
    // Should handle undefined weight as 0: BON (100) + SOL (0) + HKE (50) = 150
    expect(weight).toEqual(150)
  })

  it('getTotalCPSDistinctSpecies Should get the total number of distinct CPS species', async () => {
    // When
    const total = getCPSNumberOfDistinctSpecies([dummyCpsMessage])

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
      nbFish: 0,
      properties: [
        {
          conversionFactor: 1.22,
          economicZone: 'GBR',
          effortZone: 'A',
          faoZone: '27.6.a',
          nbFish: undefined,
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
          nbFish: undefined,
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
          nbFish: undefined,
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
          nbFish: undefined,
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

  it('buildCatchArray Should return empty array for empty input', async () => {
    // When
    const catches = buildCatchArray([])

    // Then
    expect(catches).toEqual([])
  })

  it('buildCatchArray Should aggregate catches of the same species', async () => {
    // Given
    const inputCatches: Logbook.Catch[] = [
      {
        conversionFactor: 1.1,
        economicZone: 'FRA',
        nbFish: 5,
        species: 'COD',
        speciesName: 'Atlantic Cod',
        weight: 100
      } as unknown as Logbook.Catch,
      {
        conversionFactor: 1.2,
        economicZone: 'GBR',
        nbFish: 10,
        species: 'COD',
        speciesName: 'Atlantic Cod',
        weight: 200
      } as unknown as Logbook.Catch,
      {
        nbFish: 8,
        species: 'HAD',
        speciesName: 'Haddock',
        weight: 150
      } as unknown as Logbook.Catch
    ]

    // When
    const catches = buildCatchArray(inputCatches)

    // Then
    expect(catches).toHaveLength(2)

    const codCatch = catches.find(c => c.species === 'COD')
    expect(codCatch?.weight).toEqual(300) // 100 + 200
    expect(codCatch?.nbFish).toEqual(15) // 5 + 10
    expect(codCatch?.properties).toHaveLength(2)

    const hadCatch = catches.find(c => c.species === 'HAD')
    expect(hadCatch?.weight).toEqual(150)
    expect(hadCatch?.nbFish).toEqual(8)
    expect(hadCatch?.properties).toHaveLength(1)
  })

  it('buildCatchArray Should sort catches by weight in descending order', async () => {
    // Given
    const inputCatches: Logbook.Catch[] = [
      {
        species: 'COD',
        weight: 100
      } as unknown as Logbook.Catch,
      {
        species: 'HAD',
        weight: 300
      } as unknown as Logbook.Catch,
      {
        species: 'SOL',
        weight: 200
      } as unknown as Logbook.Catch
    ]

    // When
    const catches = buildCatchArray(inputCatches)

    // Then
    expect(catches).toHaveLength(3)
    expect(catches[0]?.species).toEqual('HAD') // 300
    expect(catches[1]?.species).toEqual('SOL') // 200
    expect(catches[2]?.species).toEqual('COD') // 100
  })

  it('buildCatchArray Should handle undefined weight and nbFish', async () => {
    // Given
    const inputCatches: Logbook.Catch[] = [
      {
        nbFish: undefined,
        species: 'COD',
        weight: undefined
      } as unknown as Logbook.Catch,
      {
        nbFish: 5,
        species: 'HAD',
        weight: 100
      } as unknown as Logbook.Catch
    ]

    // When
    const catches = buildCatchArray(inputCatches)

    // Then
    expect(catches).toHaveLength(2)

    const codCatch = catches.find(c => c.species === 'COD')
    expect(codCatch?.weight).toEqual(0)
    expect(codCatch?.nbFish).toEqual(0)

    const hadCatch = catches.find(c => c.species === 'HAD')
    expect(hadCatch?.weight).toEqual(100)
    expect(hadCatch?.nbFish).toEqual(5)
  })

  it('buildCatchArray Should exclude BFT when extended tuna species are present', async () => {
    // Given
    const inputCatches: Logbook.Catch[] = [
      {
        species: 'BF1', // Extended tuna species
        speciesName: 'Bluefin Tuna Size 1',
        weight: 100
      } as unknown as Logbook.Catch,
      {
        species: 'BFT', // Regular bluefin tuna - should be excluded
        speciesName: 'Bluefin Tuna',
        weight: 200
      } as unknown as Logbook.Catch,
      {
        species: 'COD',
        speciesName: 'Atlantic Cod',
        weight: 150
      } as unknown as Logbook.Catch
    ]

    // When
    const catches = buildCatchArray(inputCatches)

    // Then
    expect(catches).toHaveLength(2) // BFT should be excluded
    expect(catches.find(c => c.species === 'BF1')).toBeDefined()
    expect(catches.find(c => c.species === 'COD')).toBeDefined()
    expect(catches.find(c => c.species === 'BFT')).toBeUndefined() // Should be excluded
  })

  it('buildCatchArray Should include BFT when no extended tuna species are present', async () => {
    // Given
    const inputCatches: Logbook.Catch[] = [
      {
        species: 'BFT',
        speciesName: 'Bluefin Tuna',
        weight: 200
      } as unknown as Logbook.Catch,
      {
        species: 'COD',
        speciesName: 'Atlantic Cod',
        weight: 150
      } as unknown as Logbook.Catch
    ]

    // When
    const catches = buildCatchArray(inputCatches)

    // Then
    expect(catches).toHaveLength(2)
    expect(catches.find(c => c.species === 'BFT')).toBeDefined() // Should be included
    expect(catches.find(c => c.species === 'COD')).toBeDefined()
  })

  it('getFARSpeciesInsightRecord Should compute insight of species', async () => {
    // Given
    const dummyTotalWeight = 6000000

    // When
    const catches = getFARSpeciesInsightRecord(farMessagesWithCorrections, dummyTotalWeight)
    expect(catches).toBeDefined()

    // Then
    expect(catches!.BET?.weight).toEqual(28000)
    expect(catches!.YFT?.weight).toEqual(174000)
    expect(catches!.SKJ?.weight).toEqual(98000)
  })
})
