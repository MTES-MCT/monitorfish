import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import styled from 'styled-components'

import { TagBar } from './TagBar'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { Undefine } from '@mtes-mct/monitor-ui'

type CardBodyHeadProps = Readonly<{
  detail: PriorNotification.Detail | undefined
  editedPriorNotificationComputedValues?: Undefine<PriorNotification.ManualComputedValues> | undefined
  hasBeenComputed: boolean
  isNewPriorNotification: boolean
  isPriorNotificationZero: boolean | undefined
  isVesselUnderCharter: boolean | undefined
  riskFactor: number | undefined
  state: PriorNotification.State | undefined
  tripSegments: LogbookMessage.Segment[] | undefined
  types: PriorNotification.Type[] | undefined
}>
export function CardBodyHead({
  detail,
  editedPriorNotificationComputedValues,
  hasBeenComputed,
  isNewPriorNotification,
  isPriorNotificationZero,
  isVesselUnderCharter,
  riskFactor,
  state,
  tripSegments,
  types
}: CardBodyHeadProps) {
  const hasDesignatedPorts = detail?.logbookMessage.message.pnoTypes?.find(type => type.hasDesignatedPorts)
  const isInvalidated = detail?.logbookMessage.message.isInvalidated
  const isPendingVerification = detail?.state === PriorNotification.State.PENDING_VERIFICATION

  return (
    <>
      <TagBar
        hasBeenComputed={hasBeenComputed}
        isInvalidated={isInvalidated}
        isPriorNotificationZero={isPriorNotificationZero}
        isVesselUnderCharter={isVesselUnderCharter}
        riskFactor={riskFactor}
        state={state}
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
