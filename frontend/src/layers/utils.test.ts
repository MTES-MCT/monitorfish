import { describe, expect, it } from '@jest/globals'

import { getHashDigitsFromRegulation } from './utils'

describe('utils', () => {
  it('getHashDigitsFromRegulation Should return undefined When the regulation is null', async () => {
    // Given
    const regulation = null

    // When
    expect(getHashDigitsFromRegulation(regulation)).toBeUndefined()
  })

  it('getHashDigitsFromRegulation Should return a constant number for a given regulatory zone', async () => {
    // Given
    const regulation = {
      topic: 'Ouest Cotentin Bivalves',
      zone: 'Zone ouest'
    }

    // Then
    expect(getHashDigitsFromRegulation(regulation)).toEqual(11)
    // Retry to ensure the returned digit is constant
    expect(getHashDigitsFromRegulation(regulation)).toEqual(11)
  })

  it('getHashDigitsFromRegulation Should return a constant number for another regulatory zone', async () => {
    // Given
    const regulation = {
      topic: 'Ouest Cotentin Bivalves',
      zone: 'Zone nord'
    }

    // When
    expect(getHashDigitsFromRegulation(regulation)).toEqual(9)
  })
})
