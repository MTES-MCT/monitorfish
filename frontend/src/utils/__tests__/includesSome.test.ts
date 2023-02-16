import { expect } from '@jest/globals'

import { includesSome } from '../includesSome'

describe('utils/includesSome()', () => {
  const ofList = [1, 2]
  it('should return TRUE', () => {
    expect(includesSome(ofList, [1])).toBe(true)
    expect(includesSome(ofList, [2])).toBe(true)
    expect(includesSome(ofList, [0, 1])).toBe(true)
    expect(includesSome(ofList, [1, 2])).toBe(true)
    expect(includesSome(ofList, [2, 3])).toBe(true)
  })

  it('should return FALSE', () => {
    expect(includesSome(ofList, [])).toBe(false)
    expect(includesSome(ofList, [3])).toBe(false)
    expect(includesSome(ofList, [3, 4])).toBe(false)
  })

  it('should be curried', () => {
    expect(includesSome(ofList)([1])).toBe(true)
  })
})
