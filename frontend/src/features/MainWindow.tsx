import { useCallback } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import styled from 'styled-components'

import { ErrorToastNotification } from './commonComponents/ErrorToastNotification'
import { HealthcheckHeadband } from './Healthcheck/components/HealthcheckHeadband'
import { DrawLayerModal } from './map/draw/DrawModal'
import Map from './map/Map'
import { MapButtons } from './MapButtons'
import { LayersSidebar } from './MapButtons/LayersSidebar'
import { RightMenuOnHoverArea } from './MapButtons/shared/RightMenuOnHoverArea'
import PreviewFilteredVessels from './preview_filtered_vessels/PreviewFilteredVessels'
import { SideWindowLauncher } from './SideWindow/SideWindowLauncher'
import { VesselLoader } from './Vessel/components/VesselLoader'
import { VesselList } from './VesselList'
import { VesselSidebar } from './VesselSidebar'
import { VesselSidebarHeader } from './VesselSidebar/VesselSidebarHeader'
import { APIWorker } from '../api/APIWorker'
import { SideWindowStatus } from '../domain/entities/sideWindow/constants'
import { useMainAppSelector } from '../hooks/useMainAppSelector'

export function MainWindow() {
  const { isDrawLayerModalDisplayed, isVesselListDisplayed, isVesselSearchDisplayed } = useMainAppSelector(
    state => state.displayedComponent
  )
  const isVesselSidebarOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const isDraftDirty = useMainAppSelector(state => state.mission.isDraftDirty)
  const status = useMainAppSelector(state => state.sideWindow.status)

  const warnOnUnload = useCallback(
    event => {
      if (status !== SideWindowStatus.CLOSED && isDraftDirty) {
        event.preventDefault()

        // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#examples
        // eslint-disable-next-line no-param-reassign
        event.returnValue = ''
      }
    },
    [isDraftDirty, status]
  )

  useBeforeUnload(warnOnUnload)

  return (
    <>
      <HealthcheckHeadband />

      <PreviewFilteredVessels />

      <Wrapper>
        <Map />
        <LayersSidebar />
        {isVesselSearchDisplayed && <VesselSidebarHeader />}
        <MapButtons />
        <RightMenuOnHoverArea />
        {isVesselListDisplayed && <VesselList namespace="homepage" />}
        {isVesselSidebarOpen && <VesselSidebar />}
        <VesselLoader />
        <APIWorker />
        <ErrorToastNotification />
        {status !== SideWindowStatus.CLOSED && <SideWindowLauncher />}
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
