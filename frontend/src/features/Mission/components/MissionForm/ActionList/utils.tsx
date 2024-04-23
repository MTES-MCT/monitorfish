import { MissionAction } from '@features/Mission/missionAction.types'
import dayjs from 'dayjs'
import styled from 'styled-components'

import type { MissionActionFormValues } from '../types'
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
      <StyledSpan title={details}>
        {!!subject && <>{subject}</>}
        <Strong>{details}</Strong>
      </StyledSpan>
    )
  }

  if (placeholder) {
    return <Placeholder>{`${subject ? `${subject} – ` : ''}${placeholder}`}</Placeholder>
  }

  return subject
}

const Strong = styled.div`
  display: block;
  font-weight: 700;
  margin-top: 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

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

const Placeholder = styled.span`
  color: ${p => p.theme.color.slateGray};
`

const StyledSpan = styled.span`
  max-width: 210px;
  display: inline-block;
`
