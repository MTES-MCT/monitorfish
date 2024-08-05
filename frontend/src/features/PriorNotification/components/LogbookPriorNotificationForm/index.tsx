import { verifyAndSendPriorNotification } from '@features/PriorNotification/useCases/verifyAndSendPriorNotification'
import { getPriorNotificationIdentifier } from '@features/PriorNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useState } from 'react'

import { Footer } from './Footer'
import { Form } from './Form'
import { PriorNotificationCard } from '../PriorNotificationCard'

export function LogbookPriorNotificationForm() {
  const dispatch = useMainAppDispatch()
  const editedLogbookPriorNotificationInitialFormValues = useMainAppSelector(
    state => state.priorNotification.editedLogbookPriorNotificationInitialFormValues
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

  if (!editedLogbookPriorNotificationInitialFormValues || !openedPriorNotificationDetail || isLoading) {
    return <PriorNotificationCard detail={undefined} isLoading />
  }

  return (
    <PriorNotificationCard
      bodyChildren={
        <Form
          detail={openedPriorNotificationDetail}
          initialFormValues={editedLogbookPriorNotificationInitialFormValues}
        />
      }
      detail={openedPriorNotificationDetail}
      footerChildren={<Footer detail={openedPriorNotificationDetail} onVerifyAndSend={verifyAndSend} />}
    />
  )
}
