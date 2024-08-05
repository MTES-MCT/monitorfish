import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useState } from 'react'

import { Footer } from './Footer'
import { Form } from './Form'
import { PriorNotificationCard } from '../PriorNotificationCard'

export function AutoPriorNotificationForm() {
  const dispatch = useMainAppDispatch()
  const editedAutoPriorNotificationInitialFormValues = useMainAppSelector(
    state => state.priorNotification.editedAutoPriorNotificationInitialFormValues
  )
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )

  const [isLoading, setIsLoading] = useState(false)

  const verifyAndSend = async () => {
    setIsLoading(true)

    assertNotNullish(openedPriorNotificationDetail)
    const identifier = getPriorNotificationIdentifier(openedPriorNotificationDetail)
    assertNotNullish(identifier)

    await dispatch(verifyAndSendPriorNotification(identifier, false))
  }

  if (!editedAutoPriorNotificationInitialFormValues || !openedPriorNotificationDetail || isLoading) {
    return <PriorNotificationCard detail={undefined} isLoading />
  }

  return (
    <PriorNotificationCard
      bodyChildren={
        <Form detail={openedPriorNotificationDetail} initialFormValues={editedAutoPriorNotificationInitialFormValues} />
      }
      detail={openedPriorNotificationDetail}
      footerChildren={<Footer detail={openedPriorNotificationDetail} onVerifyAndSend={verifyAndSend} />}
    />
  )
}
