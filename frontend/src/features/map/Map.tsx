import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import { Feature } from 'ol'
import { useState } from 'react'

import { BaseMap } from './BaseMap'
import { LayerDetailsBox } from './controls/LayerDetailsBox'
import FilterLayer from './layers/FilterLayer'
import VesselAlertAndBeaconMalfunctionLayer from './layers/Vessel/VesselAlertAndBeaconMalfunctionLayer'
import VesselAlertLayer from './layers/Vessel/VesselAlertLayer'
import VesselBeaconMalfunctionLayer from './layers/Vessel/VesselBeaconMalfunctionLayer'
import VesselEstimatedPositionLayer from './layers/Vessel/VesselEstimatedPositionLayer'
import VesselInfractionSuspicionLayer from './layers/Vessel/VesselInfractionSuspicionLayer'
import VesselSelectedLayer from './layers/Vessel/VesselSelectedLayer'
import { VesselsLabelsLayer } from './layers/Vessel/VesselsLabelsLayer'
import { VesselsLayer } from './layers/Vessel/VesselsLayer'
import { VesselsTracksLayerMemoized } from './layers/Vessel/VesselsTracksLayer'
import MapHistory from './MapHistory'
import { MapMenu } from './MapMenu'
import { MapVesselClickAndAnimationHandler } from './MapVesselClickAndAnimationHandler'
import { ControlOverlay } from './overlays/ControlOverlay'
import { SelectedControlOverlay } from './overlays/SelectedControlOverlay'
import { TrackTypeOverlay } from './overlays/TrackTypeOverlay'
import { VesselCardOverlay } from './overlays/VesselCardOverlay'
import VesselEstimatedPositionOverlay from './overlays/VesselEstimatedPositionOverlay'
import VesselTrackOverlay from './overlays/VesselTrackOverlay'
import { useIsSuperUser } from '../../auth/hooks/useIsSuperUser'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import { AdministrativeLayers } from '../AdministrativeZone/layers/AdministrativeLayers'
import { BaseLayer } from '../BaseMap/layers/BaseLayer'
import { DrawLayer } from '../Draw/layer'
import InterestPointLayer from '../InterestPoint/layers/InterestPointLayer'
import MeasurementLayer from '../Measurement/layers/MeasurementLayer'
import { MissionOverlay } from '../Mission/components/MissionOverlay'
import { SelectedMissionOverlay } from '../Mission/components/SelectedMissionOverlay'
import { MissionHoveredLayer } from '../Mission/layers/HoveredMissionLayer'
import { MissionLayer } from '../Mission/layers/MissionLayer'
import { MissionsLabelsLayer } from '../Mission/layers/MissionsLabelsLayer/MissionsLabelsLayer'
import { SelectedMissionActionsLayer } from '../Mission/layers/SelectedMissionActionsLayer'
import { SelectedMissionLayer } from '../Mission/layers/SelectedMissionLayer'
import { RegulatoryLayers } from '../Regulation/layers/RegulatoryLayers'
import { RegulatoryLayerSearch } from '../Regulation/layers/RegulatoryLayerSearch'
import { RegulatoryPreviewLayer } from '../Regulation/layers/RegulatoryPreviewLayer'
import { HoveredStationOverlay } from '../Station/components/HoveredStationOverlay'
import { SelectedStationOverlay } from '../Station/components/SelectedStationOverlay'
import { StationLayer } from '../Station/components/StationLayer'

