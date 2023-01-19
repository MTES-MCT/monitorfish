import { Accent, Icon, IconButton, Size, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { formatDateLabel } from './utils'
import { MissionType } from '../../../../domain/types/mission'
import { getLocalizedDayjs } from '../../../../utils/getLocalizedDayjs'

import type { Action, PartialAction } from '../types'
import type { Promisable } from 'type-fest'

export type ItemProps = (
  | {
      action: PartialAction
      isNew: true
    }
  | {
      action: Action
      isNew?: false
    }
) & {
  onDelete: () => Promisable<void>
}
export function Item({ action, isNew = false, onDelete }: ItemProps) {
  const [actionLabel, ActionIcon] = useMemo(() => {
    switch (isNew) {
      case true:
        switch (action.type) {
          case MissionType.AIR:
            return ['Contrôle aérien à renseigner', Icon.Plane]

          case MissionType.GROUND:
            return ['Contrôle à la débarque à renseigner', Icon.Plane]

          case MissionType.SEA:
            return ['Contrôle en mer à renseigner', Icon.FleetSegment]

          default:
            return [action.note || 'Note libre à renseigner', Icon.Note]
        }

      default:
        switch (action.type) {
          case MissionType.AIR:
            return ['', Icon.Plane]

          case MissionType.GROUND:
            return ['', Icon.Plane]

          case MissionType.SEA:
            return ['', Icon.Plane]

          default:
            return [action.note, Icon.Note]
        }
    }
  }, [action, isNew])
  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(action.startDate), [action])

  return (
    <Wrapper>
      <DateLabel>
        <b>{formatDateLabel(startDateAsDayjs.format('DD MMM'))}</b> à {startDateAsDayjs.format('HH:mm')}
      </DateLabel>
      <InnerWrapper>
        <ActionLabel>
          <ActionIcon color={THEME.color.charcoal} size={20} />
          {actionLabel}
        </ActionLabel>
        <IconButton accent={Accent.TERTIARY} color={THEME.color.slateGray} Icon={Icon.Duplicate} size={Size.NORMAL} />
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
  padding: 0.25rem 1.5rem 0.25rem 0;
  text-align: center;
`

const InnerWrapper = styled.div`
  border: solid 3px ${p => p.theme.color.blueGray['100']};
  display: flex;
  flex-grow: 1;
  padding: 1rem;
`

const ActionLabel = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  padding: 0.25rem;

  /* The SVG icon is wrapper in a div */
  > div {
    margin-right: 8px;
  }
`
