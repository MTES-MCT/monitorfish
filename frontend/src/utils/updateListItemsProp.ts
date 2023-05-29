import { propEq, propSatisfies } from 'ramda'

import type { PickStringKeysWithNativeValues } from '../types'
import type { ValueOf } from 'type-fest'

/**
 * Returns a new copy of the array of objects <list>
 * with their properties updated via the provided <set>
 * where the objects property value equals <equals> or satisfies <satisfies>
 */
export function updateListItemsProp<
  Item extends Record<any, any> = Record<any, any>,
  ItemStringKeysWithNativeValues = PickStringKeysWithNativeValues<Item>,
  Key extends keyof ItemStringKeysWithNativeValues = keyof ItemStringKeysWithNativeValues,
  Value extends ValueOf<ItemStringKeysWithNativeValues, Key> = ValueOf<ItemStringKeysWithNativeValues, Key>
>(list: Item[], whereProp: Key, equalsOrSatisfies: Value | ((value: Value) => boolean), set: Partial<Item>): Item[] {
  const predicate: (obj: Item) => boolean =
    typeof equalsOrSatisfies === 'function'
      ? propSatisfies(equalsOrSatisfies as any, whereProp)
      : propEq<any>(equalsOrSatisfies, whereProp)

  return list.map(item => {
    if (predicate(item)) {
      return {
        ...item,
        ...set
      }
    }

    return item
  })
}
