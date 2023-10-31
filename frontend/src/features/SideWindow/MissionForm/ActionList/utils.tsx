import dayjs from 'dayjs'
import styled from 'styled-components'

import { MissionAction } from '../../../../domain/types/missionAction'

import type { MissionActionFormValues } from '../types'
import type { ReactNode } from 'react'

export function formatDateLabel(dateLabel: string) {
  return dateLabel.replace(
    /([a-z])([a-zéû]+)\.?$/,
    (_, firstMatch, secondMatch) => `${firstMatch.toLocaleUpperCase()}${secondMatch}`
  )
}

export function getActionTitle(itemTitle: string, details: string | undefined, placeholder: string): ReactNode {
  if (!itemTitle) {
    return <StyledSpan>{details}</StyledSpan>
  }

  if (!details) {
    return (
      <Placeholder>
        {itemTitle} {placeholder}
      </Placeholder>
    )
  }

  return (
    <StyledSpan>
      {itemTitle} <br />
      <strong>{details}</strong>
    </StyledSpan>
  )
}

/**
 * @description
 * - ⚠️ Types are not exact here: `comments` can also be undefined.
 * - ⚠️ When `withPendingInfractions` is true, returned infractions will include infractions without `natinf`.
 */
// TODO May need a retyping of all infractions at the `MissionActionFormValues` level.
export function getMissionActionInfractionsFromMissionActionFormValues(
  missionActionFormValues: MissionActionFormValues,
  withPendingInfractions: boolean = false
): Array<
  | MissionAction.GearInfraction
  | MissionAction.LogbookInfraction
  | MissionAction.SpeciesInfraction
  | MissionAction.OtherInfraction
> {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 188px;
  display: inline-block;
`
