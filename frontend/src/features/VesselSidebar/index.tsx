import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { AnimateToTrack } from './actions/animate_to_track'
import { HideNonSelectedVessels } from './actions/hide_non_selected_vessels'
import { ShowFishingActivitiesOnMap } from './actions/show_fishing_activities'
import { TrackRequest } from './actions/TrackRequest'
import { Body } from './Body'
import { Tabs } from './Tabs'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'

export function VesselSidebar() {
  const { healthcheckTextWarning, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const isFocusedOnVesselSearch = useMainAppSelector(state => state.vessel.isFocusedOnVesselSearch)

  const [isFirstLoad, setIsFirstLoad] = useState(false)

  // Used to propagate prop `isSidebarOpen` to children, for animation purpose
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
      <AnimateToTrack isSidebarOpen={isFirstLoad} />
      <HideNonSelectedVessels isSidebarOpen={isFirstLoad} />
      <ShowFishingActivitiesOnMap isSidebarOpen={isFirstLoad} />
      <Wrapper
        data-cy="vessel-sidebar"
        healthcheckTextWarning={!!healthcheckTextWarning}
        isRightMenuOpen={rightMenuIsOpen}
        isSidebarOpen={isFirstLoad}
      >
        <GrayOverlay isOverlayed={isFocusedOnVesselSearch && isFirstLoad} />
        <div>
          <Tabs />
          <Body />
        </div>
      </Wrapper>
    </>
  )
}

const GrayOverlay = styled.div<{
  isOverlayed: boolean
}>`
  animation: ${p => (p.isOverlayed ? 'opacity-up' : 'opacity-down')} 0.5s ease forwards;
  background: ${p => p.theme.color.charcoal};
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
  healthcheckTextWarning: boolean
  isHidden?: boolean
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  margin-right: ${p => (p.isSidebarOpen ? 0 : -510)}px;
  max-height: 93vh;
  opacity: ${p => (p.isSidebarOpen ? 1 : 0)};
  overflow: hidden;
  padding: 0;
  position: absolute;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  top: 50px;
  transition:
    all 0.5s,
    right 0.3s,
    opacity 0.3s;
  width: 500px;
  z-index: 999;
`
