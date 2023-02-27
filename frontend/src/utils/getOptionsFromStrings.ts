import { map } from 'ramda'

import type { Option } from '@mtes-mct/monitor-ui'

export const getOptionsFromStrings: (values: string[]) => Option[] = map(
  (value: string): Option => ({
    label: value,
    value
  })
)
