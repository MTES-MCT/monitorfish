import { useContext } from 'react'
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
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { VesselSidebarTab } from '../../domain/entities/vessel/vessel'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function Body() {
  const isSuperUser = useContext(AuthorizationContext)
  const { healthcheckTextWarning } = useMainAppSelector(state => state.global)
  const { selectedVessel, vesselSidebarTab } = useMainAppSelector(state => state.vessel)

  return (
    <Wrapper healthcheckTextWarning={healthcheckTextWarning}>
      {isSuperUser && <AlertWarning selectedVessel={selectedVessel} />}
      {isSuperUser && <BeaconMalfunctionWarning selectedVessel={selectedVessel} />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.SUMMARY && <VesselSummary />}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY && <VesselIdentity />}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES && <VesselFishingActivities />}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS && <Controls />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.REPORTING && <Reportings />}
      {isSuperUser && vesselSidebarTab === VesselSidebarTab.ERSVMS && <VesselBeaconMalfunctions />}
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
