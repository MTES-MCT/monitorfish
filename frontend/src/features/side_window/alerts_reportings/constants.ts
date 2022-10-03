import Fuse from 'fuse.js'
import { isEqual } from 'lodash'

import { getAlertNameFromType } from './utils'

import type { LEGACY_PendingAlert, LEGACY_SilencedAlert } from '../../../domain/types/alert'

const alertTypeKey = ['value', 'type']

export const PENDING_ALERTS_SEARCH_OPTIONS: Fuse.IFuseOptions<LEGACY_PendingAlert | LEGACY_SilencedAlert> = {
  distance: 50,
  getFn: (alert, path) => {
    const value = Fuse.config.getFn(alert, path)

    if (isEqual(path, alertTypeKey)) {
      return getAlertNameFromType(alert.value.type)
    }

    return value
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  includeScore: true,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs', alertTypeKey],
  threshold: 0.4
}
