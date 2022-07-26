import React from 'react'
import styled from 'styled-components'
import VesselIdentity from './identity/VesselIdentity'
import { useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import VesselSummary from './VesselSummary'
import VesselFishingActivities from './fishing_activities/VesselFishingActivities'
import VesselControls from './controls/VesselControls'
import { VesselSidebarTab } from '../../domain/entities/vessel'
import AlertWarning from './warnings/AlertWarning'
import BeaconMalfunctionWarning from './warnings/BeaconMalfunctionWarning'
import VesselBeaconMalfunctions from './beacon_malfunctions/VesselBeaconMalfunctions'
import VesselReportings from './reporting/VesselReportings'

const VesselSidebarBody = () => {
  const {
    healthcheckTextWarning
  } = useSelector(state => state.global)
  const {
    selectedVessel,
    vesselSidebarTab
  } = useSelector(state => state.vessel)
  const adminRole = useSelector(state => state.global.adminRole)

  return (
    <Body healthcheckTextWarning={healthcheckTextWarning}>
      {
        adminRole
          ? <AlertWarning selectedVessel={selectedVessel}/>
          : null
      }
      {
        adminRole
          ? <BeaconMalfunctionWarning selectedVessel={selectedVessel}/>
          : null
      }
      {
        vesselSidebarTab === VesselSidebarTab.SUMMARY
          ? <VesselSummary/>
          : null
      }
      {
        vesselSidebarTab === VesselSidebarTab.IDENTITY
          ? <VesselIdentity/>
          : null
      }
      {
        vesselSidebarTab === VesselSidebarTab.VOYAGES
          ? <VesselFishingActivities/>
          : null
      }
      {
        vesselSidebarTab === VesselSidebarTab.CONTROLS
          ? <VesselControls/>
          : null
      }
      {
        vesselSidebarTab === VesselSidebarTab.REPORTING
          ? <VesselReportings/>
          : null
      }
      {
        vesselSidebarTab === VesselSidebarTab.ERSVMS
          ? <VesselBeaconMalfunctions/>
          : null
      }
    </Body>
  )
}

const Body = styled.div`
  padding: 0;
  background: ${COLORS.gainsboro};
  max-height: ${props => props.healthcheckTextWarning ? 80 : 82}vh;
`

export default VesselSidebarBody
