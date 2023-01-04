import { Provider as ReduxProvider } from 'react-redux'
import styled from 'styled-components'

import APIWorker from '../api/APIWorker'
import { BackofficeMode } from '../api/BackofficeMode'
import NamespaceContext from '../domain/context/NamespaceContext'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'
import FavoriteVessels from '../features/favorite_vessels/FavoriteVessels'
import Healthcheck from '../features/healthcheck/Healthcheck'
import LayersSidebar from '../features/layers/LayersSidebar'
import Map from '../features/map/Map'
import { InterestPointMapButton } from '../features/map/tools/interest_points/InterestPointMapButton'
import { MeasurementMapButton } from '../features/map/tools/measurements/MeasurementMapButton'
import { RightMenuOnHoverArea } from '../features/map/tools/RightMenuOnHoverArea'
import { VesselFiltersMapButton } from '../features/map/tools/vessel_filters/VesselFiltersMapButton'
import { VesselLabelsMapButton } from '../features/map/tools/vessel_labels/VesselLabelsMapButton'
import { VesselVisibilityMapButton } from '../features/map/tools/vessel_visibility/VesselVisibilityMapButton'
import PreviewFilteredVessels from '../features/preview_filtered_vessels/PreviewFilteredVessels'
import { VesselList } from '../features/vessel_list/VesselList'
import UpdatingVesselLoader from '../features/vessel_sidebar/UpdatingVesselLoader'
import { VesselSidebar } from '../features/vessel_sidebar/VesselSidebar'
import { VesselSidebarHeader } from '../features/vessel_sidebar/VesselSidebarHeader'
import { useAppSelector } from '../hooks/useAppSelector'
import { store } from '../store'

export function TritonFishPage() {
  return (
    <ReduxProvider store={store}>
      <NamespaceContext.Provider value="homepage">
        <Body />
      </NamespaceContext.Provider>
    </ReduxProvider>
  )
}

function Body() {
  const isVesselSidebarOpen = useAppSelector(state => state.vessel.vesselSidebarIsOpen)

  return (
    <>
      <BackofficeMode />

      <Healthcheck />
      <PreviewFilteredVessels />
      <Container>
        <Map />
        <LayersSidebar />
        <VesselSidebarHeader />
        <RightMenuOnHoverArea />
        <VesselList namespace="homepage" />
        <VesselFiltersMapButton />
        <VesselVisibilityMapButton />
        <FavoriteVessels />
        {isVesselSidebarOpen && <VesselSidebar />}
        <UpdatingVesselLoader />
        <MeasurementMapButton />
        <InterestPointMapButton />
        <VesselLabelsMapButton />
        <APIWorker />
        <ErrorToastNotification />
      </Container>
    </>
  )
}

const Container = styled.div`
  font-size: 13px;
  overflow: hidden;
  text-align: center;
  width: 100vw;
`
