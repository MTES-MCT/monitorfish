import { SeaFront } from '../../../domain/entities/alerts/constants'
import { Mission, MissionStatus, MissionType } from '../../../domain/types/mission'

import type { TableOptions } from '../../../hooks/useTable/types'

export const DUMMY_MISSIONS: Mission[] = new Array(20).fill(undefined).map((_, index) => ({
  alert: '-',
  endDate: new Date(),
  id: String(index + 1),
  inspectionsCount: 0,
  seaFront: SeaFront.MED,
  startDate: new Date(),
  status: MissionStatus.CLOSED,
  themes: [],
  type: MissionType.SEA,
  unit: 'Unité'
}))

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
      fixedWidth: 5,
      isSortable: true,
      key: 'alert',
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
