import { useRef } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'

import { APIWorker } from '../api/APIWorker'
import { SideWindowStatus } from '../domain/entities/sideWindow/constants'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'
import { Healthcheck } from '../features/Healthcheck'
import { DrawLayerModal } from '../features/map/draw/DrawModal'
import Map from '../features/map/Map'
import { MapButtons } from '../features/MapButtons'
import { LayersSidebar } from '../features/MapButtons/LayersSidebar'
import { RightMenuOnHoverArea } from '../features/MapButtons/shared/RightMenuOnHoverArea'
import PreviewFilteredVessels from '../features/preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindow } from '../features/SideWindow'
import { SideWindowLauncher } from '../features/SideWindow/SideWindowLauncher'
import { VesselList } from '../features/VesselList'
import { VesselSidebar } from '../features/VesselSidebar'
import UpdatingVesselLoader from '../features/VesselSidebar/UpdatingVesselLoader'
import { VesselSidebarHeader } from '../features/VesselSidebar/VesselSidebarHeader'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

import type { MutableRefObject } from 'react'

export function HomePage() {
  const { isDrawLayerModalDisplayed, isVesselListDisplayed, isVesselSearchDisplayed } = useMainAppSelector(
    state => state.displayedComponent
  )
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const { sideWindow } = useMainAppSelector(state => state)
  const ref = useRef() as MutableRefObject<HTMLDivElement>

  return (
    <>
      <Switch>
        <Route exact path="/side_window">
          <SideWindow ref={ref} isFromURL />
        </Route>
        <Route exact path="/">
          <Healthcheck />
          <PreviewFilteredVessels />
          <Wrapper>
            <Map />
            <LayersSidebar />
            {isVesselSearchDisplayed && <VesselSidebarHeader />}
            <MapButtons />
            <RightMenuOnHoverArea />
            {isVesselListDisplayed && <VesselList namespace="homepage" />}
            {isVesselSidebarOpen && <VesselSidebar />}
            <UpdatingVesselLoader />
            <APIWorker />
            <ErrorToastNotification />
            {sideWindow.status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
            {isDrawLayerModalDisplayed && <DrawLayerModal />}
          </Wrapper>
        </Route>
      </Switch>
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  text-align: center;
  width: 100vw;
`
