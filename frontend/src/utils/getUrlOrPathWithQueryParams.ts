import { isObject } from './isObject'

import type { AnyObject } from '@mtes-mct/monitor-ui'

function getUrlQueryParamFromObjectEntry(key: string, value: any): string {
  if (Array.isArray(value)) {
    return value.reduce(
      (queryParamAsString, valueItem) => `${queryParamAsString}${queryParamAsString ? '&' : ''}${key}=${valueItem}`,
      ''
    )
  }

  if (isObject(value)) {
    return Object.entries(value).reduce((queryParamAsString, [nestedKey, nestedValue]) => {
      if (nestedValue === undefined) {
        return queryParamAsString
      }

      return `${queryParamAsString}${queryParamAsString ? '&' : ''}${key}.${nestedKey}=${nestedValue}`
    }, '')
  }

  return `${key}=${value}`
}

// TODO Add unit tests.
export function getUrlOrPathWithQueryParams(urlOrPath: string, queryParamsAsObject: AnyObject): string {
  const queryParamsAsString = Object.entries(queryParamsAsObject).reduce((queryParamsAsStringAcc, [key, value]) => {
    if (value === undefined || value === null) {
      return queryParamsAsStringAcc
    }

    const queryParamAsString = getUrlQueryParamFromObjectEntry(key, value)

    return `${queryParamsAsStringAcc}${queryParamsAsStringAcc ? '&' : ''}${queryParamAsString}`
  }, '')

  return `${urlOrPath}${queryParamsAsString ? '?' : ''}${queryParamsAsString}`
}
