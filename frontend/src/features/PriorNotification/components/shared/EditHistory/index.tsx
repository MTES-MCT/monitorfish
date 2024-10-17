import styled from 'styled-components'

import { getCreationLabel, getLasUpdateLabel } from './utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type EditHistoryProps = Readonly<{
  priorNotificationDetail: PriorNotification.Detail
}>
export function EditHistory({ priorNotificationDetail }: EditHistoryProps) {
  return (
    <Box>
      <span title={priorNotificationDetail.createdAt}>{getCreationLabel(priorNotificationDetail)}</span>
      <br />
      <span title={priorNotificationDetail.updatedAt}>{getLasUpdateLabel(priorNotificationDetail)}</span>
    </Box>
  )
}

const Box = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`
