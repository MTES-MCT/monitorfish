import { describe, expect, it } from '@jest/globals'

import { JDP, JDP_CSV_MAP_BASE } from '../constants'
import { formatDMDCoordinateForActivityReport, getJDPCsvMap } from '../utils'

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

  it('getJDPCsvMap Should be dynamically generated with species, infractions and control comment', async () => {
    // When
    const csvMap = getJDPCsvMap(JDP_CSV_MAP_BASE, JDP.WESTERN_WATERS)

    // Then
    expect(Object.keys(csvMap)).toHaveLength(171)

    expect(csvMap.species1?.label).toEqual('SPECIES1')
    expect(csvMap.weight1?.label).toEqual('WEIGHT1')
    expect(csvMap.nbFish1?.label).toEqual('NB_IND1')

    expect(csvMap.species35?.label).toEqual('SPECIES35')
    expect(csvMap.weight35?.label).toEqual('WEIGHT35')
    expect(csvMap.nbFish35?.label).toEqual('NB_IND35')

    expect(csvMap.infractionClass1).toEqual('INFR1_CLASS')
    expect(csvMap.infractionCode1?.label).toEqual('INFR1_CODE')
    expect(csvMap.infractionDescription1?.label).toEqual('INFR1_DESCRIPTION')

    expect(csvMap.infractionClass12).toEqual('INFR12_CLASS')
    expect(csvMap.infractionCode12?.label).toEqual('INFR12_CODE')
    expect(csvMap.infractionDescription12?.label).toEqual('INFR12_DESCRIPTION')

    expect(csvMap['action.otherComments']).toEqual('COMMENT')
  })
})
