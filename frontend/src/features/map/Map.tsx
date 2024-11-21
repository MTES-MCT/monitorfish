import { FrontendErrorBoundary } from '@components/FrontendErrorBoundary'
import FilterLayer from '@features/VesselFilter/layers/VesselFilterLayer'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Feature } from 'ol'
import { useState } from 'react'

import { BaseMap } from './BaseMap'
import { LayerDetailsBox } from './controls/LayerDetailsBox'
import MapHistory from './MapHistory'
import { MapMenu } from './MapMenu'
import { MapVesselClickAndAnimationHandler } from './MapVesselClickAndAnimationHandler'
import { ControlOverlay } from './overlays/ControlOverlay'
import { SelectedControlOverlay } from './overlays/SelectedControlOverlay'
import { TrackTypeOverlay } from './overlays/TrackTypeOverlay'
import VesselTrackOverlay from './overlays/VesselTrackOverlay'
import { useIsSuperUser } from '../../auth/hooks/useIsSuperUser'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import { AdministrativeLayers } from '../AdministrativeZone/layers/AdministrativeLayers'
import { BaseLayer } from '../BaseMap/layers/BaseLayer'
import { DrawLayer } from '../Draw/layer'
import InterestPointLayer from '../InterestPoint/layers/InterestPointLayer'
import { MeasurementLayer } from '../Measurement/layers/MeasurementLayer'
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
import { VesselCardOverlay } from '../Vessel/components/VesselCardOverlay'
import VesselEstimatedPositionOverlay from '../Vessel/components/VesselEstimatedPositionOverlay'
import VesselAlertAndBeaconMalfunctionLayer from '../Vessel/layers/VesselAlertAndBeaconMalfunctionLayer'
import VesselAlertLayer from '../Vessel/layers/VesselAlertLayer'
import VesselBeaconMalfunctionLayer from '../Vessel/layers/VesselBeaconMalfunctionLayer'
import VesselEstimatedPositionLayer from '../Vessel/layers/VesselEstimatedPositionLayer'
import VesselInfractionSuspicionLayer from '../Vessel/layers/VesselInfractionSuspicionLayer'
import VesselSelectedLayer from '../Vessel/layers/VesselSelectedLayer'
import { VesselsLabelsLayer } from '../Vessel/layers/VesselsLabelsLayer'
import { VesselsLayer } from '../Vessel/layers/VesselsLayer'
import { VesselsTracksLayerMemoized } from '../Vessel/layers/VesselsTracksLayer'

export function Map() {
  const isSuperUser = useIsSuperUser()
  const dispatch = useMainAppDispatch()
  const { areVesselsDisplayed, isMissionsLayerDisplayed, isStationLayerDisplayed } = useMainAppSelector(
    state => state.displayedComponent
  )
  const zoneSelected = useMainAppSelector(state => state.regulatoryLayerSearch.zoneSelected)
  const lastShowedFeatures = useMainAppSelector(state => state.layer.lastShowedFeatures)
  const layersToFeatures = useMainAppSelector(state => state.layer.layersToFeatures)
  const regulatoryZonesToPreview = useMainAppSelector(state => state.regulation.regulatoryZonesToPreview)
  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)
  const simplifiedGeometries = useMainAppSelector(state => state.regulation.simplifiedGeometries)

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
      <RegulatoryLayers
        dispatch={dispatch}
        lastShowedFeatures={lastShowedFeatures}
        layersToFeatures={layersToFeatures}
        mapMovingAndZoomEvent={mapMovingAndZoomEvent}
        regulatoryZoneMetadata={regulatoryZoneMetadata}
        showedLayers={showedLayers}
        simplifiedGeometries={simplifiedGeometries}
      />
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
      <RegulatoryPreviewLayer
        dispatch={dispatch}
        regulatoryZonesToPreview={regulatoryZonesToPreview}
        zoneSelected={zoneSelected}
      />
    </BaseMap>
  )
}
