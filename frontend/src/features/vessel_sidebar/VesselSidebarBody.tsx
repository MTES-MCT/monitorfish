import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { VesselSidebarTab } from '../../domain/entities/vessel'
import { useAppSelector } from '../../hooks/useAppSelector'
import VesselBeaconMalfunctions from './beacon_malfunctions/VesselBeaconMalfunctions'
import VesselControls from './controls/VesselControls'
import VesselFishingActivities from './fishing_activities/VesselFishingActivities'
import VesselIdentity from './identity/VesselIdentity'
import VesselReportings from './reporting/VesselReportings'
import VesselSummary from './VesselSummary'
import AlertWarning from './warnings/AlertWarning'
import BeaconMalfunctionWarning from './warnings/BeaconMalfunctionWarning'

export function VesselSidebarBody() {
  const { healthcheckTextWarning } = useAppSelector(state => state.global)
  const { selectedVessel, vesselSidebarTab } = useAppSelector(state => state.vessel)
  const isAdmin = useAppSelector(state => state.global.isAdmin)

  return (
    <Body healthcheckTextWarning={healthcheckTextWarning}>
      {isAdmin ? <AlertWarning selectedVessel={selectedVessel} /> : null}
      {isAdmin ? <BeaconMalfunctionWarning selectedVessel={selectedVessel} /> : null}
      {vesselSidebarTab === VesselSidebarTab.SUMMARY ? <VesselSummary /> : null}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY ? <VesselIdentity /> : null}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES ? <VesselFishingActivities /> : null}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS ? <VesselControls /> : null}
      {vesselSidebarTab === VesselSidebarTab.REPORTING ? <VesselReportings /> : null}
      {vesselSidebarTab === VesselSidebarTab.ERSVMS ? <VesselBeaconMalfunctions /> : null}
    </Body>
  )
}

const Body = styled.div<{
  healthcheckTextWarning: string | null
}>`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${p => (p.healthcheckTextWarning ? 80 : 82)}vh;
`
