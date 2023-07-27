// TODO Move that into monitor-ui.

import { usePrevious } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash/fp'
import { type DependencyList, useMemo } from 'react'

export function useDeepCompareMemo<T>(factory: () => T, deps: DependencyList): T {
  const previousValue = usePrevious(deps)

  const isDifferent = !isEqual(previousValue, deps)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [isDifferent])
}
