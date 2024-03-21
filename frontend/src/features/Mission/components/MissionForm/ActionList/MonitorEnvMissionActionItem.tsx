import { MonitorEnvMissionAction } from '@features/Mission/monitorEnvMissionAction.types'
import { getLocalizedDayjs, Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { formatDateLabel, getActionTitle } from './utils'

type MonitorEnvMissionActionProps = Readonly<{
  missionAction: MonitorEnvMissionAction.MissionAction
}>
export function MonitorEnvMissionActionItem({ missionAction }: MonitorEnvMissionActionProps) {
  const [actionLabel, ActionIcon] = useMemo(() => {
    switch (missionAction.actionType) {
      case MonitorEnvMissionAction.MissionActionType.CONTROL:
        return [
          getActionTitle(
            MonitorEnvMissionAction.MISSION_ACTION_TYPE_LABEL[MonitorEnvMissionAction.MissionActionType.CONTROL],
            undefined,
            ''
          ),
          Icon.ControlUnit
        ]

      case MonitorEnvMissionAction.MissionActionType.NOTE:
        return [
          getActionTitle(
            MonitorEnvMissionAction.MISSION_ACTION_TYPE_LABEL[MonitorEnvMissionAction.MissionActionType.NOTE],
            undefined,
            ''
          ),
          Icon.Note
        ]

      case MonitorEnvMissionAction.MissionActionType.SURVEILLANCE:
        return [
          getActionTitle(
            MonitorEnvMissionAction.MISSION_ACTION_TYPE_LABEL[MonitorEnvMissionAction.MissionActionType.SURVEILLANCE],
            undefined,
            ''
          ),
          Icon.Observation
        ]

      default:
        return [getActionTitle(undefined, undefined, ''), Icon.Plane]
    }
  }, [missionAction])

  const startDateAsDayjs = useMemo(
    () => missionAction.actionStartDateTimeUtc && getLocalizedDayjs(missionAction.actionStartDateTimeUtc),
    [missionAction]
  )

  return (
    <>
      <Wrapper>
        {startDateAsDayjs && (
          <DateLabel title={missionAction.actionStartDateTimeUtc}>
            <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
          </DateLabel>
        )}

        <InnerWrapper $type={missionAction.actionType} data-cy="action-list-item">
          <Head>
            <ActionLabel>
              <ActionIcon color={THEME.color.charcoal} size={20} />
              <p>{actionLabel}</p>
            </ActionLabel>
          </Head>
        </InnerWrapper>
      </Wrapper>
      <SourceAction>Action CACEM</SourceAction>
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
  $type: MonitorEnvMissionAction.MissionActionType
}>`
  background-color: ${p =>
    ({
      [MonitorEnvMissionAction.MissionActionType.SURVEILLANCE]: p.theme.color.gainsboro,
      [MonitorEnvMissionAction.MissionActionType.NOTE]: p.theme.color.blueYonder25
    })[p.$type] || p.theme.color.white};
  border: solid 1px ${p => p.theme.color.lightGray};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 18px 16px 14px 16px;
`

const ActionLabel = styled.div`
  display: flex;
  flex-grow: 1;

  > .Element-IconBox {
    margin-right: 8px;
  }

  > p {
    margin-top: 0px;
    color: ${p => p.theme.color.gunMetal};
    padding: 1px 0px 0 0;
    height: 26px;
    font-weight: 500;
  }
`

const Head = styled.div`
  align-items: flex-start;
  display: flex;

  /* TODO Remove the padding if iconSize is set in monitor-ui. */
  > button {
    padding: 0;
  }
`
