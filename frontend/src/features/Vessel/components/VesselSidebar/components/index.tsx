import { AnimateToTrack } from '@features/Vessel/components/VesselSidebar/components/AnimateToTrack'
import { HideNonSelectedVessels } from '@features/Vessel/components/VesselSidebar/components/HideNonSelectedVessels'
import { ShowFishingActivitiesOnMap } from '@features/Vessel/components/VesselSidebar/components/ShowFishingActivitiesOnMap'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTracking } from '@hooks/useTracking'
import { TrackRequest } from 'features/Vessel/components/VesselSidebar/components/TrackRequest'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { Body } from './Body'
import { Tabs } from './Tabs'
import { MapComponent } from '../../../../commonStyles/MapComponent'

export function VesselSidebar() {
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const isFocusedOnVesselSearch = useMainAppSelector(state => state.vessel.isFocusedOnVesselSearch)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { trackPage } = useTracking()

  const [isFirstLoad, setIsFirstLoad] = useState(false)

  useEffect(() => {
    if (selectedVessel) {
      trackPage(VesselFeature.getVesselFeatureId(selectedVessel))
    }
  }, [trackPage, selectedVessel])

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
      <Wrapper $isRightMenuOpen={rightMenuIsOpen} $isSidebarOpen={isFirstLoad} data-cy="vessel-sidebar">
        <Tabs />
        <Body />
        <GrayOverlay $isOverlayed={isFocusedOnVesselSearch && isFirstLoad} />
      </Wrapper>
    </>
  )
}

const GrayOverlay = styled.div<{
  $isOverlayed: boolean
}>`
  animation: ${p => (p.$isOverlayed ? 'opacity-up' : 'opacity-down')} 0.5s ease forwards;
  background: ${p => p.theme.color.charcoal};
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;
  top: 0;
  z-index: ${p => (p.$isOverlayed ? 1 : -1)};

  @keyframes opacity-up {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.5;
    }
  }
  @keyframes opacity-down {
    0% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
    }
  }
`

const Wrapper = styled(MapComponent)<{
  $isRightMenuOpen: boolean
  $isSidebarOpen: boolean
}>`
  background: ${p => p.theme.color.gainsboro};
  margin-right: ${p => (p.$isSidebarOpen ? 0 : -510)}px;
  max-height: 93vh;
  opacity: ${p => (p.$isSidebarOpen ? 1 : 0)};
  overflow: hidden;
  padding: 0;
  position: absolute;
  right: ${p => (p.$isRightMenuOpen && p.$isSidebarOpen ? 55 : 10)}px;
  top: 40px;
  transition:
    all 0.5s,
    right 0.3s,
    opacity 0.3s;
  width: 500px;
`
