import styled from 'styled-components'

import { getCreationLabel, getLasUpdateLabel } from './utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

type EditHistoryProps = Readonly<{
  priorNotificationDetail: PriorNotification.Detail
}>
export function EditHistory({ priorNotificationDetail }: EditHistoryProps) {
  const creationLabel = getCreationLabel(priorNotificationDetail)
  const lastUpdateLabel = getLasUpdateLabel(priorNotificationDetail)

  return (
    <Box>
      <span title={priorNotificationDetail.createdAt}>{creationLabel}</span>
      {lastUpdateLabel && (
        <>
          <br />
          <span title={priorNotificationDetail.updatedAt}>{lastUpdateLabel}</span>
        </>
      )}
    </Box>
  )
}

const Box = styled.p`
  color: #FF3392;
  font-style: italic;
`
