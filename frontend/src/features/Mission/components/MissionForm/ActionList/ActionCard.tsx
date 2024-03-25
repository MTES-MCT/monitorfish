import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FieldError, getLocalizedDayjs, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled, { css } from 'styled-components'

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
  const draft = useMainAppSelector(state => state.missionForm.draft)

  const isControlAction =
    missionAction.source === Mission.MissionSource.MONITORFISH &&
    (missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
      missionAction.actionType === MissionAction.MissionActionType.LAND_CONTROL ||
      missionAction.actionType === MissionAction.MissionActionType.SEA_CONTROL)

  const startDateAsDayjs = useMemo(
    () => missionAction.actionDatetimeUtc && getLocalizedDayjs(missionAction.actionDatetimeUtc),
    [missionAction]
  )

  const isOpen =
    isControlAction &&
    draft?.mainFormValues &&
    !draft?.mainFormValues.isClosed &&
    !(missionAction as MissionActionForTimeline).closedBy

  return (
    <>
      <Wrapper>
        {startDateAsDayjs && (
          <DateLabel title={missionAction.actionDatetimeUtc}>
            <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
          </DateLabel>
        )}

        <InnerWrapper
          $isOpen={isOpen}
          $isSelectable={!!onSelect}
          $isSelected={isSelected}
          $type={missionAction.actionType}
          data-cy="action-list-item"
          onClick={onSelect}
          title={isOpen ? 'Contrôle en cours' : undefined}
        >
          {children}
        </InnerWrapper>
      </Wrapper>
      {missionAction.source === Mission.MissionSource.MONITORENV && <SourceAction>Action CACEM</SourceAction>}

      {missionAction.source === Mission.MissionSource.MONITORFISH &&
        !(missionAction as MissionActionForTimeline).isValid && (
          <StyledFieldError>Veuillez compléter les champs manquants dans cette action de contrôle.</StyledFieldError>
        )}
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
  $isOpen: boolean | undefined
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

  ${p =>
    p.$isOpen &&
    css`
      border-left: solid 5px ${p.theme.color.blueGray};
      padding-left: 12px;
    `}
`

const StyledFieldError = styled(FieldError)`
  padding-left: 70px;
`
