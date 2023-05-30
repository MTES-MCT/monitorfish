import { reject, propEq, propSatisfies } from 'ramda'

import type { PickStringKeysWithNativeValues } from '../types'
import type { ValueOf } from 'type-fest'

/**
 * Returns a new copy of the array of objects <list>
 * without the objects which property value equals <equals> or satisfies <satisfies>
 */
export function deleteListItems<
  Item extends Record<any, any> = Record<any, any>,
  ItemStringKeysWithNativeValues = PickStringKeysWithNativeValues<Item>,
  Key extends keyof ItemStringKeysWithNativeValues = keyof ItemStringKeysWithNativeValues,
  Value extends ValueOf<ItemStringKeysWithNativeValues, Key> = ValueOf<ItemStringKeysWithNativeValues, Key>
>(list: Item[], whereProp: Key, equalsOrSatisfies: Value | ((value: Value) => boolean)): Item[] {
  const predicate: (obj: Item) => boolean =
    typeof equalsOrSatisfies === 'function'
      ? propSatisfies(equalsOrSatisfies as any, whereProp)
      : propEq<any>(equalsOrSatisfies, whereProp)

  return reject(predicate)(list)
}