export function Map() {
  const isSuperUser = useIsSuperUser()
  const { areVesselsDisplayed, isMissionsLayerDisplayed, isStationLayerDisplayed } = useMainAppSelector(
    state => state.displayedComponent
  )
  const [shouldUpdateView, setShouldUpdateView] = useState(true)
  const [historyMoveTrigger, setHistoryMoveTrigger] = useState({})
  const [hoveredFeature, setHoveredFeature] = useState<Feature | FeatureWithCodeAndEntityId | undefined>(undefined)
  const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState<Object>({})
  const [handlePointerMoveEventPixel, setHandlePointerMoveEventPixel] = useState(null)

  const hoveredFeatureWithCodeAndEntityId =
    hoveredFeature && hoveredFeature instanceof FeatureWithCodeAndEntityId ? hoveredFeature : undefined

  const handleMovingAndZoom = () => {
    if (!shouldUpdateView) {
      setShouldUpdateView(true)
    }
    setHistoryMoveTrigger({ dummyUpdate: true })
    setMapMovingAndZoomEvent({ dummyUpdate: true })
  }

  // TODO Maybe debounce this call. This triggers a lot of re-renders.
  const handlePointerMove = event => {
    if (event) {
      setHandlePointerMoveEventPixel(event.pixel)
    }
  }

  return (
    <BaseMap
      // BaseMap forwards map as props to children
      handleMovingAndZoom={handleMovingAndZoom}
      handlePointerMove={handlePointerMove}
      isMainApp
      setCurrentFeature={setHoveredFeature}
      showAttributions
      showCoordinates
    >
      <BaseLayer />
      <RegulatoryLayers mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      <AdministrativeLayers />
      <MapVesselClickAndAnimationHandler />
      <MapHistory
        historyMoveTrigger={historyMoveTrigger}
        setShouldUpdateView={setShouldUpdateView}
        shouldUpdateView={shouldUpdateView}
      />
      <MapMenu />
      <MeasurementLayer />
      <FilterLayer />

      <DrawLayer />

      {/** <></> can't be used to group condition as BaseMap needs the layers to be direct children * */}
      {isSuperUser && isMissionsLayerDisplayed && <MissionLayer />}
      {isSuperUser && <MissionsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />}
      {isSuperUser && <SelectedMissionLayer />}
      {isSuperUser && <MissionHoveredLayer feature={hoveredFeature} />}
      {isSuperUser && <MissionOverlay feature={hoveredFeature} />}
      {isSuperUser && <SelectedMissionOverlay />}
      {isSuperUser && <SelectedMissionActionsLayer />}
      {isSuperUser && <ControlOverlay feature={hoveredFeature} />}
      {isSuperUser && <SelectedControlOverlay />}

      <RegulatoryLayerSearch />

      <FrontendErrorBoundary>
        {isSuperUser && isStationLayerDisplayed && (
          <>
            <StationLayer hoveredFeatureId={hoveredFeatureWithCodeAndEntityId?.id} />
            <HoveredStationOverlay hoveredFeature={hoveredFeatureWithCodeAndEntityId} />
            <SelectedStationOverlay />
          </>
        )}
      </FrontendErrorBoundary>

      <VesselsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      {/** <></> can't be used to group condition as BaseMap needs the layers to be direct children * */}
      <VesselsLayer />
      {areVesselsDisplayed && <VesselEstimatedPositionLayer />}
      {areVesselsDisplayed && <VesselSelectedLayer />}
      {areVesselsDisplayed && <VesselAlertLayer />}
      {areVesselsDisplayed && <VesselBeaconMalfunctionLayer />}
      {areVesselsDisplayed && <VesselAlertAndBeaconMalfunctionLayer />}
      {areVesselsDisplayed && <VesselInfractionSuspicionLayer />}
      <VesselsTracksLayerMemoized />
      <VesselCardOverlay feature={hoveredFeature} />
      <TrackTypeOverlay feature={hoveredFeature} pointerMoveEventPixel={handlePointerMoveEventPixel} />
      <VesselEstimatedPositionOverlay feature={hoveredFeature} pointerMoveEventPixel={handlePointerMoveEventPixel} />
      <VesselTrackOverlay feature={hoveredFeature} />
      {hoveredFeature && <LayerDetailsBox feature={hoveredFeature} />}
      <InterestPointLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      <RegulatoryPreviewLayer />
    </BaseMap>
  )
}
