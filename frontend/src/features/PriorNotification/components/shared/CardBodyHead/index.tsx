import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { useForceUpdate } from '@hooks/useForceUpdate'
import { LinkButton, type Undefine } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { SentMessageList } from './SentMessageList'
import { TagBar } from './TagBar'

import type { Logbook } from '@features/Logbook/Logbook.types'

type CardBodyHeadProps = Readonly<{
  applicableState: PriorNotification.State | undefined
  detail: PriorNotification.Detail | undefined
  editedPriorNotificationComputedValues?: Undefine<PriorNotification.ManualComputedValues> | undefined
  hasBeenComputed: boolean
  isNewPriorNotification: boolean
  isPriorNotificationZero: boolean | undefined
  isVesselUnderCharter: boolean | undefined
  riskFactor: number | undefined
  tripSegments: Logbook.Segment[] | undefined
  types: PriorNotification.Type[] | undefined
}>
export function CardBodyHead({
  applicableState,
  detail,
  editedPriorNotificationComputedValues,
  hasBeenComputed,
  isNewPriorNotification,
  isPriorNotificationZero,
  isVesselUnderCharter,
  riskFactor,
  tripSegments,
  types
}: CardBodyHeadProps) {
  const [isSentMessageListExpanded, setIsSentMessageListExpanded] = useState(false)
  const { forceUpdate } = useForceUpdate()
  const hasDesignatedPorts = detail?.logbookMessage.message.pnoTypes?.find(type => type.hasDesignatedPorts)
  const isInvalidated = detail?.logbookMessage.message.isInvalidated
  const isPendingVerification = detail?.state === PriorNotification.State.PENDING_VERIFICATION

  const collapseSentMessageList = () => {
    setIsSentMessageListExpanded(false)
  }

  const expandSentMessageList = () => {
    setIsSentMessageListExpanded(true)
    forceUpdate() // We need this force update for the side window to re-render
  }

  return (
    <>
      <TagBar
        hasBeenComputed={hasBeenComputed}
        isInvalidated={isInvalidated}
        isPriorNotificationZero={isPriorNotificationZero}
        isVesselUnderCharter={isVesselUnderCharter}
        riskFactor={riskFactor}
        state={applicableState}
        tripSegments={tripSegments}
        types={types}
      />

      {isNewPriorNotification && !editedPriorNotificationComputedValues && (
        <Intro>
          Veuillez renseigner les champs du formulaire pour définir le type de préavis et son statut, ainsi que le
          segment de flotte et la note de risque du navire.
        </Intro>
      )}
      {!isNewPriorNotification && isPendingVerification && (
        <Intro>Le préavis doit être vérifié par le CNSP avant sa diffusion.</Intro>
      )}
      {(!!editedPriorNotificationComputedValues || !!detail) && (
        <Intro $withTopMargin={!isNewPriorNotification && isPendingVerification}>
          Le navire doit respecter un délai d’envoi{hasDesignatedPorts && ' et débarquer dans un port désigné'}.
        </Intro>
      )}

      {!isSentMessageListExpanded && !!detail && (
        <StyledLinkButton onClick={expandSentMessageList}>Voir les détails de la diffusion du préavis</StyledLinkButton>
      )}
      {isSentMessageListExpanded && !!detail && (
        <>
          <SentMessageList detail={detail} state={applicableState} />

          <StyledLinkButton onClick={collapseSentMessageList}>
            Masquer les détails de la diffusion du préavis
          </StyledLinkButton>
        </>
      )}
    </>
  )
}

const Intro = styled.p<{
  $withTopMargin?: boolean
}>`
  ${p => p.$withTopMargin && 'margin-top: 2px;'}
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`

const StyledLinkButton = styled(LinkButton)`
  margin-top: 16px;
`
