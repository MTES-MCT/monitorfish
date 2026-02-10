import { AdministrativeAreaType, AdministrativeAreaTypeLabel, PendingAlertValueType } from '@features/Alert/constants'
import { expect } from '@jest/globals'

import { Criteria } from '../constants'
import {
  buildCountriesAsTreeOptions,
  convertRegulatoryAreasArrayToTreeOptions,
  convertRegulatoryLayerLawTypesToTreeOptions,
  convertTreeOptionsToRegulatoryAreasArray,
  hasCriterias,
  mapZonesWithMetadata
} from '../utils'

import type { AlertSpecification, RegulatoryAreaSpecification } from '@features/Alert/types'
import type { RegulatoryLawTypes } from '@features/Regulation/types'
import type { TreeBranchOption, TreeOption } from '@mtes-mct/monitor-ui'

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
    const franceInEU = euCountries.find(country => country.value === 'FR')
    const germanyInEU = euCountries.find(country => country.value === 'DE')
    const GBRInNonEU = nonEuCountries.find(country => country.value === 'GB')

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
      expect(country.value).toHaveLength(2) // ISO Alpha-2 codes are 2 characters
    })
  })
})

describe('convertRegulatoryAreasArrayToTreeOptions', () => {
  it('Should convert regulatory areas array to tree structure grouped by lawType and topic', () => {
    // Given
    const regulatoryAreas: RegulatoryAreaSpecification[] = [
      {
        lawType: 'Reg. (EU) 2019/1241',
        topic: 'Bar commun',
        zone: 'VIIIa'
      },
      {
        lawType: 'Reg. (EU) 2019/1241',
        topic: 'Bar commun',
        zone: 'VIIIb'
      },
      {
        lawType: 'Reg. (EU) 2019/1241',
        topic: 'Cabillaud',
        zone: 'VIId'
      },
      {
        lawType: 'Reg. (EU) 2023/194',
        topic: 'Sole',
        zone: 'VIIe'
      }
    ]

    // When
    const result = convertRegulatoryAreasArrayToTreeOptions(regulatoryAreas)

    // Then
    expect(result).toHaveLength(2)

    // Check first lawType group
    expect(result?.[0]?.label).toBe('Reg. (EU) 2019/1241')
    expect(result?.[0]?.value).toBe('Reg. (EU) 2019/1241')
    expect(result?.[0]?.children).toHaveLength(2)

    // Check topic groups within first lawType
    const firstLawTypeChildren = result?.[0]?.children
    const barCommunTopic = firstLawTypeChildren?.find(topic => topic.label === 'Bar commun')
    expect(barCommunTopic?.value).toBe('Bar commun')
    expect(barCommunTopic?.children).toHaveLength(2)
    expect(barCommunTopic?.children?.[0]).toEqual({ label: 'VIIIa', value: 'VIIIa' })
    expect(barCommunTopic?.children?.[1]).toEqual({ label: 'VIIIb', value: 'VIIIb' })

    const cabillaudTopic = firstLawTypeChildren?.find(topic => topic.label === 'Cabillaud')
    expect(cabillaudTopic?.value).toBe('Cabillaud')
    expect(cabillaudTopic?.children).toHaveLength(1)
    expect(cabillaudTopic?.children?.[0]).toEqual({ label: 'VIId', value: 'VIId' })

    // Check second lawType group
    expect(result?.[1]?.label).toBe('Reg. (EU) 2023/194')
    expect(result?.[1]?.value).toBe('Reg. (EU) 2023/194')
    expect(result?.[1]?.children).toHaveLength(1)

    const soleTopic = result?.[1]?.children?.[0]
    expect(soleTopic?.label).toBe('Sole')
    expect(soleTopic?.value).toBe('Sole')
    expect(soleTopic?.children).toHaveLength(1)
    expect(soleTopic?.children?.[0]).toEqual({ label: 'VIIe', value: 'VIIe' })
  })

  it('Should return undefined when regulatory areas is undefined', () => {
    // When
    const result = convertRegulatoryAreasArrayToTreeOptions(undefined)

    // Then
    expect(result).toBeUndefined()
  })
})

