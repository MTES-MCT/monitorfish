import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ActionLabel, Head } from './styles'
import { getActionTitle } from './utils'

type EnvActionCardProps = Readonly<{
  missionAction: EnvMissionAction.MissionAction
}>
export function EnvActionCard({ missionAction }: EnvActionCardProps) {
  const [actionLabel, ActionIcon] = useMemo(() => {
    switch (missionAction.actionType) {
      case EnvMissionAction.MissionActionType.CONTROL:
        return [
          getActionTitle(
            EnvMissionAction.MISSION_ACTION_TYPE_LABEL[EnvMissionAction.MissionActionType.CONTROL],
            undefined,
            ''
          ),
          Icon.ControlUnit
        ]

      case EnvMissionAction.MissionActionType.NOTE:
        return [
          getActionTitle(
            EnvMissionAction.MISSION_ACTION_TYPE_LABEL[EnvMissionAction.MissionActionType.NOTE],
            missionAction.observations,
            ''
          ),
          Icon.Note
        ]

      case EnvMissionAction.MissionActionType.SURVEILLANCE:
        return [
          getActionTitle(
            EnvMissionAction.MISSION_ACTION_TYPE_LABEL[EnvMissionAction.MissionActionType.SURVEILLANCE],
            undefined,
            ''
          ),
          Icon.Observation
        ]

      default:
        return [getActionTitle(undefined, undefined, ''), Icon.Plane]
    }
  }, [missionAction])

  return (
    <Head>
      <ActionLabel>
        <ActionIcon color={THEME.color.charcoal} size={20} />
        <Label>{actionLabel}</Label>
      </ActionLabel>
    </Head>
  )
}

const Label = styled.p`
  font-weight: 500;
`
