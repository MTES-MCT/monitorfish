import { SideWindowCard } from '@components/SideWindowCard'
import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { getVesselIdentityFromVessel } from '@features/Vessel/utils'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { skipToken } from '@reduxjs/toolkit/query'
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
  const { data: vessel } = useGetVesselQuery(vesselId ?? skipToken)
  const vesselIdentity = vessel ? getVesselIdentityFromVessel(vessel) : undefined

  const close = () => {
    dispatch(priorNotificationActions.setIsReportingListOpened(false))
  }

  return (
    <StyledCard $isSuperUser={isSuperUser}>
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
