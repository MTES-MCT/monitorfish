import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'
import { useAppSelector } from '../../hooks/useAppSelector'
import { VesselBeaconMalfunctions } from './beacon_malfunctions/VesselBeaconMalfunctions'
import { VesselControls } from './controls/VesselControls'
import { VesselFishingActivities } from './fishing_activities/VesselFishingActivities'
import VesselIdentity from './identity/VesselIdentity'
import VesselReportings from './reporting/VesselReportings'
import VesselSummary from './VesselSummary'
import { AlertWarning } from './warnings/AlertWarning'
import BeaconMalfunctionWarning from './warnings/BeaconMalfunctionWarning'

export function VesselSidebarBody() {
  const { healthcheckTextWarning } = useAppSelector(state => state.global)
  const { selectedVessel, vesselSidebarTab } = useAppSelector(state => state.vessel)
  const isAdmin = useAppSelector(state => state.global.isAdmin)

  return (
    <Body healthcheckTextWarning={healthcheckTextWarning}>
      {isAdmin && <AlertWarning selectedVessel={selectedVessel} />}
      {isAdmin && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {vesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY && <VesselIdentity />}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselFishingActivities />}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS && <VesselControls />}
      {vesselSidebarTab === VesselSidebarTab.REPORTING && <VesselReportings />}
      {vesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselBeaconMalfunctions />}
    </Body>
  )
}

const Body = styled.div<{
  healthcheckTextWarning?: string
}>`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${p => (p.healthcheckTextWarning ? 80 : 82)}vh;
`
