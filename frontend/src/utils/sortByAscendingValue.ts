import { sortBy } from 'lodash-es'

export const sortByAscendingValue: <T extends number | string>(values: T[]) => T[] = values => sortBy(values, x => x)
