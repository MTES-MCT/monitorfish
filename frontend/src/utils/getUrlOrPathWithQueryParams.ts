import { isObject } from './isObject'

import type { AnyObject } from '@mtes-mct/monitor-ui'

const sortByKey = (a: [string, any], b: [string, any]): number => {
  const [keyA] = a
  const [keyB] = b

  return keyA.localeCompare(keyB)
}

function getUrlQueryParamFromObjectEntry(key: string, value: any): string {
  if (Array.isArray(value)) {
    return `${key}=${[...value].sort().join(',')}`
  }

  if (isObject(value)) {
    return Object.entries(value)
      .sort(sortByKey)
      .reduce((queryParamAsString, [nestedKey, nestedValue]) => {
        if (nestedValue === undefined) {
          return queryParamAsString
        }

        return `${queryParamAsString}${queryParamAsString ? '&' : ''}${key}.${nestedKey}=${nestedValue}`
      }, '')
  }

  return `${key}=${value}`
}

export function getUrlOrPathWithQueryParams(urlOrPath: string, queryParamsAsObject: AnyObject): string {
  const queryParamsAsString = Object.entries(queryParamsAsObject)
    .sort(sortByKey)
    .reduce((queryParamsAsStringAcc, [key, value]) => {
      if (value === undefined || value === null) {
        return queryParamsAsStringAcc
      }

      const queryParamAsString = getUrlQueryParamFromObjectEntry(key, value)

      return `${queryParamsAsStringAcc}${queryParamsAsStringAcc ? '&' : ''}${queryParamAsString}`
    }, '')

  return `${urlOrPath}${queryParamsAsString ? '?' : ''}${queryParamsAsString}`
}
