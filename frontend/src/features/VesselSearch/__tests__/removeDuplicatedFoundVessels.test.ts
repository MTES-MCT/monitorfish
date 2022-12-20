import { expect } from '@jest/globals'

import { removeDuplicatedFoundVessels } from '../utils'
import { anotherDummyVessels, dummyVessels } from './mocks'

describe('vessel_search/utils.removeDuplicatedFoundVessels()', () => {
  it('Should return vessels from API concatenated with vessels from Map When no vessels in common', () => {
    // Given
    const vesselsFromApi = dummyVessels
    const vesselsFromMap = anotherDummyVessels
    const expectedResult = vesselsFromApi.concat(vesselsFromMap).slice(0, 50)

    // When
    const result = removeDuplicatedFoundVessels(vesselsFromApi, vesselsFromMap)

    // Then
    expect(result).toHaveLength(50)
    expect(result).toEqual(expectedResult)
  })

  it('Should filter vessels from map When the cfr is found in the vessels from the API', () => {
    // Given
    const vesselsInCommon = dummyVessels
      .slice(0, 5)
      .map(vessel => ({ ...vessel, externalReferenceNumber: 'ANOTHER EXT. REF.' }))
    const vesselsFromMapWithFiveVesselsInCommon = anotherDummyVessels.concat(vesselsInCommon).slice(0, 50)

    // When
    const result = removeDuplicatedFoundVessels(dummyVessels, vesselsFromMapWithFiveVesselsInCommon)

    // Then
    expect(result).toHaveLength(dummyVessels.length + anotherDummyVessels.length - 10)
    expect(result).not.toContain(vesselsInCommon)
  })
})
