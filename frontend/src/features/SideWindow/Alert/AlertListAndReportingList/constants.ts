import { SeaFrontGroup, SeaFrontGroupLabel } from '../../../../domain/entities/seaFront/constants'
import { getOptionsFromLabelledEnum } from '../../../../utils/getOptionsFromLabelledEnum'

import type { Option } from '@mtes-mct/monitor-ui'

export enum AlertAndReportingTab {
  ALERT = 'ALERT',
  REPORTING = 'REPORTING'
}

export const MISSION_LIST_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(SeaFrontGroupLabel) as Option<SeaFrontGroup>[]
