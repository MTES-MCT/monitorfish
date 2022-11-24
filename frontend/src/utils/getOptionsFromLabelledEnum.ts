import { map, pipe, values } from 'ramda'

import type { Option } from '../types'

export const getOptionsFromLabelledEnum: (labelledEnum: Record<string, string>) => Option[] = pipe(
  values,
  map(
    (value: string): Option => ({
      label: value,
      value
    })
  )
)
