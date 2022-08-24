import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { VesselSidebarTab } from '../../domain/entities/vessel'
import VesselBeaconMalfunctions from './beacon_malfunctions/VesselBeaconMalfunctions'
import VesselControls from './controls/VesselControls'
import VesselFishingActivities from './fishing_activities/VesselFishingActivities'
import VesselIdentity from './identity/VesselIdentity'
import VesselReportings from './reporting/VesselReportings'
import VesselSummary from './VesselSummary'
import AlertWarning from './warnings/AlertWarning'
import BeaconMalfunctionWarning from './warnings/BeaconMalfunctionWarning'

function VesselSidebarBody() {
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { selectedVessel, vesselSidebarTab } = useSelector(state => state.vessel)
  const adminRole = useSelector(state => state.global.adminRole)

  return (
    <Body healthcheckTextWarning={healthcheckTextWarning}>
      {adminRole ? <AlertWarning selectedVessel={selectedVessel} /> : null}
      {adminRole ? <BeaconMalfunctionWarning selectedVessel={selectedVessel} /> : null}
      {vesselSidebarTab === VesselSidebarTab.SUMMARY ? <VesselSummary /> : null}
      {vesselSidebarTab === VesselSidebarTab.IDENTITY ? <VesselIdentity /> : null}
      {vesselSidebarTab === VesselSidebarTab.VOYAGES ? <VesselFishingActivities /> : null}
      {vesselSidebarTab === VesselSidebarTab.CONTROLS ? <VesselControls /> : null}
      {vesselSidebarTab === VesselSidebarTab.REPORTING ? <VesselReportings /> : null}
      {vesselSidebarTab === VesselSidebarTab.ERSVMS ? <VesselBeaconMalfunctions /> : null}
    </Body>
  )
}

const Body = styled.div`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${props => (props.healthcheckTextWarning ? 80 : 82)}vh;
`

export default VesselSidebarBody
