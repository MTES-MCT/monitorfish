import { AdministrativeAreaType, AdministrativeAreaTypeLabel } from '@features/Alert/constants'
import { expect } from '@jest/globals'

import { mapZonesWithMetadata } from '../utils'

import type { TreeOption } from '@mtes-mct/monitor-ui'

describe('mapZonesWithMetadata', () => {
  it('Should return empty array when zoneGroups is undefined or has no valid zones', () => {
    // When
    const resultUndefined = mapZonesWithMetadata(undefined)
    const resultEmpty = mapZonesWithMetadata([])
    const resultNoChildren = mapZonesWithMetadata([
      {
        label: AdministrativeAreaTypeLabel.EEZ_AREA
      }
    ] as TreeOption[])

    // Then
    expect(resultUndefined).toEqual([])
    expect(resultEmpty).toEqual([])
    expect(resultNoChildren).toEqual([])
  })

  it('Should map zones with correct metadata for EEZ and FAO areas', () => {
    // Given
    const zoneGroups: TreeOption[] = [
      {
        children: [
          { label: 'France', value: 'france-id' },
          { label: 'Spain', value: 'spain-id' }
        ],
        label: AdministrativeAreaTypeLabel.EEZ_AREA
      },
      {
        children: [
          { label: '27.1.0', value: 'fao-27-1-0' },
          { label: '27.4.c', value: 'fao-27-4-c' }
        ],
        label: AdministrativeAreaTypeLabel.FAO_AREA
      }
    ]

    // When
    const result = mapZonesWithMetadata(zoneGroups)

    // Then
    expect(result).toEqual([
      {
        areaType: AdministrativeAreaType.EEZ_AREA,
        code: 'FRA',
        id: 'france-id'
      },
      {
        areaType: AdministrativeAreaType.EEZ_AREA,
        code: 'ESP',
        id: 'spain-id'
      },
      {
        areaType: AdministrativeAreaType.FAO_AREA,
        code: '27.1.0',
        id: 'fao-27-1-0'
      },
      {
        areaType: AdministrativeAreaType.FAO_AREA,
        code: '27.4.c',
        id: 'fao-27-4-c'
      }
    ])
  })
})
