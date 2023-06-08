import { useCallback } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import styled from 'styled-components'

import { ErrorToastNotification } from './commonComponents/ErrorToastNotification'
import { Healthcheck } from './Healthcheck'
import { DrawLayerModal } from './map/draw/DrawModal'
import Map from './map/Map'
import { MapButtons } from './MapButtons'
import { LayersSidebar } from './MapButtons/LayersSidebar'
import { RightMenuOnHoverArea } from './MapButtons/shared/RightMenuOnHoverArea'
import PreviewFilteredVessels from './preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindowLauncher } from './SideWindow/SideWindowLauncher'
import { VesselList } from './VesselList'
import { VesselSidebar } from './VesselSidebar'
import UpdatingVesselLoader from './VesselSidebar/UpdatingVesselLoader'
import { VesselSidebarHeader } from './VesselSidebar/VesselSidebarHeader'
import { APIWorker } from '../api/APIWorker'
import { SideWindowStatus } from '../domain/entities/sideWindow/constants'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

export function MainWindow() {
  const { isDrawLayerModalDisplayed, isVesselListDisplayed, isVesselSearchDisplayed } = useMainAppSelector(
    state => state.displayedComponent
  )
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const { mission, sideWindow } = useMainAppSelector(state => state)

  const warnOnUnload = useCallback(
    event => {
      if (sideWindow.status !== SideWindowStatus.CLOSED && mission.isDraftDirty) {
        event.preventDefault()

        // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#examples
        // eslint-disable-next-line no-param-reassign
        event.returnValue = ''
      }
    },
    [mission.isDraftDirty, sideWindow.status]
  )

  useBeforeUnload(warnOnUnload)

  return (
    <>
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
    </>
  )
}

const Wrapper = styled.div`
  font-size: 13px;
  overflow: hidden;
  text-align: center;
  width: 100vw;
`
