import countries from 'i18n-iso-countries'

import { CSVOptions } from './dataFormatting'

export enum SortType {
  ASC = 'asc',
  DESC = 'desc'
}

export function sortArrayByColumn(a, b, sortColumn, sortType) {
  let x = a[sortColumn]
  let y = b[sortColumn]

  if (sortColumn === CSVOptions.flagState.code) {
    x = countries.getName(a[sortColumn], 'fr')
    y = countries.getName(b[sortColumn], 'fr')
  }

  if (sortColumn === CSVOptions.dateTime.code || sortColumn === CSVOptions.riskFactor.code) {
    if (sortType === SortType.ASC) {
      return x.localeCompare(y)
    }

    return y.localeCompare(x)
  }

  if (typeof x === 'string' && typeof y === 'string') {
    if (sortType === SortType.ASC) {
      return x.localeCompare(y)
    }

    return y.localeCompare(x)
  }

  if (x === '' || x === null) {
    return 1
  }
  if (y === '' || y === null) {
    return -1
  }

  if (sortType === SortType.ASC) {
    return x - y
  }

  return y - x
}

export function sortVesselsByProperty(a, b, sortColumn, sortType) {
  let x = a[sortColumn] || a?.vesselProperties[sortColumn]
  let y = b[sortColumn] || b?.vesselProperties[sortColumn]

  if (sortColumn === CSVOptions.flagState.code) {
    x = countries.getName(a?.vesselProperties[sortColumn], 'fr')
    y = countries.getName(b?.vesselProperties[sortColumn], 'fr')
  }

  if (sortColumn === CSVOptions.dateTime.code) {
    if (sortType === SortType.ASC) {
      return x.localeCompare(y)
    }

    return y.localeCompare(x)
  }

  if (typeof x === 'string' && typeof y === 'string') {
    if (sortType === SortType.ASC) {
      return x.localeCompare(y)
    }

    return y.localeCompare(x)
  }

  if (x === '' || x === null) {
    return 1
  }
  if (y === '' || y === null) {
    return -1
  }

  if (sortType === SortType.ASC) {
    return x - y
  }

  return y - x
}
