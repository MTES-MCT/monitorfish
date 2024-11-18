import { ConfirmationModal } from '@components/ConfirmationModal'
import { useInterval } from '@features/PriorNotification/hooks/useInterval'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { priorNotificationActions } from '@features/PriorNotification/slice'
import { refreshPriorNotification } from '@features/PriorNotification/useCases/refreshPriorNotification'
import { updateLogbookPriorNotification } from '@features/PriorNotification/useCases/updateLogbookPriorNotification'
import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTracking } from '@hooks/useTracking'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { assertNotNullish } from '@utils/assertNotNullish'
import { Formik } from 'formik'
import { useCallback, useMemo, useState } from 'react'

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
  const isPriorNotificationFormDirty = useMainAppSelector(state => state.priorNotification.isPriorNotificationFormDirty)
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )

  const [isCancellationConfirmationModalOpen, setIsCancellationConfirmationModalOpen] = useState(false)

  const priorNotificationIdentifier = useMemo(
    () => getPriorNotificationIdentifier(openedPriorNotificationDetail),
    [openedPriorNotificationDetail]
  )

  const displayedErrorKey = displayedError ? DisplayedErrorKey.SIDE_WINDOW_PRIOR_NOTIFICATION_FORM_ERROR : undefined
  const isBeingSent =
    openedPriorNotificationDetail?.state === PriorNotification.State.PENDING_SEND ||
    openedPriorNotificationDetail?.state === PriorNotification.State.PENDING_AUTO_SEND

  const close = () => {
    dispatch(priorNotificationActions.closePriorNotificationCardAndForm())
  }

  const closeCancellationConfirmationModal = () => {
    setIsCancellationConfirmationModalOpen(false)
  }

  const handleClose = () => {
    if (isPriorNotificationFormDirty) {
      setIsCancellationConfirmationModalOpen(true)

      return
    }

    close()
  }

  const submit = useCallback(
    async (nextValues: PriorNotification.LogbookForm) => {
      if (!priorNotificationIdentifier) {
        return
      }

      await dispatch(updateLogbookPriorNotification(priorNotificationIdentifier, nextValues))
    },
    [dispatch, priorNotificationIdentifier]
  )

  const verifyAndSend = async () => {
    assertNotNullish(openedPriorNotificationDetail)
    const identifier = getPriorNotificationIdentifier(openedPriorNotificationDetail)
    assertNotNullish(identifier)

    await dispatch(verifyAndSendPriorNotification(identifier, false))
  }

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

  if (displayedErrorKey) {
    return <PriorNotificationCard detail={undefined} otherDisplayedErrorKey={displayedErrorKey} />
  }

  if (!editedLogbookPriorNotificationFormValues || !openedPriorNotificationDetail) {
    return <PriorNotificationCard detail={undefined} isLoading />
  }

  trackPage(`/pnos/${openedPriorNotificationDetail.reportId}`)

  return (
    <>
      <Formik initialValues={editedLogbookPriorNotificationFormValues} onSubmit={submit}>
        <PriorNotificationCard
          bodyChildren={
            <Form detail={openedPriorNotificationDetail} initialFormValues={editedLogbookPriorNotificationFormValues} />
          }
          detail={openedPriorNotificationDetail}
          footerChildren={
            isSuperUser ? <Footer detail={openedPriorNotificationDetail} onVerifyAndSend={verifyAndSend} /> : null
          }
          onClose={handleClose}
        />
      </Formik>

      {isCancellationConfirmationModalOpen && (
        <ConfirmationModal
          confirmationButtonLabel="Quitter sans enregistrer"
          message="Vous êtes en train d’abandonner l’édition d’un préavis."
          onCancel={closeCancellationConfirmationModal}
          onConfirm={close}
          title="Abandon de préavis"
        />
      )}
    </>
  )
}
