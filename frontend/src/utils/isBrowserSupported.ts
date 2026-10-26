import { logSoftError } from '@utils/logSoftError'
import { browserName, browserVersion, engineName, engineVersion } from 'react-device-detect'

type BrowserInfo = {
  browserName: string
  browserVersion: string
  engineName: string
  engineVersion: string
}

export function isBrowserSupported(): boolean {
  const browser = { browserName, browserVersion, engineName, engineVersion }
  const isSupported = isBrowserSupportedFor(browser)
  if (!isSupported) {
    logSoftError({
      context: { ...browser, userAgent: window.navigator.userAgent },
      message: `Navigateur non supporté: "${browserName} v${browserVersion}" (${engineName} v${engineVersion})`
    })
  }

  return isSupported
}

export function isBrowserSupportedFor(browser: BrowserInfo): boolean {
  const browserVersionAsNumber = parseInt(browser.browserVersion, 10)

  switch (browser.browserName) {
    case 'Brave':
      return browserVersionAsNumber >= 112

    case 'Edge':
      return browserVersionAsNumber >= 79

    case 'Electron':
      return browserVersionAsNumber >= 19

    case 'Chrome':
      return browserVersionAsNumber >= 69

    case 'Firefox':
      return browserVersionAsNumber >= 62

    case 'Internet Explorer':
      return false

    case 'Opera':
      return browserVersionAsNumber >= 56

    case 'Safari':
      return browserVersionAsNumber >= 12

    default:
      return isEngineSupported(browser)
  }
}

/**
 * Rebranded or packaged browsers (e.g. administration Firefox builds, LibreWolf, Vivaldi)
 * don't expose a known browser name, so we fall back on their rendering engine.
 */
function isEngineSupported(browser: BrowserInfo): boolean {
  const engineVersionAsNumber = parseInt(browser.engineVersion, 10)

  switch (browser.engineName) {
    case 'Gecko':
      return engineVersionAsNumber >= 62

    case 'Blink':
      return engineVersionAsNumber >= 69

    case 'WebKit':
      return true

    default:
      return false
  }
}
