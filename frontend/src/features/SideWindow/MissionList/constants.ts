import { customDayjs } from '@mtes-mct/monitor-ui'

import { MissionDateRangeFilterLabel, MissionFilterType } from './types'
import { SeaFrontGroup, SeaFrontGroupLabel } from '../../../constants'
import { Mission } from '../../../domain/entities/mission/types'
import { getMissionStatus } from '../../../domain/entities/mission/utils'
import { MissionAction } from '../../../domain/types/missionAction'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { TableOptions } from '../../../hooks/useTable/types'
import type { Option } from '@mtes-mct/monitor-ui'

export const MISSION_FILTER_LABEL_ENUMS: Record<MissionFilterType, Record<string, string> | undefined> = {
  [MissionFilterType.ADMINISTRATION]: undefined,
  [MissionFilterType.CUSTOM_DATE_RANGE]: undefined,
  [MissionFilterType.DATE_RANGE]: MissionDateRangeFilterLabel,
  [MissionFilterType.SOURCE]: Mission.MissionSourceLabel,
  [MissionFilterType.STATUS]: Mission.MissionStatusLabel,
  [MissionFilterType.TYPE]: Mission.MissionTypeLabel,
  [MissionFilterType.UNIT]: undefined
}

export const MISSION_FILTER_OPTIONS: Record<MissionFilterType, Option<any>[]> = {
  [MissionFilterType.ADMINISTRATION]: [],
  [MissionFilterType.CUSTOM_DATE_RANGE]: [],
  [MissionFilterType.DATE_RANGE]: getOptionsFromLabelledEnum(MissionDateRangeFilterLabel),
  [MissionFilterType.SOURCE]: getOptionsFromLabelledEnum(Mission.MissionSourceLabelWithoutPoseidon),
  [MissionFilterType.STATUS]: getOptionsFromLabelledEnum(Mission.MissionStatusLabel),
  [MissionFilterType.TYPE]: getOptionsFromLabelledEnum(Mission.MissionTypeLabel),
  [MissionFilterType.UNIT]: []
}

export const MISSION_LIST_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(SeaFrontGroupLabel) as Option<SeaFrontGroup>[]

export const MISSION_LIST_TABLE_OPTIONS: TableOptions<MissionWithActions> = {
  columns: [
    {
      fixedWidth: 136,
      isSortable: true,
      key: 'startDateTimeUtc',
      label: 'Début',
      labelTransform: mission => customDayjs(mission.startDateTimeUtc).utc().format('D MMM YY, HH:mm')
    },
    {
      fixedWidth: 136,
      isSortable: true,
      key: 'endDateTimeUtc',
      label: 'Fin',
      labelTransform: mission =>
        mission.endDateTimeUtc ? customDayjs(mission.endDateTimeUtc).utc().format('D MMM YY, HH:mm') : ''
    },
    {
      fixedWidth: 80,
      isSortable: true,
      key: 'missionTypes',
      label: 'Type',
      transform: mission => mission.missionTypes.map(missionType => MISSION_TYPE_LABEL[missionType]).join(', ')
    },
    {
      fixedWidth: 80,
      isSortable: true,
      key: 'missionSource',
      label: 'Origine',
      labelTransform: mission => MISSION_SOURCE_LABEL[mission.missionSource]
    },
    {
      fixedWidth: 160,
      isSortable: true,
      key: 'controlUnits',
      label: 'Unité (Administration)',
      transform: mission =>
        mission.controlUnits.map(controlUnit => `${controlUnit.name} (${controlUnit.administration})`).join(', ')
    },
    {
      fixedWidth: 320,
      isSortable: false,
      key: 'inspectedVessels',
      label: 'Navires contrôlés',
      transform: mission =>
        mission.actions
          .map(action => action.vesselName)
          .filter((vesselName: string | undefined): vesselName is string => !!vesselName)
          .sort()
          .join(', ')
    },
    {
      fixedWidth: 128,
      isSortable: true,
      key: 'inspectionsCount',
      label: 'Contrôles',
      labelTransform: mission => {
        const nonObservationActions = mission.actions.filter(
          ({ actionType }) => actionType !== MissionAction.MissionActionType.OBSERVATION
        )

        return nonObservationActions.length > 0 ? nonObservationActions.length : '-'
      },
      transform: mission => mission.actions.length
    },
    {
      fixedWidth: 128,
      isSortable: true,
      key: 'status',
      label: 'Statut',
      transform: getMissionStatus
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
  defaultSortedKey: 'startDateTimeUtc',
  isDefaultSortingDesc: true,
  searchableKeys: ['inspectedVessels']
}

export const MISSION_SOURCE_LABEL: Record<Mission.MissionSource, string> = {
  [Mission.MissionSource.MONITORENV]: 'CACEM',
  [Mission.MissionSource.MONITORFISH]: 'CNSP',
  [Mission.MissionSource.POSEIDON_CACEM]: 'CACEM (Poseidon)',
  [Mission.MissionSource.POSEIDON_CNSP]: 'CNSP (Poseidon)'
}

export const MISSION_TYPE_LABEL: Record<Mission.MissionType, string> = {
  [Mission.MissionType.AIR]: 'Air',
  [Mission.MissionType.LAND]: 'Terre',
  [Mission.MissionType.SEA]: 'Mer'
}
