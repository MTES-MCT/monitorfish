import { ascend, identity, sort } from 'ramda'

export const sortByAscendingValue: <T extends number | string>(values: T[]) => T[] = sort(ascend(identity))
