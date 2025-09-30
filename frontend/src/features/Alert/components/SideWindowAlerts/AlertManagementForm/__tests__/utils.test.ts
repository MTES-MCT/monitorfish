import { AdministrativeAreaType, AdministrativeAreaTypeLabel } from '@features/Alert/constants'
import { expect } from '@jest/globals'

import { buildCountriesAsTreeOptions, mapZonesWithMetadata } from '../utils'

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

describe('buildCountriesAsTreeOptions', () => {
  it('Should return tree structure with EU and Non-EU countries', () => {
    // When
    const result = buildCountriesAsTreeOptions('fr')

    // Then
    expect(result).toHaveLength(2)
    expect(result[0]?.label).toBe('Navires UE')
    expect(result[0]?.value).toBe('eu')
    expect(result[1]?.label).toBe('Navires tiers')
    expect(result[1]?.value).toBe('non-eu')
    expect(result[0]?.children).toBeDefined()
    expect(result[1]?.children).toBeDefined()
  })

  it('Should classify countries correctly as EU and Non-EU', () => {
    // When
    const result = buildCountriesAsTreeOptions('fr')
    const euCountries = result[0]?.children ?? []
    const nonEuCountries = result[1]?.children ?? []

    // Then
    const franceInEU = euCountries.find(country => country.value === 'FRA')
    const germanyInEU = euCountries.find(country => country.value === 'DEU')
    const GBRInNonEU = nonEuCountries.find(country => country.value === 'GBR')

    expect(franceInEU).toBeDefined()
    expect(franceInEU?.label).toBe('France')
    expect(germanyInEU).toBeDefined()
    expect(germanyInEU?.label).toBe('Allemagne')
    expect(GBRInNonEU).toBeDefined()
    expect(GBRInNonEU?.label).toBe('Royaume-Uni')
  })

  it('Should sort countries alphabetically within each group', () => {
    // When
    const result = buildCountriesAsTreeOptions('fr')
    const euCountries = result[0]?.children ?? []
    const nonEuCountries = result[1]?.children ?? []

    // Then
    const euLabels = euCountries.map(country => country.label)
    const nonEuLabels = nonEuCountries.map(country => country.label)

    expect(euLabels).toEqual([...euLabels].sort())
    expect(nonEuLabels).toEqual([...nonEuLabels].sort())
  })

  it('Should have all countries with correct TreeOption structure', () => {
    // When
    const result = buildCountriesAsTreeOptions('fr')
    const allCountries = [...(result[0]?.children ?? []), ...(result[1]?.children ?? [])]

    // Then
    allCountries.forEach(country => {
      expect(country).toHaveProperty('label')
      expect(country).toHaveProperty('value')
      expect(typeof country.label).toBe('string')
      expect(typeof country.value).toBe('string')
      expect(country.value).toHaveLength(3) // ISO Alpha-3 codes are 3 characters
    })
  })
})
