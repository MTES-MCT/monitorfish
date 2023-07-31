export function encodeUriObject(
  baseUri: string,
  searchParamsAsObject: Record<string, number | string>,
  isGeoserver: boolean = false
): string {
  if (isGeoserver) {
    const uriAsString = [
      baseUri,
      '?',
      Object.entries(searchParamsAsObject)
        .map(([searchParamKey, searchParamValue]) =>
          [searchParamKey, String(searchParamValue).replace(/ /g, '%20').replace(/'/g, '%27')].join('=')
        )
        .join('&')
    ].join('')

    return uriAsString
  }

  const searchParams = new URLSearchParams()
  Object.entries(searchParamsAsObject).forEach(([searchParamKey, searchParamValue]) => {
    searchParams.append(searchParamKey, String(searchParamValue))
  })
  const uriAsString = `${baseUri}?${searchParams.toString()}`

  return uriAsString
}
