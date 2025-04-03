import { z } from 'zod'

import type { Native, OptionValueType, TreeBranchOption, TreeLeafOption } from '@mtes-mct/monitor-ui'
import type { ConditionalKeys, Exact } from 'type-fest'

// =============================================================================
// DEFINITIONS

export type CollectionItem = {
  [key: string]: any
  id?: number | string
}

export type MenuItem<T = string> = {
  code: T
  name: string
}

export type TreeBranchOptionWithValue<OptionValue extends OptionValueType = string> = Omit<
  TreeBranchOption,
  'children' | 'value'
> & {
  children: Array<TreeBranchOptionWithValue<OptionValue>> | Array<TreeLeafOption<OptionValue>>
  value: string
}

// =============================================================================
// UTILITIES

export type PartialExcept<T extends Record<string, any>, RequiredKeys extends keyof T> = Partial<
  Omit<T, RequiredKeys>
> &
  Pick<T, RequiredKeys>

export type PickStringKeysWithNativeValues<T extends Record<any, any>> = Exact<
  {
    [Key in string & ConditionalKeys<T, Native>]: T[Key]
  },
  T
>

export const stringOrUndefined = z.union([z.string(), z.undefined()])
export const numberOrUndefined = z.union([z.number(), z.undefined()])
export const booleanOrUndefined = z.union([z.boolean(), z.undefined()])
