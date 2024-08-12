import type { AnyObject, Defined } from '@mtes-mct/monitor-ui'

const isAnyPropUndefined = <T extends AnyObject>(obj: T, keys: Array<keyof T>): boolean => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    if (obj[key] === undefined) {
      return true
    }
  }

  return false
}

export function getDefinedObject<T extends AnyObject>(obj: T, keys: Array<keyof T>): Defined<T> | undefined {
  return isAnyPropUndefined(obj, keys) ? undefined : (obj as Defined<T>)
}
