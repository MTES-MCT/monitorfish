import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'

type FooterProps = Readonly<{
  detail: PriorNotification.Detail
  onVerifyAndSend: () => void
}>
export function Footer({ detail, onVerifyAndSend }: FooterProps) {
  const { isInvalidated } = detail.logbookMessage.message
  const isPendingSend =
    !!detail.state &&
    [PriorNotification.State.PENDING_AUTO_SEND, PriorNotification.State.PENDING_SEND].includes(detail.state)
  const isVerifiedAndSent = detail.state === PriorNotification.State.VERIFIED_AND_SENT

  return (
    <Button
      accent={Accent.PRIMARY}
      disabled={isInvalidated || isPendingSend || isVerifiedAndSent}
      Icon={isVerifiedAndSent ? Icon.Check : Icon.Send}
      onClick={onVerifyAndSend}
      title={
        isInvalidated ? "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser." : undefined
      }
    >
      {isVerifiedAndSent ? 'Diffusé' : 'Diffuser'}
    </Button>
  )
}
