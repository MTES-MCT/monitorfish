import { expect } from '@jest/globals'

import { capitalizeFirstLetter } from '../capitalizeFirstLetter'

describe('utils/capitalizeFirstLetter()', () => {
  it('should return a first-letter-capitalized string', () => {
    const text = 'à l’ouest'

    const result = capitalizeFirstLetter(text)

    expect(result).toStrictEqual('À l’ouest')
  })

  it('should return an empty string', () => {
    const text = ''

    const result = capitalizeFirstLetter(text)

    expect(result).toStrictEqual('')
  })
})
