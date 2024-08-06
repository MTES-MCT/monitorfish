import { describe, expect, it } from '@jest/globals'

import { JDP_CSV_MAP_BASE } from '../components/ExportActivityReportsDialog/csvMap'
import { JDP } from '../constants'
import {
  formatDMDCoordinateForActivityReport,
  getJDPCsvMap,
  getSpeciesOnboardWithUntargetedSpeciesGrouped
} from '../utils'

describe('utils', () => {
  it('formatCoordinateForActivityReport Should format a latitude', async () => {
    // When
    const latitude = formatDMDCoordinateForActivityReport('47° 27.948′ N')

    // Then
    expect(latitude).toEqual('N47 27.948')
  })

  it('formatCoordinateForActivityReport Should format a longitude', async () => {
    // When
    const latitude = formatDMDCoordinateForActivityReport('005° 10.536′ W')

    // Then
    expect(latitude).toEqual('W005 10.536')
  })

  it('formatCoordinateForActivityReport Should return an empty string When the coordinate parameter is undefined', async () => {
    // When
    const latitude = formatDMDCoordinateForActivityReport(undefined)

    // Then
    expect(latitude).toEqual('')
  })

  it('getSpeciesOnboardWithUntargetedSpeciesGrouped Should return untargeted species grouped as OTH', async () => {
    // Given
    const speciesOnboard = [
      { controlledWeight: 500, declaredWeight: 471.2, nbFish: undefined, speciesCode: 'HKE', underSized: true },
      { controlledWeight: undefined, declaredWeight: 13.46, nbFish: undefined, speciesCode: 'BLI', underSized: false },
      { controlledWeight: 123.6, declaredWeight: undefined, nbFish: undefined, speciesCode: 'COD', underSized: false },
      { controlledWeight: undefined, declaredWeight: 12.6, nbFish: undefined, speciesCode: 'ANZ', underSized: false },
      { controlledWeight: undefined, declaredWeight: 45.5, nbFish: undefined, speciesCode: 'FMI', underSized: false }
    ]

    // When
    const groupedSpeciesOnboard = getSpeciesOnboardWithUntargetedSpeciesGrouped(speciesOnboard, ['ANZ', 'HKE', 'ATJ'])

    // Then
    expect(groupedSpeciesOnboard).toHaveLength(3)
    expect(groupedSpeciesOnboard[0]?.speciesCode).toEqual('HKE')
    expect(groupedSpeciesOnboard[0]?.controlledWeight).toEqual(500)
    expect(groupedSpeciesOnboard[1]?.speciesCode).toEqual('OTH')
    expect(groupedSpeciesOnboard[1]?.declaredWeight).toEqual(182.56)
    expect(groupedSpeciesOnboard[2]?.speciesCode).toEqual('ANZ')
    expect(groupedSpeciesOnboard[2]?.declaredWeight).toEqual(12.6)
  })

  it('getSpeciesOnboardWithUntargetedSpeciesGrouped Should not return untargeted species grouped as OTH When the weight is 0', async () => {
    // Given
    const speciesOnboard = [
      { controlledWeight: 500, declaredWeight: 471.2, nbFish: undefined, speciesCode: 'HKE', underSized: true },
      { controlledWeight: undefined, declaredWeight: 0, nbFish: undefined, speciesCode: 'BLI', underSized: false },
      { controlledWeight: undefined, declaredWeight: 12.6, nbFish: undefined, speciesCode: 'ANZ', underSized: false }
    ]

    // When
    const groupedSpeciesOnboard = getSpeciesOnboardWithUntargetedSpeciesGrouped(speciesOnboard, ['ANZ', 'HKE', 'ATJ'])

    // Then
    expect(groupedSpeciesOnboard).toHaveLength(2)
    expect(groupedSpeciesOnboard[0]?.speciesCode).toEqual('HKE')
    expect(groupedSpeciesOnboard[0]?.controlledWeight).toEqual(500)
    expect(groupedSpeciesOnboard[1]?.speciesCode).toEqual('ANZ')
    expect(groupedSpeciesOnboard[1]?.declaredWeight).toEqual(12.6)
  })

  it('getJDPCsvMap Should be dynamically generated with species, infractions and control comment for WESTERN_WATERS', async () => {
    // When
    const csvMap = getJDPCsvMap(JDP_CSV_MAP_BASE, JDP.WESTERN_WATERS)

    // Then
    expect(Object.keys(csvMap)).toHaveLength(91)

    // @ts-ignore
    expect(csvMap.species1?.label).toEqual('SPECIES1')
    // @ts-ignore
    expect(csvMap.weight1?.label).toEqual('WEIGHT1')
    // @ts-ignore
    expect(csvMap.nbFish1?.label).toEqual('NB_IND1')

    // @ts-ignore
    expect(csvMap.species10?.label).toEqual('SPECIES10')
    // @ts-ignore
    expect(csvMap.weight10?.label).toEqual('WEIGHT10')
    // @ts-ignore
    expect(csvMap.nbFish10?.label).toEqual('NB_IND10')

    expect(csvMap.infractionClass1).toEqual('INFR1_CLASS')
    // @ts-ignore
    expect(csvMap.infractionCode1?.label).toEqual('INFR1_CODE')
    // @ts-ignore
    expect(csvMap.infractionDescription1?.label).toEqual('INFR1_DESCRIPTION')

    expect(csvMap.infractionClass6).toEqual('INFR6_CLASS')
    // @ts-ignore
    expect(csvMap.infractionCode6?.label).toEqual('INFR6_CODE')
    // @ts-ignore
    expect(csvMap.infractionDescription6?.label).toEqual('INFR6_DESCRIPTION')

    expect(csvMap['action.otherComments']).toEqual('COMMENT')
  })

  it('getJDPCsvMap Should be dynamically generated with species, infractions and control comment for MEDITERRANEAN_AND_EASTERN_ATLANTIC', async () => {
    // When
    const csvMap = getJDPCsvMap(JDP_CSV_MAP_BASE, JDP.MEDITERRANEAN_AND_EASTERN_ATLANTIC)

    // Then
    expect(Object.keys(csvMap)).toHaveLength(91)

    // @ts-ignore
    expect(csvMap.eventHour?.label).toEqual('EVENT_HOUR')

    // @ts-ignore
    expect(csvMap.species1?.label).toEqual('SPECIES1')
    // @ts-ignore
    expect(csvMap.weight1?.label).toEqual('WEIGHT1')
    // @ts-ignore
    expect(csvMap.nbFish1?.label).toEqual('NB_IND1')

    // @ts-ignore
    expect(csvMap.species10?.label).toEqual('SPECIES10')
    // @ts-ignore
    expect(csvMap.weight10?.label).toEqual('WEIGHT10')
    // @ts-ignore
    expect(csvMap.nbFish10?.label).toEqual('NB_IND10')

    expect(csvMap.infractionClass1).toEqual('INFR_CLASS1')
    // @ts-ignore
    expect(csvMap.infractionCode1?.label).toEqual('INFR_CODE1')
    // @ts-ignore
    expect(csvMap.infractionDescription1?.label).toEqual('INFR_REMARK1')

    expect(csvMap.infractionClass6).toEqual('INFR_CLASS6')
    // @ts-ignore
    expect(csvMap.infractionCode6?.label).toEqual('INFR_CODE6')
    // @ts-ignore
    expect(csvMap.infractionDescription6?.label).toEqual('INFR_REMARK6')

    expect(csvMap['action.otherComments']).toEqual('COMMENT')
  })
})
