import { SideWindowCard } from '@components/SideWindowCard'
import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import styled from 'styled-components'

import { priorNotificationActions } from '../slice'
import { Header } from './ManualPriorNotificationForm/Header'

export function ReportingList() {
  const dispatch = useMainAppDispatch()
  const openedPriorNotificationDetail = useMainAppSelector(
    store => store.priorNotification.openedPriorNotificationDetail
  )
  const isSuperUser = useIsSuperUser()

  const vesselId = openedPriorNotificationDetail?.vesselId
  const vesselIdentity = openedPriorNotificationDetail?.vesselIdentity

  const close = () => {
    dispatch(priorNotificationActions.setIsReportingListOpened(false))
  }

  return (
    <StyledCard $isSuperUser={isSuperUser} onBackgroundClick={close}>
      <Header detail={openedPriorNotificationDetail} onClose={close} vesselId={vesselId} />

      <VesselReportingList vesselIdentity={vesselIdentity} withOpenedNewReportingForm />
    </StyledCard>
  )
}

const StyledCard = styled(SideWindowCard)<{
  $isSuperUser: boolean
}>`
  left: ${p => (p.$isSuperUser ? '70px' : 0)};
  z-index: 1001;
`
