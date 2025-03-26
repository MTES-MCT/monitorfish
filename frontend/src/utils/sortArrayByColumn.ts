export enum SortType {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * @deprecated Do not use this function which was written only for vessel list sorting
 */
export function sortArrayByColumn(a, b, sortColumn, sortType) {
  const x = a[sortColumn]
  const y = b[sortColumn]

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
