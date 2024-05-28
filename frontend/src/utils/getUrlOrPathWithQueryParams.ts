import type { AnyObject } from '@mtes-mct/monitor-ui'

const sortByKey = (a: [string, any], b: [string, any]): number => {
  const [keyA] = a
  const [keyB] = b

  return keyA.localeCompare(keyB)
}

export function getUrlOrPathWithQueryParams(urlOrPath: string, queryParamsAsObject: AnyObject): string {
  const queryParamsAsString = Object.entries(queryParamsAsObject)
    .sort(sortByKey)
    .reduce((queryParamsAsStringAcc, [key, value]) => {
      if (value === undefined || value === null) {
        return queryParamsAsStringAcc
      }

      const queryParamAsString = Array.isArray(value) ? `${key}=${[...value].sort().join(',')}` : `${key}=${value}`

      return `${queryParamsAsStringAcc}${queryParamsAsStringAcc ? '&' : ''}${queryParamAsString}`
    }, '')

  return `${urlOrPath}${queryParamsAsString ? '?' : ''}${queryParamsAsString}`
}
