import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
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

export function VesselSidebar() {
  const isFocusedOnVesselSearch = useMainAppSelector(state => state.vessel.isFocusedOnVesselSearch)
  const isReportingMapFormDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingMapFormDisplayed)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { trackPage } = useTracking()

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (selectedVessel) {
      trackPage(VesselFeature.getVesselFeatureId(selectedVessel))
    }
  }, [trackPage, selectedVessel])

  // Used to propagate prop `isSidebarOpen` to children, for animation purpose
  useEffect(() => {
    const timeoutHandler = setTimeout(() => {
      setIsOpen(true)
    }, 0)

    return () => {
      clearTimeout(timeoutHandler)
      setIsOpen(false)
    }
  }, [])

  return (
    <>
      <TrackRequest isSidebarOpen={isOpen} />
      <AnimateToTrack isSidebarOpen={isOpen} />
      <HideNonSelectedVessels isSidebarOpen={isOpen} />
      <ShowFishingActivitiesOnMap isSidebarOpen={isOpen} />
      <Wrapper data-cy="vessel-sidebar" isOpen={isOpen} isReportingOpen={isReportingMapFormDisplayed}>
        <Tabs />
        <Body />
        <GrayOverlay $isOverlayed={isFocusedOnVesselSearch && isOpen} />
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

const Wrapper = styled(MapToolBox)`
  background: ${p => p.theme.color.gainsboro};
  max-height: 93vh;
  overflow: hidden;
  padding: 0;
  top: 40px;
  transition:
    all 0.5s,
    right 0.3s,
    opacity 0.3s;
  width: 500px;
`
