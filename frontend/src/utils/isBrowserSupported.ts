import { FrontendApiError } from '@libs/FrontendApiError'
import { browserName, browserVersion, engineName, engineVersion } from 'react-device-detect'

import { mainStore } from '../store'

type BrowserInfo = {
  browserName: string
  browserVersion: string
  engineName: string
  engineVersion: string
}

export function isBrowserSupported(): boolean {
  return isBrowserSupportedFor({ browserName, browserVersion, engineName, engineVersion }, userMessage =>
    FrontendApiError.handleIfAny({ userMessage }, mainStore.dispatch)
  )
}

export function isBrowserSupportedFor(browser: BrowserInfo, onUnknownBrowser: (message: string) => void): boolean {
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
      return isEngineSupported(browser, onUnknownBrowser)
  }
}

/**
 * Rebranded or packaged browsers (e.g. administration Firefox builds, LibreWolf, Vivaldi)
 * don't expose a known browser name, so we fall back on their rendering engine.
 */
function isEngineSupported(browser: BrowserInfo, onUnknownBrowser: (message: string) => void): boolean {
  const engineVersionAsNumber = parseInt(browser.engineVersion, 10)

  switch (browser.engineName) {
    case 'Gecko':
      return engineVersionAsNumber >= 62

    case 'Blink':
      return engineVersionAsNumber >= 69

    case 'WebKit':
      return true

    default:
      onUnknownBrowser(
        `Navigateur inconnu: "${browser.browserName} v${browser.browserVersion}" (${browser.engineName} v${browser.engineVersion})`
      )

      return false
  }
}
