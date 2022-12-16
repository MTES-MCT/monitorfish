import { expect } from '@jest/globals'

import { getRegulatoryLawTypesFromZones } from '../index'
import { dummyLawTypesToTopics } from './mocks'

import type { RegulatoryZone } from '../../../types/regulation'

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
      }
    ]

    // When
    const structuredObject = getRegulatoryLawTypesFromZones(regulatoryZones as RegulatoryZone[])

    // Then
    expect(structuredObject).toEqual(dummyLawTypesToTopics)
  })
})
