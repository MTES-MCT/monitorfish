import { expect } from '@jest/globals'

import { getListOfPath, getMaxXYRange } from '../utils'

describe('workers/utils.ts', () => {
  it('getNumberOfTiles should return the max XY of tiles for a range of zoom', () => {
    const result = getMaxXYRange(10)

    expect(result).toStrictEqual([2, 4, 8, 16, 32, 64, 128, 256, 512, 1024])
  })

  it('getListOfPath should return the max XY of tiles for a range of zoom', () => {
    const result = getListOfPath()

    // There is 11 zoom levels: from 0 to 10
    expect(result).toHaveLength(11)

    // Zoom 0
    expect(result[0]).toHaveLength(1)
    expect(result[0]).toStrictEqual(['0/0/0'])

    // Zoom 1
    expect(result[1]).toHaveLength(2)
    expect(result[1]).toStrictEqual(['1/0/0', '1/1/0'])

    // Zoom 2
    expect(result[2]).toHaveLength(2)
    expect(result[2]).toStrictEqual(['2/1/1', '2/2/1'])

    expect(result[3]).toHaveLength(4)
    expect(result[4]).toHaveLength(6)
    expect(result[5]).toHaveLength(16)
    expect(result[6]).toHaveLength(56)
    expect(result[7]).toHaveLength(196)
    expect(result[8]).toHaveLength(728)
    expect(result[9]).toHaveLength(2805)
    expect(result[10]).toHaveLength(10908)
  })
})
