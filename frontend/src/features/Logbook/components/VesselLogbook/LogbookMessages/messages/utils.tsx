import countries from 'i18n-iso-countries'

import { getCoordinates } from '../../../../../../coordinates'
import { getDateTime } from '../../../../../../utils'
import { WSG84_PROJECTION } from '../../../../../MainMap/constants'
import { Gray, NoValue } from '../styles'

import type { CoordinatesFormat } from '@mtes-mct/monitor-ui'

export function getValueOrDash(value?: string | number) {
  if (!value) {
    return <NoValue>-</NoValue>
  }

  return value
}

export function getDatetimeOrDash(dateTimeUtc: string | undefined) {
  if (!dateTimeUtc) {
    return <NoValue>-</NoValue>
  }

  return (
    <>
      {getDateTime(dateTimeUtc, true)} <Gray>(UTC)</Gray>
    </>
  )
}

export function getCodeWithNameOrDash(code: string | null | undefined, codeName: string | null | undefined) {
  if (!code && !codeName) {
    return <NoValue>-</NoValue>
  }

  if (!codeName) {
    return code
  }

  return (
    <>
      {codeName} ({code})
    </>
  )
}

export function getLatitudeOrDash(coordinatesFormat: CoordinatesFormat, latitude?: number, longitude?: number) {
  if (!latitude || !longitude) {
    return <NoValue>-</NoValue>
  }

  return getCoordinates([longitude, latitude], WSG84_PROJECTION, coordinatesFormat)[0]
}

export function getLongitudeOrDash(coordinatesFormat: CoordinatesFormat, latitude?: number, longitude?: number) {
  if (!latitude || !longitude) {
    return <NoValue>-</NoValue>
  }

  return getCoordinates([longitude, latitude], WSG84_PROJECTION, coordinatesFormat)[1]
}

export function getCountryNameOrDash(country?: string) {
  const countryName = getCountryName(country)

  return getValueOrDash(countryName)
}

export function getCountryName(country?: string) {
  if (!country) {
    return undefined
  }

  return `${countries.getName(country, 'fr')} (${country})`
}
