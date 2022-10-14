import diacritics from 'diacritics'

export function getArrayPathFromStringPath(stringPath: string): string[] {
  const arrayPath = stringPath.trim().split('.')

  if (!arrayPath[0]?.length) {
    throw new Error(
      `[ui/Table/utils.ts > getArrayPathFromStringPath()] A path can't be empty (stringPath = "${stringPath}").`
    )
  }

  return arrayPath
}

export function normalizeSearchQuery(searchQuery: string | undefined): string | undefined {
  if (!searchQuery || !searchQuery.trim().length) {
    return undefined
  }

  return (
    searchQuery
      .split(/\s+/)
      .map(diacritics.remove)

      // https://fusejs.io/examples.html#extended-search
      .map(searchQueryWord => `'${searchQueryWord}`)
      .join(' ')
  )
}
