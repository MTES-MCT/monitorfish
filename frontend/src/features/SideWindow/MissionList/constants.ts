import { dayjs } from '@mtes-mct/monitor-ui'

import { MissionDateRangeFilterLabel, MissionFilterType } from './types'
import { Mission } from '../../../domain/entities/mission/types'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { TableOptions } from '../../../hooks/useTable/types'
import type { Option } from '@mtes-mct/monitor-ui'

export const MISSION_FILTER_LABEL_ENUMERATORS: Record<MissionFilterType, Record<string, string> | undefined> = {
  [MissionFilterType.ADMINISTRATION]: undefined,
  [MissionFilterType.CUSTOM_DATE_RANGE]: undefined,
  [MissionFilterType.DATE_RANGE]: MissionDateRangeFilterLabel,
  [MissionFilterType.SOURCE]: Mission.MissionSourceLabel,
  [MissionFilterType.STATUS]: Mission.MissionStatusLabel,
  [MissionFilterType.TYPE]: Mission.MissionTypeLabel,
  [MissionFilterType.UNIT]: undefined
}

export const MISSION_FILTER_OPTIONS: Record<MissionFilterType, Option[]> = {
  [MissionFilterType.ADMINISTRATION]: [],
  [MissionFilterType.CUSTOM_DATE_RANGE]: [],
  [MissionFilterType.DATE_RANGE]: getOptionsFromLabelledEnum(MissionDateRangeFilterLabel),
  [MissionFilterType.SOURCE]: getOptionsFromLabelledEnum(Mission.MissionSourceLabel),
  [MissionFilterType.STATUS]: getOptionsFromLabelledEnum(Mission.MissionStatusLabel),
  [MissionFilterType.TYPE]: getOptionsFromLabelledEnum(Mission.MissionTypeLabel),
  [MissionFilterType.UNIT]: []
}

export const MISSION_LIST_TABLE_OPTIONS: TableOptions<MissionWithActions> = {
  columns: [
    {
      fixedWidth: 136,
      isSortable: true,
      key: 'startDateTimeUtc',
      label: 'Début',
      labelTransform: missionWithActions => dayjs(missionWithActions.startDateTimeUtc).utc().format('D MMM YY, HH:mm')
    },
    {
      fixedWidth: 136,
      isSortable: true,
      key: 'endDateTimeUtc',
      label: 'Fin',
      labelTransform: missionWithActions =>
        missionWithActions.endDateTimeUtc
          ? dayjs(missionWithActions.endDateTimeUtc).utc().format('D MMM YY, HH:mm')
          : ''
    },
    {
      fixedWidth: 80,
      isSortable: true,
      key: 'missionType',
      label: 'Type',
      transform: missionWithActions => MISSION_TYPE_LABEL[missionWithActions.missionType]
    },
    {
      fixedWidth: 80,
      isSortable: true,
      key: 'missionSource',
      label: 'Origine',
      labelTransform: missionWithActions => MISSION_SOURCE_LABEL[missionWithActions.missionSource]
    },
    {
      fixedWidth: 160,
      isSortable: true,
      key: 'controlUnits',
      label: 'Unité (Administration)',
      transform: missionWithActions =>
        missionWithActions.controlUnits
          .map(controlUnit => `${controlUnit.name} (${controlUnit.administration})`)
          .join(', ')
    },
    {
      isSortable: false,
      key: 'inspectedVessels',
      label: 'Navires contrôlés',
      transform: missionWithActions =>
        missionWithActions.actions
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
      labelTransform: missionWithActions =>
        missionWithActions.actions.length > 0 ? missionWithActions.actions.length : '-',
      transform: missionWithActions => missionWithActions.actions.length
    },
    {
      fixedWidth: 128,
      isSortable: true,
      key: 'status',
      label: 'Statut',
      transform: missionWithActions => {
        switch (true) {
          // case ???:
          //   return Mission.MissionStatus.INCOMING

          // case ???:
          //   return Mission.MissionStatus.DONE

          case missionWithActions.isClosed:
            return Mission.MissionStatus.CLOSED

          default:
            return Mission.MissionStatus.IN_PROGRESS
        }
      }
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
