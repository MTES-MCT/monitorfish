import { SeaFront } from '../../../domain/entities/alerts/constants'
import { Mission, MissionAlertType, MissionGoal, MissionStatus, MissionType } from '../../../domain/types/mission'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { TableOptions } from '../../../hooks/useTable/types'
import type { Option } from '../../../types'

export const DUMMY_MISSIONS: Mission[] = new Array(20).fill(undefined).map((_, index) => ({
  alertType: MissionAlertType.WAITING_FOR_CLOSURE,
  cacemNote: 'Une note du CACEM.',
  closedBy: 'Bob A',
  cnspNote: 'Une note du CNSP.',
  endDate: new Date(),
  goals: [MissionGoal.FISHING],
  hasOrder: false,
  id: String(index + 1),
  inspectionsCount: 0,
  isUnderJdp: false,
  openedBy: 'Bob B',
  resourceUnits: [],
  seaFront: SeaFront.MED,
  startDate: new Date(),
  status: MissionStatus.CLOSED,
  themes: [],
  type: MissionType.SEA,
  zones: []
}))

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
  [MissionFilterType.ALERT_TYPE]: getOptionsFromLabelledEnum(MissionAlertType),
  [MissionFilterType.CUSTOM_DATE_RANGE]: [],
  [MissionFilterType.DATE_RANGE]: getOptionsFromLabelledEnum(MissionDateRangeFilter),
  [MissionFilterType.INSPECTION_TYPE]: [
    {
      label: 'Inconnu',
      value: 'UNKNOWN'
    }
  ],
  [MissionFilterType.MISSION_TYPE]: getOptionsFromLabelledEnum(MissionType),
  [MissionFilterType.STATUS]: getOptionsFromLabelledEnum(MissionStatus),
  [MissionFilterType.UNIT]: []
}

export const MISSION_LIST_TABLE_OPTIONS: TableOptions<Mission> = {
  columns: [
    {
      fixedWidth: 7,
      isSortable: true,
      key: 'startDate',
      label: 'Date de début'
    },
    {
      fixedWidth: 7,
      isSortable: true,
      key: 'endDate',
      label: 'Date de fin'
    },
    {
      fixedWidth: 10,
      isSortable: true,
      key: 'unit',
      label: 'Unité (Administration)'
    },
    {
      fixedWidth: 5,
      isSortable: true,
      key: 'type',
      label: 'Type'
    },
    {
      fixedWidth: 5,
      isSortable: true,
      key: 'seaFront',
      label: 'Façade'
    },
    {
      fixedWidth: 10,
      key: 'themes',
      label: 'Thématiques'
    },
    {
      fixedWidth: 2,
      isSortable: true,
      key: 'inspectionsCount',
      label: 'Nombre de contrôles'
    },
    {
      fixedWidth: 5,
      isSortable: true,
      key: 'status',
      label: 'Statut'
    },
    {
      fixedWidth: 10,
      isSortable: true,
      key: 'alertType',
      label: 'Alerte'
    },
    {
      fixedWidth: 2,
      key: 'mapAction',
      label: ''
    },
    {
      fixedWidth: 2,
      key: 'editionAction',
      label: ''
    }
  ],
  searchableKeys: ['seaFront', 'unit']
}
