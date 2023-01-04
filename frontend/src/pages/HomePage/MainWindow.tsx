import styled from 'styled-components'

import APIWorker from '../../api/APIWorker'
import { ErrorToastNotification } from '../../features/commonComponents/ErrorToastNotification'
import FavoriteVessels from '../../features/favorite_vessels/FavoriteVessels'
import Healthcheck from '../../features/healthcheck/Healthcheck'
import LayersSidebar from '../../features/layers/LayersSidebar'
import { DrawLayerModal } from '../../features/map/draw/DrawModal'
import Map from '../../features/map/Map'
import { InterestPointMapButton } from '../../features/map/tools/interest_points/InterestPointMapButton'
import { MeasurementMapButton } from '../../features/map/tools/measurements/MeasurementMapButton'
import { RightMenuOnHoverArea } from '../../features/map/tools/RightMenuOnHoverArea'
import { VesselFiltersMapButton } from '../../features/map/tools/vessel_filters/VesselFiltersMapButton'
import { VesselLabelsMapButton } from '../../features/map/tools/vessel_labels/VesselLabelsMapButton'
import { VesselVisibilityMapButton } from '../../features/map/tools/vessel_visibility/VesselVisibilityMapButton'
import PreviewFilteredVessels from '../../features/preview_filtered_vessels/PreviewFilteredVessels'
import { AlertsMapButton } from '../../features/SideWindow/alerts_reportings/AlertsMapButton'
import { BeaconMalfunctionsMapButton } from '../../features/SideWindow/beacon_malfunctions/BeaconMalfunctionsMapButton'
import { SideWindowLauncher } from '../../features/SideWindow/SideWindowLauncher'
import { VesselList } from '../../features/vessel_list/VesselList'
import UpdatingVesselLoader from '../../features/vessel_sidebar/UpdatingVesselLoader'
import { VesselSidebar } from '../../features/vessel_sidebar/VesselSidebar'
import { VesselSidebarHeader } from '../../features/vessel_sidebar/VesselSidebarHeader'
import { useAppSelector } from '../../hooks/useAppSelector'

export function MainWindow() {
  const {
    isDrawLayerModalDisplayed,
    isInterestPointMapButtonDisplayed,
    isMeasurementMapButtonDisplayed,
    isVesselFiltersMapButtonDisplayed,
    isVesselLabelsMapButtonDisplayed,
    isVesselListDisplayed,
    isVesselSearchDisplayed,
    isVesselVisibilityMapButtonDisplayed
  } = useAppSelector(state => state.displayedComponent)
  const isVesselSidebarOpen = useAppSelector(state => state.vessel.vesselSidebarIsOpen)
  const openedSideWindowTab = useAppSelector(state => state.global.openedSideWindowTab)

  return (
    <>
      <Healthcheck />

      <PreviewFilteredVessels />

      <Wrapper>
        <Map />
        <LayersSidebar />
        {isVesselSearchDisplayed && <VesselSidebarHeader />}
        <AlertsMapButton />
        <BeaconMalfunctionsMapButton />
        <RightMenuOnHoverArea />
        {isVesselListDisplayed && <VesselList namespace="homepage" />}
        {isVesselFiltersMapButtonDisplayed && <VesselFiltersMapButton />}
        {isVesselVisibilityMapButtonDisplayed && <VesselVisibilityMapButton />}
        <FavoriteVessels />
        {isVesselSidebarOpen && <VesselSidebar />}
        <UpdatingVesselLoader />
        {isMeasurementMapButtonDisplayed && <MeasurementMapButton />}
        {isInterestPointMapButtonDisplayed && <InterestPointMapButton />}
        {isVesselLabelsMapButtonDisplayed && <VesselLabelsMapButton />}
        <APIWorker />
        <ErrorToastNotification />
        {openedSideWindowTab && <SideWindowLauncher />}
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
