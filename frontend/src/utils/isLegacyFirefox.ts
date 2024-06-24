function getFirefoxVersion(): number | undefined {
  const matches = navigator.userAgent.match(/Firefox\/(\d+)/)
  if (!matches) {
    return undefined
  }

  const versionAsString = matches[1]
  if (!versionAsString) {
    return undefined
  }

  return Number(versionAsString)
}

/**
 * Tested via BrowserStack with Firefox versions 104 to 127 on Windows 10 & 11.
 * Current VM & Adeline version: Windows 10, Firefox 115.
 *
 * The side window seems to respect size constraints from version 126 onwards.
 */
export function isLegacyFirefox(): boolean {
  const firefoxVersion = getFirefoxVersion()

  return firefoxVersion !== undefined && firefoxVersion < 126
}
