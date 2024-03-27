type QueryParamValue = number | string | boolean | Array<number | string> | null | undefined

const sortByKey = (a: [string, QueryParamValue], b: [string, QueryParamValue]): number => {
  const [keyA] = a
  const [keyB] = b

  return keyA.localeCompare(keyB)
}

export function getUrlOrPathWithQueryParams(
  urlOrPath: string,
  queryParamsAsObject: {
    [key: string]: QueryParamValue
  }
): string {
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
