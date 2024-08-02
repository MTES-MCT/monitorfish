import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { Footer } from './Footer'
import { Form } from './Form'
import { PriorNotificationCard } from '../PriorNotificationCard'

export function AutoPriorNotificationForm() {
  const editedAutoPriorNotificationInitialFormValues = useMainAppSelector(
    state => state.priorNotification.editedAutoPriorNotificationInitialFormValues
  )
  const openedPriorNotificationDetail = useMainAppSelector(
    state => state.priorNotification.openedPriorNotificationDetail
  )

  if (!editedAutoPriorNotificationInitialFormValues || !openedPriorNotificationDetail) {
    return <PriorNotificationCard detail={undefined} isLoading />
  }

  return (
    <PriorNotificationCard
      bodyChildren={
        <Form detail={openedPriorNotificationDetail} initialFormValues={editedAutoPriorNotificationInitialFormValues} />
      }
      detail={openedPriorNotificationDetail}
      footerChildren={<Footer detail={openedPriorNotificationDetail} />}
    />
  )
}
