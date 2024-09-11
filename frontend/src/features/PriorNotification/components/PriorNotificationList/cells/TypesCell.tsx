import { Ellipsised } from '@components/Ellipsised'
import {
  getPriorNotificationFishingCatchesFromLogbookMessageFishingCatches,
  isPriorNotificationZero
} from '@features/PriorNotification/utils'
import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

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

  const sortedTypeLabels =
    priorNotification.types.length > 0
      ? sortPriorNotificationTypesByPriority(priorNotification.types.map(({ name }) => name)).join(', ')
      : undefined

  return (
    <Wrapper>
      {hasPriorNotificationZeroTag && <Tag borderColor={THEME.color.slateGray}>Préavis 0</Tag>}
      {sortedTypeLabels ? (
        <Ellipsised maxWidth={hasPriorNotificationZeroTag ? 140 : 220}>{sortedTypeLabels}</Ellipsised>
      ) : (
        <None>Aucun type</None>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.span`
  display: inline-flex;

  > .Element-Tag {
    margin-right: 8px;
  }
`
