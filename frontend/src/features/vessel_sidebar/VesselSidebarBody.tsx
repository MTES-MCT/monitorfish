import styled from 'styled-components'

import { VesselBeaconMalfunctions } from './beacon_malfunctions/VesselBeaconMalfunctions'
import { Controls } from './Controls'
import { VesselFishingActivities } from './fishing_activities/VesselFishingActivities'
import VesselIdentity from './identity/VesselIdentity'
import VesselReportings from './reporting/VesselReportings'
import VesselSummary from './VesselSummary'
import { AlertWarning } from './warnings/AlertWarning'
import BeaconMalfunctionWarning from './warnings/BeaconMalfunctionWarning'
import { COLORS } from '../../constants/constants'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function VesselSidebarBody() {
  const { healthcheckTextWarning } = useMainAppSelector(state => state.global)
  const { selectedVessel, vesselSidebarTab } = useMainAppSelector(state => state.vessel)
  const isAdmin = useMainAppSelector(state => state.global.isAdmin)

  return (
    <Body healthcheckTextWarning={healthcheckTextWarning}>
      {isAdmin && <AlertWarning selectedVessel={selectedVessel} />}
      {isAdmin && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {vesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY && <VesselIdentity />}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselFishingActivities />}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS && <Controls />}
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
