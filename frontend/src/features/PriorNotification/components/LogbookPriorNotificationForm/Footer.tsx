import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { useFormikContext } from 'formik'

import { getSendButtonTitle } from '../shared/utils'

type FooterProps = Readonly<{
  detail: PriorNotification.Detail
  onVerifyAndSend: () => void
}>
export function Footer({ detail, onVerifyAndSend }: FooterProps) {
  const { submitForm } = useFormikContext<PriorNotification.LogbookForm>()

  const isPriorNotificationFormDirty = useMainAppSelector(store => store.priorNotification.isPriorNotificationFormDirty)
  const isSuperUser = useIsSuperUser()

  const isBeingSent = !!detail.logbookMessage.message.isBeingSent
  const isInvalidated = !!detail.logbookMessage.message.isInvalidated
  const isPendingSend =
    !!detail.state &&
    [PriorNotification.State.PENDING_AUTO_SEND, PriorNotification.State.PENDING_SEND].includes(detail.state)
  const isVerifiedAndSent = detail.state === PriorNotification.State.VERIFIED_AND_SENT
  const isReadOnly = !isSuperUser || isBeingSent || isInvalidated

  return (
    <>
      <Button
        accent={Accent.PRIMARY}
        disabled={isReadOnly || !isPriorNotificationFormDirty}
        onClick={submitForm}
        title={
          isInvalidated
            ? "Le préavis est invalidé, il n'est plus possible de le modifier ni de le diffuser."
            : undefined
        }
      >
        Enregistrer
      </Button>

      <Button
        accent={Accent.PRIMARY}
        disabled={!!isInvalidated || isPendingSend || isVerifiedAndSent || isPriorNotificationFormDirty}
        Icon={isVerifiedAndSent ? Icon.Check : Icon.Send}
        onClick={onVerifyAndSend}
        title={getSendButtonTitle({ isInvalidated, isPriorNotificationFormDirty })}
      >
        {isVerifiedAndSent ? 'Diffusé' : 'Diffuser'}
      </Button>
    </>
  )
}
