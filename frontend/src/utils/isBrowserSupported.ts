import { browserName, browserVersion } from 'react-device-detect'
import { toast } from 'react-toastify'

export function isBrowserSupported(): boolean {
  const browserVersionAsNumber = Number(browserVersion)

  switch (browserName) {
    case 'Internet Explorer':
      return false

    case 'Edge':
      return browserVersionAsNumber >= 79

    case 'Electron':
      return browserVersionAsNumber >= 19

    case 'Chrome':
      return browserVersionAsNumber >= 69

    case 'Firefox':
      return browserVersionAsNumber >= 62

    case 'Safari':
      return browserVersionAsNumber >= 12

    case 'Opera':
      return browserVersionAsNumber >= 56

    default:
      toast.error(`Navigateur inconnu: "${browserName} v${browserVersion}"`)

      return false
  }
}
