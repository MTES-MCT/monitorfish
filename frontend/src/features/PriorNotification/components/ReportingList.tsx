import { SideWindowCard } from '@components/SideWindowCard'
import { VesselReportingList } from '@features/Reporting/components/VesselReportingList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, LinkButton } from '@mtes-mct/monitor-ui'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import styled from 'styled-components'

import { priorNotificationActions } from '../slice'
import { CardHeader } from './shared/CardHeader'

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
      <CardHeader detail={openedPriorNotificationDetail} onClose={close} vesselId={vesselId}>
        <StyledLinkButton Icon={Icon.Chevron} onClick={close}>
          Retourner au préavis
        </StyledLinkButton>
      </CardHeader>

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

const StyledLinkButton = styled(LinkButton)`
  font-size: 13px;
  margin-top: 8px;

  > .Element-IconBox {
    rotate: 90deg;
  }
`