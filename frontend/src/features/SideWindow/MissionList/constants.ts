import { getLocalizedDayjs, Option } from '@mtes-mct/monitor-ui'

import { MissionDateRangeFilter, MissionFilterType, MissionStatus } from './types'
import { Mission } from '../../../domain/entities/mission/types'
import { getOptionsFromLabelledEnum } from '../../../utils/getOptionsFromLabelledEnum'

import type { MissionWithActions } from './types'
import type { TableOptions } from '../../../hooks/useTable/types'

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

export const MISSION_LIST_TABLE_OPTIONS: TableOptions<MissionWithActions> = {
  columns: [
    {
      fixedWidth: 136,
      isSortable: true,
      key: 'startDateTimeUtc',
      label: 'Début',
      labelTransform: missionWithActions =>
        getLocalizedDayjs(missionWithActions.startDateTimeUtc).format('D MMM YY, HH:MM')
    },
    {
      fixedWidth: 136,
      isSortable: true,
      key: 'endDateTimeUtc',
      label: 'Fin',
      labelTransform: missionWithActions =>
        missionWithActions.endDateTimeUtc
          ? getLocalizedDayjs(missionWithActions.endDateTimeUtc).format('D MMM YY, HH:MM')
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
      transform: missionWithActions => MISSION_SOURCE_LABEL[missionWithActions.missionSource]
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
      labelTransform: missionWithActions =>
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
          //   return MissionStatus.INCOMING

          // case ???:
          //   return MissionStatus.DONE

          case missionWithActions.isClosed:
            return MissionStatus.CLOSED

          default:
            return MissionStatus.IN_PROGRESS
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
  searchableKeys: ['seaFront', 'unit']
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
