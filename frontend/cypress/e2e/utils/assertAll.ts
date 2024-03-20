export function assertAll<T = any>(items: T[], assert: (item: T) => boolean) {
  const result = items.filter(assert)

  expect(result).to.have.lengthOf(items.length)
}
