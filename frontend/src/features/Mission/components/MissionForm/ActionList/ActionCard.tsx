import { CompletionStatusIcon } from '@features/Mission/components/MissionForm/ActionList/CompletionStatusIcon'
import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getLocalizedDayjs, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { formatDateLabel } from './utils'

import type { MissionActionForTimeline } from '../types'
import type { ReactNode } from 'react'
import type { Promisable } from 'type-fest'

type ActionCardProps = Readonly<{
  children: ReactNode
  isSelected: boolean
  missionAction: MissionActionForTimeline | EnvMissionAction.MissionActionForTimeline
  onSelect?: () => Promisable<void>
}>
export function ActionCard({ children, isSelected, missionAction, onSelect }: ActionCardProps) {
  const startDateAsDayjs = useMemo(
    () => missionAction.actionDatetimeUtc && getLocalizedDayjs(missionAction.actionDatetimeUtc),
    [missionAction]
  )

  return (
    <>
      <Wrapper>
        {startDateAsDayjs && (
          <DateLabel title={missionAction.actionDatetimeUtc}>
            <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
            {missionAction.source === Mission.MissionSource.MONITORFISH && (
              <CompletionStatusIcon missionAction={missionAction as MissionActionForTimeline} />
            )}
          </DateLabel>
        )}

        <InnerWrapper
          $isSelectable={!!onSelect}
          $isSelected={isSelected}
          $type={missionAction.actionType}
          data-cy="action-list-item"
          onClick={onSelect}
        >
          {children}
        </InnerWrapper>
      </Wrapper>
      {missionAction.source === Mission.MissionSource.MONITORENV && <SourceAction>Action CACEM</SourceAction>}
    </>
  )
}

const SourceAction = styled.span`
  margin-left: auto;
  font-style: italic;
  color: ${THEME.color.slateGray};
`

const Wrapper = styled.div`
  align-items: center;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  font-size: 13px;
  /* This padding allows the top 2px outline to be visible in InnerWrapper */
  padding-top: 2px;
  user-select: none;
`

const DateLabel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 65px;
  padding: 4px 16px 4px 0;
`

const InnerWrapper = styled.div<{
  $isSelectable: boolean
  $isSelected: boolean
  $type: MissionAction.MissionActionType | EnvMissionAction.MissionActionType
}>`
  background-color: ${p =>
    ({
      [MissionAction.MissionActionType.AIR_SURVEILLANCE]: p.theme.color.gainsboro,
      [EnvMissionAction.MissionActionType.SURVEILLANCE]: p.theme.color.gainsboro,
      [EnvMissionAction.MissionActionType.NOTE]: p.theme.color.blueYonder25,
      [MissionAction.MissionActionType.OBSERVATION]: p.theme.color.blueYonder25
    })[p.$type] || p.theme.color.white};
  border: solid 1px ${p => (p.$isSelected ? p.theme.color.blueGray : p.theme.color.lightGray)};
  outline: ${p => (p.$isSelected ? `${p.theme.color.blueGray} solid 2px` : 'none')};
  cursor: ${p => (p.$isSelectable ? 'pointer' : 'auto')};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 18px 16px 14px 16px;
`
