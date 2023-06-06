// TODO Move that into monitor-ui.

import { usePrevious } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash/fp'
import { type DependencyList, useMemo } from 'react'

export function useDeepCompareCallback<T extends Function>(callback: T, deps: DependencyList): T {
  const previousValue = usePrevious(deps)

  const isDifferent = !isEqual(previousValue, deps)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => callback, [isDifferent])
}