describe('convertTreeOptionsToRegulatoryAreasArray', () => {
  it('Should convert tree structure to flat regulatory areas array', () => {
    // Given
    const treeOptions: TreeOption[] = [
      {
        children: [
          {
            children: [
              { label: 'VIIIa', value: 'VIIIa' },
              { label: 'VIIIb', value: 'VIIIb' }
            ],
            label: 'Bar commun',
            value: 'Bar commun'
          },
          {
            children: [{ label: 'VIId', value: 'VIId' }],
            label: 'Cabillaud',
            value: 'Cabillaud'
          }
        ],
        label: 'Reg. (EU) 2019/1241',
        value: 'Reg. (EU) 2019/1241'
      } as TreeBranchOption,
      {
        children: [
          {
            children: [{ label: 'VIIe', value: 'VIIe' }],
            label: 'Sole',
            value: 'Sole'
          }
        ],
        label: 'Reg. (EU) 2023/194',
        value: 'Reg. (EU) 2023/194'
      } as TreeBranchOption
    ]

    // When
    const result = convertTreeOptionsToRegulatoryAreasArray(treeOptions)

    // Then
    expect(result).toHaveLength(4)
    expect(result).toEqual([
      {
        lawType: 'Reg. (EU) 2019/1241',
        topic: 'Bar commun',
        zone: 'VIIIa'
      },
      {
        lawType: 'Reg. (EU) 2019/1241',
        topic: 'Bar commun',
        zone: 'VIIIb'
      },
      {
        lawType: 'Reg. (EU) 2019/1241',
        topic: 'Cabillaud',
        zone: 'VIId'
      },
      {
        lawType: 'Reg. (EU) 2023/194',
        topic: 'Sole',
        zone: 'VIIe'
      }
    ])
  })
})

describe('convertRegulatoryLayerLawTypesToTreeOptions', () => {
  it('Should convert regulatory layer law types to tree options structure', () => {
    // Given
    const regulatoryLayerLawTypes: RegulatoryLawTypes = {
      'Reg. (EU) 2019/1241': {
        'Bar commun': [
          {
            lawType: 'Reg. (EU) 2019/1241',
            topic: 'Bar commun',
            zone: 'VIIIa'
          } as any,
          {
            lawType: 'Reg. (EU) 2019/1241',
            topic: 'Bar commun',
            zone: 'VIIIb'
          } as any
        ],
        Cabillaud: [
          {
            lawType: 'Reg. (EU) 2019/1241',
            topic: 'Cabillaud',
            zone: 'VIId'
          } as any
        ]
      },
      'Reg. (EU) 2023/194': {
        Sole: [
          {
            lawType: 'Reg. (EU) 2023/194',
            topic: 'Sole',
            zone: 'VIIe'
          } as any
        ]
      }
    }

    // When
    const result = convertRegulatoryLayerLawTypesToTreeOptions(regulatoryLayerLawTypes)

    // Then
    expect(result).toHaveLength(2)

    // Check first lawType
    expect(result[0]?.label).toBe('Reg. (EU) 2019/1241')
    expect(result[0]?.value).toBe('Reg. (EU) 2019/1241')
    expect(result[0]?.children).toHaveLength(2)

    // Check topics within first lawType
    const firstLawTypeChildren = result[0]?.children
    const barCommunTopic = firstLawTypeChildren?.find(topic => topic.label === 'Bar commun')
    expect(barCommunTopic?.value).toBe('Bar commun')
    expect(barCommunTopic?.children).toHaveLength(2)
    expect(barCommunTopic?.children?.[0]).toEqual({ label: 'VIIIa', value: 'VIIIa' })
    expect(barCommunTopic?.children?.[1]).toEqual({ label: 'VIIIb', value: 'VIIIb' })

    const cabillaudTopic = firstLawTypeChildren?.find(topic => topic.label === 'Cabillaud')
    expect(cabillaudTopic?.value).toBe('Cabillaud')
    expect(cabillaudTopic?.children).toHaveLength(1)
    expect(cabillaudTopic?.children?.[0]).toEqual({ label: 'VIId', value: 'VIId' })

    // Check second lawType
    expect(result[1]?.label).toBe('Reg. (EU) 2023/194')
    expect(result[1]?.value).toBe('Reg. (EU) 2023/194')
    expect(result[1]?.children).toHaveLength(1)

    const soleTopic = result[1]?.children?.[0]
    expect(soleTopic?.label).toBe('Sole')
    expect(soleTopic?.value).toBe('Sole')
    expect(soleTopic?.children).toHaveLength(1)
    expect(soleTopic?.children?.[0]).toEqual({ label: 'VIIe', value: 'VIIe' })
  })

  it('Should return empty array when regulatory layer law types is undefined', () => {
    // When
    const result = convertRegulatoryLayerLawTypesToTreeOptions(undefined)

    // Then
    expect(result).toEqual([])
  })
})

