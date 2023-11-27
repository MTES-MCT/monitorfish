export function isNotArchived<T extends { isArchived: boolean }>(item: T): boolean {
  return !item.isArchived
}
