import { expect } from '@jest/globals'

import { getOptionsFromStrings } from '../getOptionsFromStrings'

describe('utils/getOptionsFromStrings()', () => {
  it('should return the expected array of options', () => {
    const values = ['one', 'two']

    const result = getOptionsFromStrings(values)

    expect(result).toStrictEqual([
      {
        label: 'one',
        value: 'one'
      },
      {
        label: 'two',
        value: 'two'
      }
    ])
  })
})
