import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import { useAppSelector } from '../../hooks/useAppSelector'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import AnimateToTrack from './actions/animate_to_track/AnimateToTrack'
import HideNonSelectedVessels from './actions/hide_non_selected_vessels/HideNonSelectedVessels'
import ShowFishingActivitiesOnMap from './actions/show_fishing_activities/ShowFishingActivitiesOnMap'
import ExportTrack from './actions/track_request/ExportTrack'
import { TrackRequest } from './actions/track_request/TrackRequest'
import { VesselSidebarBody } from './VesselSidebarBody'
import VesselSidebarTabs from './VesselSidebarTabs'

export function VesselSidebar() {
  const { healthcheckTextWarning, rightMenuIsOpen } = useAppSelector(state => state.global)
  const isFocusedOnVesselSearch = useAppSelector(state => state.vessel.isFocusedOnVesselSearch)

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
      <TrackRequest isSidebarOpen={isFirstLoad} />
      <AnimateToTrack sidebarIsOpen={isFirstLoad} />
      <HideNonSelectedVessels sidebarIsOpen={isFirstLoad} />
      <ShowFishingActivitiesOnMap sidebarIsOpen={isFirstLoad} />
      <ExportTrack />
      <Wrapper
        data-cy="vessel-sidebar"
        healthcheckTextWarning={healthcheckTextWarning}
        isRightMenuOpen={rightMenuIsOpen}
        isSidebarOpen={isFirstLoad}
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

const GrayOverlay = styled.div<{
  isOverlayed: boolean
}>`
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

const Wrapper = styled(MapComponentStyle)<{
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
}>`
  background: ${COLORS.gainsboro};
  margin-right: ${p => (p.isSidebarOpen ? 0 : -510)}px;
  max-height: 93vh;
  opacity: ${p => (p.isSidebarOpen ? 1 : 0)};
  overflow: hidden;
  padding: 0;
  position: absolute;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  top: 50px;
  transition: all 0.5s, right 0.3s, opacity 0.3s;
  width: 500px;
  z-index: 999;
`
