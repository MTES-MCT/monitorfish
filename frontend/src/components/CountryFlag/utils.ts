import countries from 'i18n-iso-countries'

export function getAlpha2CodeFromAlpha2or3Code(countryCode: string | undefined): string | undefined {
  if (!countryCode) {
    return undefined
  }

  if (countryCode === 'UNDEFINED') {
    return undefined
  }

  try {
    return (countryCode.length === 3 ? countries.alpha3ToAlpha2(countryCode) : countryCode).toLowerCase()
  } catch (err) {
    return undefined
  }
}
