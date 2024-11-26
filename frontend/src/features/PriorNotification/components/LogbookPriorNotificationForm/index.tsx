import { useInterval } from '@features/PriorNotification/hooks/useInterval'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { refreshPriorNotification } from '@features/PriorNotification/useCases/refreshPriorNotification'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTracking } from '@hooks/useTracking'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { assertNotNullish } from '@utils/assertNotNullish'

import { Footer } from './Footer'
import { Form } from './Form'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { PriorNotificationCard } from '../PriorNotificationCard'

export function LogbookPriorNotificationForm() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { trackPage } = useTracking()
  const displayedError = useMainAppSelector(
    state => state.displayedError[DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR]
  )
  const editedLogbookPriorNotificationFormValues = useMainAppSelector(
    state => state.priorNotification.editedLogbookPriorNotificationFormValues
  )
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )

  const isBeingSent =
    openedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND ||
    openedPriorNotificationDetail?.state === PriorNotification.State.PENDING_AUTO_SEND

  useInterval(
    () => {
      assertNotNullish(openedPriorNotificationDetail)

      dispatch(
        refreshPriorNotification(
          getPriorNotificationIdentifier(openedPriorNotificationDetail),
          openedPriorNotificationDetail.fingerprint,
          openedPriorNotificationDetail.isManuallyCreated
        )
      )
    },
    isBeingSent,
    1000
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

  trackPage(`/pnos/${openedPriorNotificationDetail.reportId}`)

  return (
    <PriorNotificationCard
      bodyChildren={
        <Form detail={openedPriorNotificationDetail} initialFormValues={editedLogbookPriorNotificationFormValues} />
      }
      detail={openedPriorNotificationDetail}
      footerChildren={
        isSuperUser ? <Footer detail={openedPriorNotificationDetail} onVerifyAndSend={verifyAndSend} /> : null
      }
    />
  )
}
