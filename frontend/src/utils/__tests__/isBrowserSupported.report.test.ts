import { describe, expect, it } from '@jest/globals'
import { logSoftError } from '@utils/logSoftError'

import { isBrowserSupported } from '../isBrowserSupported'

jest.mock('@utils/logSoftError', () => ({ logSoftError: jest.fn() }))
jest.mock('react-device-detect', () => ({
  browserName: 'Firefox',
  browserVersion: '50',
  engineName: 'Gecko',
  engineVersion: '50.0'
}))

describe('utils/isBrowserSupported()', () => {
  it('should report an unsupported browser with its user agent', () => {
    const result = isBrowserSupported()

    expect(result).toBe(false)
    expect(logSoftError).toHaveBeenCalledWith({
      context: {
        browserName: 'Firefox',
        browserVersion: '50',
        engineName: 'Gecko',
        engineVersion: '50.0',
        userAgent: window.navigator.userAgent
      },
      message: 'Navigateur non supporté: "Firefox v50" (Gecko v50.0)'
    })
  })
})
