import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { assertNotNullish } from '@utils/assertNotNullish'

import { Footer } from './Footer'
import { Form } from './Form'
import { PriorNotificationCard } from '../PriorNotificationCard'

export function LogbookPriorNotificationForm() {
  const dispatch = useMainAppDispatch()
  const displayedError = useMainAppSelector(
    state => state.displayedError[DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR]
  )
  const editedLogbookPriorNotificationFormValues = useMainAppSelector(
    state => state.priorNotification.editedLogbookPriorNotificationFormValues
  )
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )

  const displayedErrorKey = displayedError ? DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR : undefined

  const verifyAndSend = async () => {
    assertNotNullish(openedPriorNotificationDetail)
    const identifier = getPriorNotificationIdentifier(openedPriorNotificationDetail)
    assertNotNullish(identifier)

    await dispatch(verifyAndSendPriorNotification(identifier, false))
  }

  if (displayedErrorKey) {
    return <PriorNotificationCard detail={undefined} otherDisplayedErrorKey={displayedErrorKey} />
  }

  if (!editedLogbookPriorNotificationFormValues || !openedPriorNotificationDetail) {
    return <PriorNotificationCard detail={undefined} isLoading />
  }

  return (
    <PriorNotificationCard
      bodyChildren={
        <Form detail={openedPriorNotificationDetail} initialFormValues={editedLogbookPriorNotificationFormValues} />
      }
      detail={openedPriorNotificationDetail}
      footerChildren={<Footer detail={openedPriorNotificationDetail} onVerifyAndSend={verifyAndSend} />}
    />
  )
}
