import { expect } from '@jest/globals'

import { cleanInputString } from '../cleanInputString'

describe('utils/cleanInputString()', () => {
  it('should return a trimmed and single-spaced string', () => {
    const text = ' à  l’ouest '

    const result = cleanInputString(text)

    expect(result).toStrictEqual('à l’ouest')
  })

  it('should return an empty string', () => {
    const text = ''

    const result = cleanInputString(text)

    expect(result).toStrictEqual('')
  })
})
