import { Accent, getLocalizedDayjs, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { formatDateLabel } from './utils'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendError } from '../../../../libs/FrontendError'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type ItemProps = {
  initialValues: MissionActionFormValues
  onDelete: () => Promisable<void>
  onDuplicate: () => Promisable<void>
}
export function Item({ initialValues, onDelete, onDuplicate }: ItemProps) {
  const [actionLabel, ActionIcon] = useMemo(() => {
    switch (initialValues.isDraft) {
      case true:
        switch (initialValues.actionType) {
          case MissionAction.MissionActionType.AIR_CONTROL:
            return ['Contrôle aérien à renseigner', Icon.Plane]

          case MissionAction.MissionActionType.AIR_SURVEILLANCE:
            return ['Surveillance aériennne à renseigner', Icon.Observation]

          case MissionAction.MissionActionType.LAND_CONTROL:
            return ['Contrôle à la débarque à renseigner', Icon.Anchor]

          case MissionAction.MissionActionType.OBSERVATION:
            return [initialValues.otherComments || 'Note libre à renseigner', Icon.Note]

          case MissionAction.MissionActionType.SEA_CONTROL:
            return ['Contrôle en mer à renseigner', Icon.FleetSegment]

          default:
            throw new FrontendError(
              'This should never happen.',
              'features/SideWindow/MissionForm/ActionList/Item.tsx > <Item />'
            )
        }

      case false:
      default:
        switch (initialValues.actionType) {
          case MissionAction.MissionActionType.AIR_CONTROL:
            return [`Contrôle aérien - ${'TODO Vessel Name?'}`, Icon.Plane]

          case MissionAction.MissionActionType.AIR_SURVEILLANCE:
            return [`Surveillance aérienne - ${'TODO Vessel Name?'}`, Icon.Observation]

          case MissionAction.MissionActionType.LAND_CONTROL:
            return [`Contrôle à la débarque - ${'TODO Vessel Name?'}`, Icon.Anchor]

          case MissionAction.MissionActionType.OBSERVATION:
            // TODO Check this prop
            return [initialValues.otherComments, Icon.Note]

          case MissionAction.MissionActionType.SEA_CONTROL:
            return [`Contrôle en mer - ${'TODO Vessel Name?'}`, Icon.FleetSegment]

          default:
            throw new FrontendError(
              'This should never happen.',
              'features/SideWindow/MissionForm/ActionList/Item.tsx > <Item />'
            )
        }
    }
  }, [initialValues])

  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(initialValues.actionDatetimeUtc), [initialValues])

  return (
    <Wrapper>
      <DateLabel>
        <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
      </DateLabel>
      <InnerWrapper>
        <ActionLabel>
          <ActionIcon color={THEME.color.charcoal} size={20} />
          <p>{actionLabel}</p>
        </ActionLabel>
        <IconButton
          accent={Accent.TERTIARY}
          color={THEME.color.slateGray}
          Icon={Icon.Duplicate}
          onClick={onDuplicate}
          size={Size.NORMAL}
        />
        <IconButton
          accent={Accent.TERTIARY}
          color={THEME.color.maximumRed}
          Icon={Icon.Delete}
          onClick={onDelete}
          size={Size.NORMAL}
        />
      </InnerWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  font-size: 13px;
`

const DateLabel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 80px;
  padding: 0.25rem 1.5rem 0.25rem 0;
  text-align: center;
`

const InnerWrapper = styled.div`
  align-items: flex-start;
  border: solid 3px ${p => p.theme.color.blueGray['100']};
  display: flex;
  flex-grow: 1;
  padding: 1rem;
`

const ActionLabel = styled.div`
  display: flex;
  flex-grow: 1;
  padding: 0.25rem;

  /* The SVG icon is wrapper in a div */
  > div {
    margin-right: 8px;
  }

  > p {
    padding-top: 1px;
  }
`
