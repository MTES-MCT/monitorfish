import { sortBy, take } from 'lodash-es'

export function getSortedProfileBarsByDesc(profile: Record<string, number>) {
  const sortedByDesc = sortBy(Object.keys(profile), key => profile[key]).reverse()

  const filteredSortedByDesc = take(sortedByDesc, 4)
    .map((key, index) => ({
      color: getColorFromIndex(index),
      key,
      value: (profile[key] && profile[key] * 100)?.toFixed(1) ?? 0
    }))
    .filter(bar => !!bar.value)

  const total = filteredSortedByDesc.reduce((acc, current) => acc + Number(current.value), 0)

  if (total !== 100) {
    return filteredSortedByDesc.concat({
      color: getColorFromIndex(5),
      key: 'Autres',
      value: Number(100 - total).toFixed(1)
    })
  }

  return filteredSortedByDesc
}

function getColorFromIndex(index: number) {
  switch (index) {
    case 0:
      return '#A6E3DD'
    case 1:
      return '#D4E3E7'
    case 2:
      return '#C9EEE8'
    case 3:
      return '#C5DADE'
    default:
      return '#E1F2F5'
  }
}
