import type { AnyObject } from '@mtes-mct/monitor-ui'
import type { Define } from '@mtes-mct/monitor-ui/types/utilities'

const isAnyPropUndefined = <T extends AnyObject>(obj: T, keys: Array<keyof T>): boolean => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    if (obj[key] === undefined) {
      return true
    }
  }

  return false
}

export function getDefinedObject<T extends AnyObject>(obj: T, keys: Array<keyof T>): Define<T> | undefined {
  return isAnyPropUndefined(obj, keys) ? undefined : (obj as Define<T>)
}
