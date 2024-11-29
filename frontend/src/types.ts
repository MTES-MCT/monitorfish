import type { Native, OptionValueType, TreeBranchOption, TreeLeafOption } from '@mtes-mct/monitor-ui'
import type { ConditionalKeys, Exact } from 'type-fest'

// =============================================================================
// DEFINITIONS

export type CollectionItem = {
  [key: string]: any
  id: number | string
}

export type FormikFormError = Record<string, any> | undefined

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

export type PickStringKeys<T extends Record<any, any>> = Exact<
  {
    [Key in string]: T[Key]
  },
  T
>

export type PickStringKeysWithNativeValues<T extends Record<any, any>> = Exact<
  {
    [Key in string & ConditionalKeys<T, Native>]: T[Key]
  },
  T
>

export type StringKeyRecord<T> = PickStringKeys<Record<string, T>>
