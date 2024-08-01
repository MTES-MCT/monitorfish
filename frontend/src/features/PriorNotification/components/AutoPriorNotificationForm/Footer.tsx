import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

type FooterProps = Readonly<{
  detail: PriorNotification.PriorNotificationDetail
}>
export function Footer({ detail }: FooterProps) {
  const dispatch = useMainAppDispatch()

  const { isInvalidated } = detail.logbookMessage.message
  const isPendingSend =
    !!detail.state &&
    [PriorNotification.State.AUTO_SEND_IN_PROGRESS, PriorNotification.State.PENDING_SEND].includes(detail.state)
  const isVerifiedAndSent = detail.state === PriorNotification.State.VERIFIED_AND_SENT

  const verifyAndSend = async () => {
    const identifier = getPriorNotificationIdentifier(detail)
    assertNotNullish(identifier)

    await dispatch(verifyAndSendPriorNotification(identifier, detail.fingerprint, false))
  }

  return (
    <Button
      accent={Accent.PRIMARY}
      disabled={isInvalidated || isPendingSend || isVerifiedAndSent}
      Icon={isVerifiedAndSent ? Icon.Check : Icon.Send}
      onClick={verifyAndSend}
      title={
        isInvalidated ? "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser." : undefined
      }
    >
      {isVerifiedAndSent ? 'Diffusé' : 'Diffuser'}
    </Button>
  )
}
