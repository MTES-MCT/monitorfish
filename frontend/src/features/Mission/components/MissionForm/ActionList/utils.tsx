import { Flag } from '@features/commonComponents/Flag'
import { getFlatInfractionFromThreatsHierarchy } from '@features/Mission/components/MissionForm/ActionForm/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import dayjs from 'dayjs'
import styled from 'styled-components'

import type { MissionActionFormValues } from '../types'
import type { Option, UndefineExcept } from '@mtes-mct/monitor-ui'
import type { ReactNode } from 'react'

import CompletionStatus = MissionAction.CompletionStatus

const baseUrl = window.location.origin

export function formatDateLabel(dateLabel: string) {
  return dateLabel.replace(
    /([a-z])([a-zéû]+)\.?$/,
    (_, firstMatch, secondMatch) => `${firstMatch.toLocaleUpperCase()}${secondMatch}`
  )
}

export function getActionTitle(
  subject: string | undefined,
  flagState: string | undefined,
  isUnknown: boolean | undefined,
  details: string | undefined,
  placeholder: string | undefined
): ReactNode {
  if (details) {
    return (
      <StyledSpan title={details}>
        {!!subject && <>{subject}</>}
        <Strong>
          {flagState && <StyledFlag src={`${baseUrl}/flags/${flagState.toLowerCase()}.svg`} />}
          {isUnknown && <i>{details}</i>}
          {!isUnknown && details}
        </Strong>
      </StyledSpan>
    )
  }

  if (placeholder) {
    return <Placeholder>{`${subject ? `${subject} – ` : ''}${placeholder}`}</Placeholder>
  }

  return subject
}

const StyledFlag = styled(Flag)`
  height: 14px;
  margin-top: 0;
  margin-left: 0;
  margin-right: 4px;
`

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
  natinfsAsOptions: Option<number>[],
  missionActionFormValues: MissionAction.MissionAction | MissionActionFormValues,
  withPendingInfractions: boolean = false
): Array<UndefineExcept<MissionAction.Infraction, 'comments' | 'infractionType'>> {
  return (missionActionFormValues.infractions ? missionActionFormValues.infractions : [])
    .map(infraction => getFlatInfractionFromThreatsHierarchy(natinfsAsOptions, infraction))
    .filter(({ natinf }) => withPendingInfractions || Boolean(natinf))
}

export function getMissionActionFormInitialValues(type: MissionAction.MissionActionType): MissionActionFormValues {
  const actionDatetimeUtc = dayjs().startOf('minute').toISOString()

  return {
    actionDatetimeUtc,
    actionType: type,
    completion: CompletionStatus.TO_COMPLETE,
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
