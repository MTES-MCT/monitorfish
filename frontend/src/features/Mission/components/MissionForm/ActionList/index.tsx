import { MonitorEnvMissionActionItem } from '@features/Mission/components/MissionForm/ActionList/MonitorEnvMissionActionItem'
import { getMissionActionDate } from '@features/Mission/components/MissionForm/ActionList/utils'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { MonitorEnvMissionAction } from '@features/Mission/monitorEnvMissionAction.types'
import { useGetMissionQuery } from '@features/Mission/monitorenvMissionApi'
import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useMemo } from 'react'
import styled from 'styled-components'
import { FrontendErrorBoundary } from 'ui/FrontendErrorBoundary'

import { MissionActionItem } from './MissionActionItem'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { MissionActionWithSource } from '@features/Mission/components/MissionForm/ActionList/types'
import type { Promisable } from 'type-fest'

type ActionListProps = Readonly<{
  actionsFormValues: MissionActionFormValues[]
  currentIndex: number | undefined
  missionId: number | undefined
  missionTypes: Mission.MissionType[] | undefined
  onAdd: (actionType: MissionAction.MissionActionType) => Promisable<void>
  onDuplicate: (actionIndex: number) => Promisable<void>
  onRemove: (actionIndex: number) => Promisable<void>
  onSelect: (actionIndex: number) => Promisable<void>
}>
export function ActionList({
  actionsFormValues,
  currentIndex,
  missionId,
  missionTypes = [],
  onAdd,
  onDuplicate,
  onRemove,
  onSelect
}: ActionListProps) {
  const getMissionApiQuery = useGetMissionQuery(missionId || skipToken)

  const allSortedMissionActionsWithSource = useMemo(() => {
    const monitorFishActions = actionsFormValues.map((action, index) => ({
      ...action,
      index,
      source: Mission.MissionSource.MONITORFISH
    }))

    if (!getMissionApiQuery.data) {
      return monitorFishActions
    }

    const monitorEnvActions = getMissionApiQuery.data.envActions.map(action => ({
      ...action,
      source: Mission.MissionSource.MONITORENV
    }))

    return [...monitorEnvActions, ...monitorFishActions].sort((actionA, actionB) => {
      const dateA = getMissionActionDate(actionA)
      const dateB = getMissionActionDate(actionB)

      if (dateA < dateB) {
        return 1
      }

      return -1
    })
  }, [actionsFormValues, getMissionApiQuery.data])

  return (
    <Wrapper>
      <FormHead>
        <h2>Actions réalisées en mission</h2>

        <Dropdown Icon={Icon.Plus} placement="bottomEnd" title="Ajouter">
          {missionTypes.includes(Mission.MissionType.AIR) && (
            <>
              <Dropdown.Item Icon={Icon.Plane} onClick={() => onAdd(MissionAction.MissionActionType.AIR_CONTROL)}>
                Ajouter un contrôle aérien
              </Dropdown.Item>
              <Dropdown.Item
                Icon={Icon.Observation}
                onClick={() => onAdd(MissionAction.MissionActionType.AIR_SURVEILLANCE)}
              >
                Ajouter une surveillance aérienne
              </Dropdown.Item>
            </>
          )}
          {missionTypes.includes(Mission.MissionType.LAND) && (
            <Dropdown.Item Icon={Icon.Anchor} onClick={() => onAdd(MissionAction.MissionActionType.LAND_CONTROL)}>
              Ajouter un contrôle à la débarque
            </Dropdown.Item>
          )}
          {missionTypes.includes(Mission.MissionType.SEA) && (
            <Dropdown.Item Icon={Icon.FleetSegment} onClick={() => onAdd(MissionAction.MissionActionType.SEA_CONTROL)}>
              Ajouter un contrôle en mer
            </Dropdown.Item>
          )}
          <Dropdown.Item Icon={Icon.Note} onClick={() => onAdd(MissionAction.MissionActionType.OBSERVATION)}>
            Ajouter une note libre
          </Dropdown.Item>
        </Dropdown>
      </FormHead>

      <FormBody data-cy="mission-form-action-list">
        <FrontendErrorBoundary>
          {!allSortedMissionActionsWithSource.length && (
            <Placeholder>Aucune action n’est ajoutée pour le moment.</Placeholder>
          )}

          {allSortedMissionActionsWithSource.length > 0 &&
            allSortedMissionActionsWithSource.map((action, index) => {
              if (action.source === Mission.MissionSource.MONITORFISH) {
                return (
                  <MissionActionItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    isSelected={(action as unknown as MissionActionWithSource).index!! === currentIndex}
                    missionAction={action as MissionActionFormValues}
                    onDuplicate={() => onDuplicate((action as unknown as MissionActionWithSource).index!!)}
                    onRemove={() => onRemove((action as unknown as MissionActionWithSource).index!!)}
                    onSelect={() => onSelect((action as unknown as MissionActionWithSource).index!!)}
                  />
                )
              }

              if (action.source === Mission.MissionSource.MONITORENV) {
                return (
                  <MonitorEnvMissionActionItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    missionAction={action as MonitorEnvMissionAction.MissionAction}
                  />
                )
              }

              return null
            })}
        </FrontendErrorBoundary>
      </FormBody>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
  flex-direction: column;
  max-width: 465px;
  width: 34.34%;
  overflow-y: auto;
`

const Placeholder = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  font-style: italic;
  justify-content: center;
`
