import { curry, difference } from 'ramda'

function uncurriedIncludesSome<T>(ofList: T[], inList: T[]): boolean {
  return difference<T>(ofList, inList).length < ofList.length
}

export const includesSome = curry(uncurriedIncludesSome)
