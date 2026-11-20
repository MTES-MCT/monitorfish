import { Ellipsised } from '@components/Ellipsised'
import {
  getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches,
  isPriorNotificationZero
} from '@features/PriorNotification/utils'
import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX } from '../constants'
import { None } from '../styles'
import { sortPriorNotificationTypesByPriority } from '../utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type TypesCellProps = Readonly<{
  priorNotification: PriorNotification.PriorNotification
}>
export function TypesCell({ priorNotification }: TypesCellProps) {
  const hasPriorNotificationZeroTag = isPriorNotificationZero(
    getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches(priorNotification.onBoardCatches)
  )

  const durationClassTypeLabels = [
    ...new Set(priorNotification.types.filter(({ isDurationClass }) => isDurationClass).map(({ name }) => name))
  ].sort((a, b) => a.localeCompare(b))
  const regulatoryTypes = priorNotification.types.filter(({ isDurationClass }) => !isDurationClass)

  const sortedTypeLabels =
    regulatoryTypes.length > 0
      ? sortPriorNotificationTypesByPriority(regulatoryTypes.map(({ name }) => name))
          .map(abbreviateDesignatedPorts)
          .join(', ')
      : undefined

  return (
    <Wrapper>
      {hasPriorNotificationZeroTag && <Tag borderColor={THEME.color.slateGray}>Préavis 0</Tag>}
      {durationClassTypeLabels.map(label => (
        <Tag key={label} borderColor={THEME.color.lightGray}>
          {label}
        </Tag>
      ))}
      {sortedTypeLabels ? (
        <Ellipsised maxWidth={getEllipsisedMaxWidth(!!hasPriorNotificationZeroTag, durationClassTypeLabels.length)}>
          {sortedTypeLabels}
        </Ellipsised>
      ) : (
        durationClassTypeLabels.length === 0 && <None>Aucun type</None>
      )}
    </Wrapper>
  )
}

/** Abbreviated in the list only, the full label is kept everywhere else. */
function abbreviateDesignatedPorts(typeName: string) {
  return typeName.startsWith(DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX)
    ? typeName.replace(DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX, 'P. désignés')
    : typeName
}

function getEllipsisedMaxWidth(hasPriorNotificationZeroTag: boolean, durationClassTagCount: number) {
  return Math.max(60, 220 - (hasPriorNotificationZeroTag ? 80 : 0) - durationClassTagCount * 90)
}

const Wrapper = styled.span`
  display: inline-flex;

  > .Element-Tag {
    margin-right: 8px;
  }
`
