import { expect } from '@jest/globals'

import { dummyLawTypesToTopics } from './mocks'
import { getRegulatoryLawTypesFromZones } from '../utils'

import type { RegulatoryZone } from '../types'

describe('regulation/index', () => {
  it('.getRegulatoryLawTypesFromZones() Should build the structured regulation object', () => {
    // Given
    const regulatoryZones = [
      {
        lawType: 'Reg. MEMN',
        topic: 'Ouest Cotentin Bivalves',
        zone: 'Praires Ouest cotentin'
      },
      {
        lawType: 'Reg. MEMN',
        topic: 'Ouest Cotentin Bivalves',
        zone: 'Praires Ouest cotentin Two'
      },
      {
        lawType: 'Reg. NAMO',
        topic: 'Armor CSJ Dragues',
        zone: 'Secteur 3'
      },
      {
        lawType: null,
        topic: 'Une thématique perdue',
        zone: 'Ne doit pas être affichée'
      }
    ]

    // When
    const structuredObject = getRegulatoryLawTypesFromZones(regulatoryZones as RegulatoryZone[])

    // Then
    expect(structuredObject).toEqual(dummyLawTypesToTopics)
  })
})
