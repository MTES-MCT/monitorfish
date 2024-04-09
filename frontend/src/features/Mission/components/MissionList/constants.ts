import { getMissionCompletionFrontStatus, getMissionStatus } from '@features/Mission/utils'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { getOptionsFromLabelledEnum } from '@utils/getOptionsFromLabelledEnum'

import { MissionDateRangeFilterLabel, MissionFilterType } from './types'
import { SeaFrontGroup, SeaFrontGroupLabel } from '../../../../domain/entities/seaFront/constants'
import { UNKNOWN_VESSEL } from '../../../../domain/entities/vessel/vessel'
import { Mission } from '../../mission.types'
import { MissionAction } from '../../missionAction.types'

import type { TableOptions } from '@hooks/useTable/types'
import type { Option } from '@mtes-mct/monitor-ui'

enum TagFrontCompletionStatusLabel {
  COMPLETED = 'Données complétées',
  TO_COMPLETE = 'Données à compléter',
  UP_TO_DATE = 'Données à jour'
}

export const MISSION_FILTER_LABEL_ENUMS: Record<MissionFilterType, Record<string, string> | undefined> = {
  [MissionFilterType.ADMINISTRATION]: undefined,
  [MissionFilterType.CUSTOM_DATE_RANGE]: undefined,
  [MissionFilterType.DATE_RANGE]: MissionDateRangeFilterLabel,
  [MissionFilterType.SOURCE]: Mission.MissionSourceLabel,
  [MissionFilterType.STATUS]: Mission.MissionStatusLabel,
  [MissionFilterType.COMPLETION_STATUS]: TagFrontCompletionStatusLabel,
  [MissionFilterType.WITH_ACTIONS]: undefined,
  [MissionFilterType.TYPE]: Mission.MissionTypeLabel,
  [MissionFilterType.UNIT]: undefined
}

export const MISSION_FILTER_OPTIONS: Record<MissionFilterType, Option<any>[]> = {
  [MissionFilterType.ADMINISTRATION]: [],
  [MissionFilterType.CUSTOM_DATE_RANGE]: [],
  [MissionFilterType.DATE_RANGE]: getOptionsFromLabelledEnum(MissionDateRangeFilterLabel),
  [MissionFilterType.SOURCE]: getOptionsFromLabelledEnum(Mission.MissionSourceLabelWithoutPoseidon),
  [MissionFilterType.STATUS]: getOptionsFromLabelledEnum(Mission.MissionStatusLabel),
  [MissionFilterType.COMPLETION_STATUS]: getOptionsFromLabelledEnum(MissionAction.FrontCompletionStatusLabel),
  [MissionFilterType.TYPE]: getOptionsFromLabelledEnum(Mission.MissionTypeLabel),
  [MissionFilterType.WITH_ACTIONS]: [],
  [MissionFilterType.UNIT]: []
}

export const MISSION_LIST_SUB_MENU_OPTIONS = getOptionsFromLabelledEnum(SeaFrontGroupLabel) as Option<SeaFrontGroup>[]

const MISSION_ACTION_CONTROL_TYPES = [
  MissionAction.MissionActionType.AIR_CONTROL,
  MissionAction.MissionActionType.LAND_CONTROL,
  MissionAction.MissionActionType.SEA_CONTROL
]

export const MISSION_LIST_TABLE_OPTIONS: TableOptions<Mission.MissionWithActions> = {
  columns: [
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'startDateTimeUtc',
      label: 'Début',
      labelTransform: mission => customDayjs(mission.startDateTimeUtc).utc().format('D MMM YY, HH:mm')
    },
    {
      fixedWidth: 130,
      isSortable: true,
      key: 'endDateTimeUtc',
      label: 'Fin',
      labelTransform: mission =>
        mission.endDateTimeUtc ? customDayjs(mission.endDateTimeUtc).utc().format('D MMM YY, HH:mm') : ''
    },
    {
      fixedWidth: 100,
      isSortable: true,
      key: 'missionTypes',
      label: 'Type',
      transform: mission => mission.missionTypes.map(missionType => MISSION_TYPE_LABEL[missionType]).join(', ')
    },
    {
      fixedWidth: 280,
      isSortable: true,
      key: 'controlUnits',
      label: 'Unité (Administration)',
      transform: mission =>
        mission.controlUnits.map(controlUnit => `${controlUnit.name} (${controlUnit.administration})`).join(', ')
    },
    {
      fixedWidth: 380,
      isSortable: false,
      key: 'inspectedVessels',
      label: 'Navires contrôlés',
      transform: mission =>
        mission.actions
          .map(action => (action.vesselName === UNKNOWN_VESSEL.vesselName ? 'INCONNU' : action.vesselName))
          .filter((vesselName: string | undefined): vesselName is string => !!vesselName)
          .sort()
          .join(', ')
    },
    {
      fixedWidth: 90,
      isSortable: true,
      key: 'inspectionsCount',
      label: 'Contrôles',
      labelTransform: mission => {
        const controls = mission.actions.filter(({ actionType }) => MISSION_ACTION_CONTROL_TYPES.includes(actionType))

        return controls.length > 0 ? controls.length : '-'
      },
      transform: mission => mission.actions.length
    },
    {
      fixedWidth: 110,
      isSortable: true,
      key: 'status',
      label: 'Statut',
      transform: getMissionStatus
    },
    {
      fixedWidth: 125,
      isSortable: true,
      key: 'completion',
      label: 'État données',
      labelTransform: mission => {
        const actionsCompletion = mission.actions.map(action => action.completion)

        return getMissionCompletionFrontStatus(mission, actionsCompletion)
      }
    },
    {
      fixedWidth: 50,
      key: 'mapAction',
      label: ''
    },
    {
      fixedWidth: 50,
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
