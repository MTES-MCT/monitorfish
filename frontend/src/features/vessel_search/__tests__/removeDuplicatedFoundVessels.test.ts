import { expect } from '@jest/globals'

import { removeDuplicatedFoundVessels } from '../utils'
import { anotherDummyVessels, dummyVessels } from './mocks'

describe('vessel_search/utils.removeDuplicatedFoundVessels()', () => {
  it('Should return vessels from API concatenated with vessels from Map When no vessels in common', () => {
    // Given
    const vesselsFromApi = dummyVessels
    const vesselsFromMap = anotherDummyVessels
    const expectedResult = vesselsFromApi.concat(vesselsFromMap)

    // When
    const result = removeDuplicatedFoundVessels(vesselsFromApi, vesselsFromMap)

    // Then
    expect(result).toEqual(expectedResult)
  })

  it('Should filter vessels from map When the cfr is found in the vessels from the API', () => {
    // Given
    const vesselsInCommon = dummyVessels
      .slice(0, 5)
      .map(vessel => ({ ...vessel, externalReferenceNumber: 'ANOTHER EXT. REF.' }))
    const vesselsFromMapWithFiveVesselsInCommon = anotherDummyVessels.concat(vesselsInCommon)

    // When
    const result = removeDuplicatedFoundVessels(dummyVessels, vesselsFromMapWithFiveVesselsInCommon)

    // Then
    expect(result).toHaveLength(dummyVessels.length + anotherDummyVessels.length)
    expect(result).not.toContain(vesselsInCommon)
  })
})
