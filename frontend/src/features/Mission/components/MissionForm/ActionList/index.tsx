import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { ActionCard } from '@features/Mission/components/MissionForm/ActionList/ActionCard'
import { EnvActionCard } from '@features/Mission/components/MissionForm/ActionList/EnvActionCard'
import { FormHead } from '@features/Mission/components/MissionForm/shared/FormHead'
import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useGetMissionQuery } from '@features/Mission/monitorfishMissionApi'
import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { FishActionCard } from './FishActionCard'
import { FormBody } from '../shared/FormBody'

import type { MissionActionFormValues, MissionActionForTimeline } from '../types'
import type { Promisable } from 'type-fest'

type ActionListProps = Readonly<{
  actionsFormValues: MissionActionFormValues[]
  currentIndex: number | undefined
  missionId: number | undefined
  missionTypes: Mission.MissionType[] | undefined
  onAdd: (actionType: MissionAction.MissionActionType) => Promisable<void>
  onRemove: (actionIndex: number) => Promisable<void>
  onSelect: (actionIndex: number) => Promisable<void>
}>
export function ActionList({
  actionsFormValues,
  currentIndex,
  missionId,
  missionTypes = [],
  onAdd,
  onRemove,
  onSelect
}: ActionListProps) {
  const getMissionApiQuery = useGetMissionQuery(missionId ?? skipToken)

  const allSortedMissionActionsForTimeline: Array<
    MissionActionForTimeline | EnvMissionAction.MissionActionForTimeline
  > = useMemo(() => {
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
      actionDatetimeUtc: action.actionStartDateTimeUtc,
      source: Mission.MissionSource.MONITORENV
    }))

    return [...monitorEnvActions, ...monitorFishActions].sort((actionA, actionB) => {
      const dateA = actionA.actionDatetimeUtc
      const dateB = actionB.actionDatetimeUtc

      if (!dateA || !dateB) {
        return 1
      }

      if (dateA < dateB) {
        return 1
      }

      return -1
    })
  }, [actionsFormValues, getMissionApiQuery.data])

  const actionTimelineRef = useRef<HTMLDivElement>(null)
  const actionTimelineHeight = Number(actionTimelineRef.current?.clientHeight) - 40 || undefined

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
          <Timeline ref={actionTimelineRef}>
            {!allSortedMissionActionsForTimeline.length && (
              <Placeholder>Aucune action n’est ajoutée pour le moment.</Placeholder>
            )}

            {allSortedMissionActionsForTimeline.length > 1 && <VerticalLine $height={actionTimelineHeight} />}
            {allSortedMissionActionsForTimeline.length > 0 &&
              allSortedMissionActionsForTimeline.map((action, index) => {
                if (action.source === Mission.MissionSource.MONITORFISH) {
                  return (
                    <ActionCard
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      isSelected={action.index === currentIndex}
                      missionAction={action}
                      onSelect={() => onSelect(action.index!!)}
                    >
                      <FishActionCard
                        missionAction={action as MissionActionFormValues}
                        onRemove={() => onRemove(action.index!!)}
                      />
                    </ActionCard>
                  )
                }

                if (action.source === Mission.MissionSource.MONITORENV) {
                  return (
                    <ActionCard
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      isSelected={false}
                      missionAction={action}
                    >
                      <EnvActionCard missionAction={action as EnvMissionAction.MissionAction} />
                    </ActionCard>
                  )
                }

                return null
              })}
          </Timeline>
        </FrontendErrorBoundary>
      </FormBody>
    </Wrapper>
  )
}

const Timeline = styled.div`
  position: relative;

  > div:not(:nth-of-type(2)),
  > fieldset:not(:first-child) {
    margin-top: 16px;
  }
`

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

const VerticalLine = styled.div<{ $height?: number | undefined }>`
  border-left: 1px solid ${p => p.theme.color.slateGray};
  height: ${p => p.$height ?? '0'};
  left: 21px;
  margin-top: 16px;
  position: absolute;
  width: 1px;
`
