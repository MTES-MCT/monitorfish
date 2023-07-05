import { expect } from '@jest/globals'

import { anotherDummyVessels, dummyVessels } from './mocks'
import { removeDuplicatedFoundVessels } from '../utils'

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

  it('Should filter vessels from map When the vessel id is found in the vessels from the API', () => {
    // Given
    const vesselsInCommon = dummyVessels.slice(0, 3).map(vessel => ({
      ...vessel,
      // random CFR
      externalReferenceNumber: 'ANOTHER EXT. REF.',
      internalReferenceNumber: (Math.random() + 1).toString(36)
    }))

    // When
    const result = removeDuplicatedFoundVessels(dummyVessels, vesselsInCommon)

    // Then, from the 3 vessels compared (vesselsInCommon)
    // - The two vessel with a `vesselId` a filtered
    // - There is one vessel added, as both `internalReferenceNumber` and `vesselId` could not be matched
    expect(result).toHaveLength(dummyVessels.length + 1)
    expect(result).not.toContain(vesselsInCommon)
  })
})
