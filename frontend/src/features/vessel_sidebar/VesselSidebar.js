import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { COLORS } from '../../constants/constants'
import TrackRequest from './actions/track_request/TrackRequest'
import ExportTrack from './actions/track_request/ExportTrack'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import HideNonSelectedVessels from './actions/hide_non_selected_vessels/HideNonSelectedVessels'
import AnimateToTrack from './actions/animate_to_track/AnimateToTrack'
import ShowFishingActivitiesOnMap from './actions/show_fishing_activities/ShowFishingActivitiesOnMap'
import VesselSidebarTabs from './VesselSidebarTabs'
import VesselSidebarBody from './VesselSidebarBody'

const VesselSidebar = () => {
  const {
    healthcheckTextWarning,
    rightMenuIsOpen
  } = useSelector(state => state.global)
  const {
    vesselSidebarIsOpen
  } = useSelector(state => state.vessel)
  const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)

  return (
    <>
      <TrackRequest
        sidebarIsOpen={vesselSidebarIsOpen}
      />
      <AnimateToTrack
        sidebarIsOpen={vesselSidebarIsOpen}
      />
      <HideNonSelectedVessels
        sidebarIsOpen={vesselSidebarIsOpen}
      />
      <ShowFishingActivitiesOnMap
        sidebarIsOpen={vesselSidebarIsOpen}
      />
      <ExportTrack
        sidebarIsOpen={vesselSidebarIsOpen}
      />
      <Wrapper
        data-cy={'vessel-sidebar'}
        healthcheckTextWarning={healthcheckTextWarning}
        sidebarIsOpen={vesselSidebarIsOpen}
        rightMenuIsOpen={rightMenuIsOpen}
      >
        <GrayOverlay isOverlayed={isFocusedOnVesselSearch}/>
        <div>
          <VesselSidebarTabs/>
          <VesselSidebarBody/>
        </div>
      </Wrapper>
    </>
  )
}

const GrayOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0;
  background: ${COLORS.charcoal};
  animation: ${props => props.isOverlayed ? 'opacity-up' : 'opacity-down'} 0.5s ease forwards;
  z-index: 11;

  @keyframes opacity-up {
    0%   { opacity: 0; }
    100% { opacity: 0.5; z-index: 11; }
  }
    @keyframes opacity-down {
    0%   { opacity: 0.5; }
    100% { opacity: 0; z-index: -99999; }
  }
`

const Wrapper = styled(MapComponentStyle)`
  position: absolute;
  top: 50px;
  width: 500px;
  max-height: 93vh;
  z-index: 999;
  padding: 0;
  background: ${COLORS.gainsboro};
  overflow: hidden;
  opacity: ${props => props.sidebarIsOpen ? 1 : 0};
  margin-right: ${props => props.sidebarIsOpen ? 0 : -510}px;
  right: ${props => props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10}px;
  transition: all 0.5s, right 0.3s, opacity 0.5s;
`

export default VesselSidebar
