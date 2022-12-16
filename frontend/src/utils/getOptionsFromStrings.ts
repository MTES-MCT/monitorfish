import { map } from 'ramda'

import type { Option } from '../types'

export const getOptionsFromStrings: (values: string[]) => Option[] = map(
  (value: string): Option => ({
    label: value,
    value
  })
)
