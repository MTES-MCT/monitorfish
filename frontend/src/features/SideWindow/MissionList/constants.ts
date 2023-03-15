import { Mission } from '../../../domain/entities/mission/types'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { TableOptions } from '../../../hooks/useTable/types'
import type { Option } from '@mtes-mct/monitor-ui'

/* eslint-disable typescript-sort-keys/string-enum */
export enum MissionDateRangeFilter {
  CURRENT_DAY = 'Aujourd’hui',
  CURRENT_WEEK = 'Semaine en cours',
  CURRENT_MONTH = 'Mois en cours',
  CURRENT_QUARTER = 'Trimestre en cours',
  CUSTOM = 'Période spécifique'
}
/* eslint-enable typescript-sort-keys/string-enum */

export enum MissionFilterType {
  ALERT_TYPE = 'alertType',
  CUSTOM_DATE_RANGE = 'customDateRange',
  DATE_RANGE = 'dateRange',
  INSPECTION_TYPE = 'inspectionType',
  MISSION_TYPE = 'missionType',
  STATUS = 'status',
  UNIT = 'unit'
}

export const MISSION_FILTER_OPTIONS: Record<MissionFilterType, Option[]> = {
  [MissionFilterType.ALERT_TYPE]: getOptionsFromLabelledEnum(Mission.MissionAlertType),
  [MissionFilterType.CUSTOM_DATE_RANGE]: [],
  [MissionFilterType.DATE_RANGE]: getOptionsFromLabelledEnum(MissionDateRangeFilter),
  [MissionFilterType.INSPECTION_TYPE]: [
    {
      label: 'Inconnu',
      value: 'UNKNOWN'
    }
  ],
  [MissionFilterType.MISSION_TYPE]: getOptionsFromLabelledEnum(Mission.MissionType),
  [MissionFilterType.STATUS]: getOptionsFromLabelledEnum(Mission.MissionStatus),
  [MissionFilterType.UNIT]: []
}

export const MISSION_LIST_TABLE_OPTIONS: TableOptions<Mission.Mission> = {
  columns: [
    {
      fixedWidth: 144,
      isSortable: true,
      key: 'startDate',
      label: 'Date de début'
    },
    {
      fixedWidth: 144,
      isSortable: true,
      key: 'endDate',
      label: 'Date de fin'
    },
    {
      isSortable: true,
      key: 'unit',
      label: 'Unité (Administration)'
    },
    {
      fixedWidth: 80,
      isSortable: true,
      key: 'type',
      label: 'Type'
    },
    {
      fixedWidth: 80,
      isSortable: true,
      key: 'seaFront',
      label: 'Façade'
    },
    {
      fixedWidth: 160,
      key: 'themes',
      label: 'Thématiques'
    },
    {
      fixedWidth: 48,
      isSortable: true,
      key: 'inspectionsCount',
      label: 'Nombre de contrôles'
    },
    {
      fixedWidth: 128,
      isSortable: true,
      key: 'status',
      label: 'Statut'
    },
    {
      fixedWidth: 160,
      isSortable: true,
      key: 'alertType',
      label: 'Alerte'
    },
    {
      fixedWidth: 48,
      key: 'mapAction',
      label: ''
    },
    {
      fixedWidth: 48,
      key: 'editionAction',
      label: ''
    }
  ],
  searchableKeys: ['seaFront', 'unit']
}
