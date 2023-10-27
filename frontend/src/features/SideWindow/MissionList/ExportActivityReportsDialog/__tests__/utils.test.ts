import { describe, expect, it } from '@jest/globals'

import { JDP } from '../constants'
import { JDP_CSV_MAP_BASE } from '../csvMap'
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

    // @ts-ignore
    expect(csvMap.species1?.label).toEqual('SPECIES1')
    // @ts-ignore
    expect(csvMap.weight1?.label).toEqual('WEIGHT1')
    // @ts-ignore
    expect(csvMap.nbFish1?.label).toEqual('NB_IND1')

    // @ts-ignore
    expect(csvMap.species35?.label).toEqual('SPECIES35')
    // @ts-ignore
    expect(csvMap.weight35?.label).toEqual('WEIGHT35')
    // @ts-ignore
    expect(csvMap.nbFish35?.label).toEqual('NB_IND35')

    expect(csvMap.infractionClass1).toEqual('INFR1_CLASS')
    // @ts-ignore
    expect(csvMap.infractionCode1?.label).toEqual('INFR1_CODE')
    // @ts-ignore
    expect(csvMap.infractionDescription1?.label).toEqual('INFR1_DESCRIPTION')

    expect(csvMap.infractionClass12).toEqual('INFR12_CLASS')
    // @ts-ignore
    expect(csvMap.infractionCode12?.label).toEqual('INFR12_CODE')
    // @ts-ignore
    expect(csvMap.infractionDescription12?.label).toEqual('INFR12_DESCRIPTION')

    expect(csvMap['action.otherComments']).toEqual('COMMENT')
  })
})
