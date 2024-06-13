import type { AnyObject } from '@mtes-mct/monitor-ui'
import type { Define } from '@mtes-mct/monitor-ui/types/utilities'

const isAnyPropUndefined = (obj: AnyObject): boolean => Object.values(obj).some(value => value === undefined)

export function getDefinedObject<T extends AnyObject>(obj: T): Define<T> | undefined {
  return isAnyPropUndefined(obj) ? undefined : (obj as Define<T>)
}
