import Fuse from 'fuse.js'
import { isEqual } from 'lodash'

import { getAlertNameFromType } from './utils'
import { SeaFrontGroup } from '../../../constants'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { LEGACY_PendingAlert, LEGACY_SilencedAlert } from '../../../domain/entities/alerts/types'

const PENDING_ALERT_TYPE_KEY_PATH = ['value', 'type']

export const ALERT_AND_REPORTING_LIST_SUB_MENU = getOptionsFromLabelledEnum(SeaFrontGroup)

export const PENDING_ALERTS_SEARCH_OPTIONS: Fuse.IFuseOptions<LEGACY_PendingAlert | LEGACY_SilencedAlert> = {
  distance: 50,
  getFn: (alert, path) => {
    const value = Fuse.config.getFn(alert, path)

    if (isEqual(path, PENDING_ALERT_TYPE_KEY_PATH)) {
      return getAlertNameFromType(alert.value.type)
    }

    return value
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  includeScore: true,
  keys: ['vesselName', 'internalReferenceNumber', 'externalReferenceNumber', 'ircs', PENDING_ALERT_TYPE_KEY_PATH],
  threshold: 0.4
}
