import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import AnimateToTrack from './actions/animate_to_track/AnimateToTrack'
import HideNonSelectedVessels from './actions/hide_non_selected_vessels/HideNonSelectedVessels'
import ShowFishingActivitiesOnMap from './actions/show_fishing_activities/ShowFishingActivitiesOnMap'
import ExportTrack from './actions/track_request/ExportTrack'
import TrackRequest from './actions/track_request/TrackRequest'
import VesselSidebarBody from './VesselSidebarBody'
import VesselSidebarTabs from './VesselSidebarTabs'

function VesselSidebar() {
  const { healthcheckTextWarning, rightMenuIsOpen } = useSelector(state => state.global)
  const isFocusedOnVesselSearch = useSelector(state => state.vessel.isFocusedOnVesselSearch)

  const [isFirstLoad, setIsFirstLoad] = useState(false)

  useEffect(() => {
    const timeoutHandler = setTimeout(() => {
      setIsFirstLoad(true)
    }, 0)

    return () => {
      clearTimeout(timeoutHandler)
      setIsFirstLoad(false)
    }
  }, [])

  return (
    <>
      <TrackRequest sidebarIsOpen={isFirstLoad} />
      <AnimateToTrack sidebarIsOpen={isFirstLoad} />
      <HideNonSelectedVessels sidebarIsOpen={isFirstLoad} />
      <ShowFishingActivitiesOnMap sidebarIsOpen={isFirstLoad} />
      <ExportTrack sidebarIsOpen={isFirstLoad} />
      <Wrapper
        data-cy="vessel-sidebar"
        healthcheckTextWarning={healthcheckTextWarning}
        rightMenuIsOpen={rightMenuIsOpen}
        sidebarIsOpen={isFirstLoad}
      >
        <GrayOverlay isOverlayed={isFocusedOnVesselSearch && isFirstLoad} />
        <div>
          <VesselSidebarTabs />
          <VesselSidebarBody />
        </div>
      </Wrapper>
    </>
  )
}

const GrayOverlay = styled.div`
  animation: ${p => (p.isOverlayed ? 'opacity-up' : 'opacity-down')} 0.5s ease forwards;
  background: ${COLORS.charcoal};
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;
  z-index: 11;

  @keyframes opacity-up {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.5;
      z-index: 11;
    }
  }
  @keyframes opacity-down {
    0% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
      z-index: -99999;
    }
  }
`

const Wrapper = styled(MapComponentStyle)`
  background: ${COLORS.gainsboro};
  margin-right: ${p => (p.sidebarIsOpen ? 0 : -510)}px;
  max-height: 93vh;
  opacity: ${p => (p.sidebarIsOpen ? 1 : 0)};
  overflow: hidden;
  padding: 0;
  position: absolute;
  right: ${p => (p.rightMenuIsOpen && p.sidebarIsOpen ? 55 : 10)}px;
  top: 50px;
  transition: all 0.5s, right 0.3s, opacity 0.3s;
  width: 500px;
  z-index: 999;
`

export default VesselSidebar
