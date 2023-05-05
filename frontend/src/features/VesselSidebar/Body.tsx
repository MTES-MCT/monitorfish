import styled from 'styled-components'

import { VesselBeaconMalfunctions } from './beacon_malfunctions/VesselBeaconMalfunctions'
import { Controls } from './Controls'
import { VesselFishingActivities } from './fishing_activities/VesselFishingActivities'
import VesselIdentity from './identity/VesselIdentity'
import { Reportings } from './Reportings'
import { VesselSummary } from './Summary'
import { AlertWarning } from './warnings/AlertWarning'
import { BeaconMalfunctionWarning } from './warnings/BeaconMalfunctionWarning'
import { COLORS } from '../../constants/constants'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function Body() {
  const { healthcheckTextWarning } = useMainAppSelector(state => state.global)
  const { selectedVessel, vesselSidebarTab } = useMainAppSelector(state => state.vessel)
  const isAdmin = useMainAppSelector(state => state.global.isAdmin)

  return (
    <Wrapper healthcheckTextWarning={healthcheckTextWarning}>
      {isAdmin && <AlertWarning selectedVessel={selectedVessel} />}
      {isAdmin && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {vesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY && <VesselIdentity />}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselFishingActivities />}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS && <Controls />}
      {vesselSidebarTab === VesselSidebarTab.REPORTING && <Reportings />}
      {vesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselBeaconMalfunctions />}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  healthcheckTextWarning: string | undefined
}>`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${p => (p.healthcheckTextWarning ? 80 : 82)}vh;
`
