import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { MonitorEnvMissionAction } from '@features/Mission/monitorEnvMissionAction.types'
import dayjs from 'dayjs'
import styled from 'styled-components'

import type { MissionActionFormValues } from '../types'
import type { MissionActionWithSource } from '@features/Mission/components/MissionForm/ActionList/types'
import type { ReactNode } from 'react'

export function formatDateLabel(dateLabel: string) {
  return dateLabel.replace(
    /([a-z])([a-zéû]+)\.?$/,
    (_, firstMatch, secondMatch) => `${firstMatch.toLocaleUpperCase()}${secondMatch}`
  )
}

export function getActionTitle(
  subject: string | undefined,
  details: string | undefined,
  placeholder: string | undefined
): ReactNode {
  if (details) {
    return (
      <StyledSpan>
        {!!subject && (
          <>
            {subject}
            <br />
          </>
        )}
        <strong>{details}</strong>
      </StyledSpan>
    )
  }

  if (placeholder) {
    return <Placeholder>{`${subject ? `${subject} – ` : ''}${placeholder}`}</Placeholder>
  }

  return subject
}

/**
 * @description
 * - ⚠️ Types are not exact here: `comments` can also be undefined.
 * - ⚠️ When `withPendingInfractions` is true, returned infractions will include infractions without `natinf`.
 */
export function getMissionActionInfractionsFromMissionActionFormValues(
  missionActionFormValues: MissionAction.MissionAction | MissionActionFormValues,
  withPendingInfractions: boolean = false
): Array<MissionAction.Infraction> {
  return [
    ...(missionActionFormValues.gearInfractions ? missionActionFormValues.gearInfractions : []),
    ...(missionActionFormValues.logbookInfractions ? missionActionFormValues.logbookInfractions : []),
    ...(missionActionFormValues.speciesInfractions ? missionActionFormValues.speciesInfractions : []),
    ...(missionActionFormValues.otherInfractions ? missionActionFormValues.otherInfractions : [])
  ].filter(({ natinf }) => withPendingInfractions || Boolean(natinf))
}

export function getMissionActionFormInitialValues(type: MissionAction.MissionActionType): MissionActionFormValues {
  const actionDatetimeUtc = dayjs().startOf('minute').toISOString()

  return {
    actionDatetimeUtc,
    actionType: type,
    isValid: false
  }
}

export function getMissionActionDate(missionAction: MissionActionWithSource) {
  if (missionAction.source === Mission.MissionSource.MONITORFISH) {
    return (missionAction as unknown as MissionAction.MissionAction).actionDatetimeUtc
  }

  if (missionAction.source === Mission.MissionSource.MONITORENV) {
    return (missionAction as MonitorEnvMissionAction.MissionAction).actionStartDateTimeUtc
  }

  throw new Error(`Unknown source: ${missionAction.source}`)
}

const Placeholder = styled.span`
  color: ${p => p.theme.color.slateGray};
`

const StyledSpan = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 188px;
  display: inline-block;
`
