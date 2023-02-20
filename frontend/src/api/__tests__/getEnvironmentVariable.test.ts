import { expect } from '@jest/globals'

import { getEnvironmentVariable } from '../utils'

import type { Self } from '../../domain/types/env'

describe('api/utils.getEnvironmentVariable()', () => {
  it('Should get the environment variable in self', () => {
    // eslint-disable-next-line no-restricted-globals
    ;(self as Self).env = {}
    // eslint-disable-next-line no-restricted-globals
    ;(self as Self).env.TEST = 'FOUND'

    // When
    const result = getEnvironmentVariable('TEST')

    // Then
    expect(result).toEqual('FOUND')
  })
})
