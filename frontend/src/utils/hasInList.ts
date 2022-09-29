import { propEq, propSatisfies } from 'ramda'

import type { PickStringKeysWithNativeValues } from '../types'
import type { ValueOf } from 'type-fest'

/**
 * Check if the array of objects <list> includes any object
 * where the objects property value equals <equals> or satisfies <satisfies>
 */
export function hasInList<
  Item extends Record<any, any> = Record<any, any>,
  ItemStringKeysWithNativeValues = PickStringKeysWithNativeValues<Item>,
  Key extends keyof ItemStringKeysWithNativeValues = keyof ItemStringKeysWithNativeValues,
  Value extends ValueOf<ItemStringKeysWithNativeValues, Key> = ValueOf<ItemStringKeysWithNativeValues, Key>
>(list: Item[], whereProp: Key, equalsOrSatisfies: Value | ((value: Value) => boolean)): boolean {
  const predicate: (obj: Item) => boolean =
    typeof equalsOrSatisfies === 'function'
      ? propSatisfies(equalsOrSatisfies as any, whereProp)
      : propEq<any>(whereProp, equalsOrSatisfies)

  return Boolean(list.filter(predicate).length)
}
