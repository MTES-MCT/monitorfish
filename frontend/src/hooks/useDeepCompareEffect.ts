// TODO Move that into monitor-ui.

import { usePrevious } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash/fp'
import { useEffect, type DependencyList, type EffectCallback } from 'react'

export function useDeepCompareEffect(effect: EffectCallback, deps: DependencyList): void {
  const previousValue = usePrevious(deps)

  const isDifferent = !isEqual(previousValue, deps)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [isDifferent])
}
