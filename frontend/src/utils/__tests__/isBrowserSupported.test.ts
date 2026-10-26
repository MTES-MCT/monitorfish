import { describe, expect, it } from '@jest/globals'
import { getSelectorsByUserAgent } from 'react-device-detect'

import { isBrowserSupportedFor } from '../isBrowserSupported'

function isUserAgentSupported(userAgent: string, onUnknownBrowser = jest.fn()) {
  return isBrowserSupportedFor(getSelectorsByUserAgent(userAgent), onUnknownBrowser)
}

describe('utils/isBrowserSupportedFor()', () => {
  it('should support a recent Firefox', () => {
    const result = isUserAgentSupported(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0'
    )

    expect(result).toBe(true)
  })

  it('should not support an old Firefox', () => {
    const result = isUserAgentSupported(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:50.0) Gecko/20100101 Firefox/50.0'
    )

    expect(result).toBe(false)
  })

  it('should support a rebranded Firefox build from its Gecko engine version', () => {
    const onUnknownBrowser = jest.fn()

    const result = isUserAgentSupported(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 MinistereFox/153.5.1',
      onUnknownBrowser
    )

    expect(result).toBe(true)
    expect(onUnknownBrowser).not.toHaveBeenCalled()
  })

  it('should support a Firefox fork from its Gecko engine version', () => {
    const result = isUserAgentSupported(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0 LibreWolf/153.0'
    )

    expect(result).toBe(true)
  })

  it('should not support an old Firefox fork', () => {
    const result = isUserAgentSupported(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:50.0) Gecko/20100101 Firefox/50.0 Waterfox/50'
    )

    expect(result).toBe(false)
  })

  it('should support a Chromium fork from its Blink engine version', () => {
    const result = isUserAgentSupported(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Vivaldi/7.0'
    )

    expect(result).toBe(true)
  })

  it('should report and not support an unknown browser engine', () => {
    const onUnknownBrowser = jest.fn()

    const result = isBrowserSupportedFor(
      { browserName: 'Foo', browserVersion: '1', engineName: 'Bar', engineVersion: '1' },
      onUnknownBrowser
    )

    expect(result).toBe(false)
    expect(onUnknownBrowser).toHaveBeenCalledWith('Navigateur inconnu: "Foo v1" (Bar v1)')
  })
})