describe('hasCriterias', () => {
  it('Should return the correct criteria flags based on values and selected criterias', () => {
    // Given
    const emptyValues: AlertSpecification = {
      administrativeAreas: [],
      createdAtUtc: '',
      createdBy: '',
      description: '',
      districtCodes: [],
      errorReason: undefined,
      flagStatesIso2: [],
      gears: [],
      hasAutomaticArchiving: false,
      id: undefined,
      isActivated: false,
      isInError: false,
      isUserDefined: false,
      minDepth: undefined,
      name: '',

      natinf: 0,
      onlyFishingPositions: false,
      producerOrganizations: [],
      regulatoryAreas: [],
      repeatEachYear: false,
      species: [],
      speciesCatchAreas: [],
      threat: '',
      threatCharacterization: '',
      threatHierarchy: undefined,
      trackAnalysisDepth: 0,
      type: PendingAlertValueType.MISSING_DEP_ALERT,
      vesselIds: [],
      vessels: []
    }

    // When no values and no selected criterias
    const resultEmpty = hasCriterias(emptyValues)

    // Then
    expect(resultEmpty.hasNoCriteria).toBe(true)
    expect(resultEmpty.hasZoneCriteria).toBe(false)
    expect(resultEmpty.hasNationalityCriteria).toBe(false)
    expect(resultEmpty.hasVesselCriteria).toBe(false)
    expect(resultEmpty.hasGearOnBoardCriteria).toBe(false)
    expect(resultEmpty.hasSpeciesOnBoardCriteria).toBe(false)
    expect(resultEmpty.hasProducerOrganizationCriteria).toBe(false)
    expect(resultEmpty.hasDistrictCriteria).toBe(false)

    // When values have data
    const valuesWithData: AlertSpecification = {
      ...emptyValues,
      flagStatesIso2: ['FR'],
      gears: [
        {
          gear: '',
          maxMesh: undefined,
          minMesh: undefined
        }
      ],
      vesselIds: [1]
    }
    const resultWithData = hasCriterias(valuesWithData)

    // Then
    expect(resultWithData.hasNoCriteria).toBe(false)
    expect(resultWithData.hasNationalityCriteria).toBe(true)
    expect(resultWithData.hasVesselCriteria).toBe(true)
    expect(resultWithData.hasGearOnBoardCriteria).toBe(true)
    expect(resultWithData.hasZoneCriteria).toBe(false)

    // When selected criterias are provided (even with empty values)
    const resultWithSelectedCriterias = hasCriterias(emptyValues, [Criteria.ZONE, Criteria.SPECIES_ON_BOARD])

    // Then
    expect(resultWithSelectedCriterias.hasNoCriteria).toBe(false)
    expect(resultWithSelectedCriterias.hasZoneCriteria).toBe(true)
    expect(resultWithSelectedCriterias.hasSpeciesOnBoardCriteria).toBe(true)
    expect(resultWithSelectedCriterias.hasNationalityCriteria).toBe(false)
  })
})
