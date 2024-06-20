import countries from 'i18n-iso-countries'

export function getAlpha2CodeFromAlpha2or3Code(countryCode: string | undefined): string | undefined {
  if (!countryCode) {
    return undefined
  }

  if (countryCode === 'UNDEFINED') {
    return undefined
  }

  try {
    if (countryCode.length === 3) {
      return countries.alpha3ToAlpha2(countryCode)?.toLowerCase()
    }

    if (countryCode.length === 2) {
      return countryCode.toLowerCase()
    }

    return undefined
  } catch (err) {
    return undefined
  }
}
