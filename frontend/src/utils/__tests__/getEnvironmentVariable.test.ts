import { expect } from '@jest/globals'

import { getEnvironmentVariable } from '../getEnvironmentVariable'

// TODO Restore and complete this test (ESM issue).
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('api/utils.getEnvironmentVariable()', () => {
  afterEach(() => {
    // Clearing env variable after each test to ensure no side effects
    // delete import.meta.env.TEST_ENV_VARIABLE
  })

  it('should return `true` when environment variable is "true"', () => {
    // import.meta.env.TEST_ENV_VARIABLE = 'true'
    const result = getEnvironmentVariable('TEST_ENV_VARIABLE')
    expect(result).toBe(true)
  })

  it('should return `false` when environment variable is "false"', () => {
    // import.meta.env.TEST_ENV_VARIABLE = 'false'
    const result = getEnvironmentVariable('TEST_ENV_VARIABLE')
    expect(result).toBe(false)
  })

  it('should return the string value of the environment variable when it is neither "true" nor "false"', () => {
    // import.meta.env.TEST_ENV_VARIABLE = 'some-value'
    const result = getEnvironmentVariable('TEST_ENV_VARIABLE')
    expect(result).toBe('some-value')
  })

  it('should return `undefined` if the environment variable is not set', () => {
    const result = getEnvironmentVariable('TEST_ENV_VARIABLE')
    expect(result).toBeUndefined()
  })
})
