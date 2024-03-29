import { map, pipe, toPairs } from 'ramda'

import type { Option } from '@mtes-mct/monitor-ui'

export const getOptionsFromLabelledEnum: (labelledEnum: Record<string, string>) => Option[] = pipe(
  toPairs as any,
  map(
    ([key, value]: [string, string]): Option => ({
      label: value,
      value: key
    })
  )
)
