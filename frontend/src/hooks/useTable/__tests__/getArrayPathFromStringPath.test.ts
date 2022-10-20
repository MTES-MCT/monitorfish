import { expect } from '@jest/globals'

import { getArrayPathFromStringPath } from '../utils'

describe('hooks/useTable/utils.getArrayPathFromStringPath()', () => {
  it('should return the expected array path from a root string path', () => {
    const stringPath = 'aProp'

    const result = getArrayPathFromStringPath(stringPath)

    expect(result).toMatchObject(['aProp'] as any)
  })

  it('should return the expected array path from a 2 levels deep string path', () => {
    const stringPath = 'aProp.sSubProp.aSubSubProp'

    const result = getArrayPathFromStringPath(stringPath)

    expect(result).toMatchObject(['aProp', 'sSubProp', 'aSubSubProp'] as any)
  })

  it('should throw an error from an empty-ish string path', () => {
    const stringPath = ' '

    const call = () => getArrayPathFromStringPath(stringPath)

    expect(call).toThrow()
  })
})
