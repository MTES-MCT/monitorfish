import { Feature } from 'ol'
import { useState } from 'react'

import { BaseMap } from './BaseMap'
import { LayerDetailsBox } from './controls/LayerDetailsBox'
import { AdministrativeLayers } from './layers/AdministrativeLayers'
import { BaseLayer } from './layers/BaseLayer'
import { DrawLayer } from './layers/DrawLayer'
import FilterLayer from './layers/FilterLayer'
import InterestPointLayer from './layers/InterestPointLayer'
import MeasurementLayer from './layers/MeasurementLayer'
import { MissionHoveredLayer } from './layers/Mission/HoveredMissionLayer'
import { MissionLayer } from './layers/Mission/MissionLayer'
import { MissionsLabelsLayer } from './layers/Mission/MissionsLabelsLayer/MissionsLabelsLayer'
import { SelectedMissionActionsLayer } from './layers/Mission/SelectedMissionActionsLayer'
import { SelectedMissionLayer } from './layers/Mission/SelectedMissionLayer'
import { RegulatoryLayers } from './layers/RegulatoryLayers'
import { RegulatoryLayerSearch } from './layers/RegulatoryLayerSearch'
import { RegulatoryPreviewLayer } from './layers/RegulatoryPreviewLayer'
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
import { MissionOverlay } from './overlays/MissionOverlay'
import { SelectedControlOverlay } from './overlays/SelectedControlOverlay'
import { SelectedMissionOverlay } from './overlays/SelectedMissionOverlay'
import { TrackTypeOverlay } from './overlays/TrackTypeOverlay'
import { VesselCardOverlay } from './overlays/VesselCardOverlay'
import VesselEstimatedPositionOverlay from './overlays/VesselEstimatedPositionOverlay'
import VesselTrackOverlay from './overlays/VesselTrackOverlay'
import { useIsSuperUser } from '../../hooks/authorization/useIsSuperUser'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

export function Map() {
  const isSuperUser = useIsSuperUser()
  const { areVesselsDisplayed, isMissionsLayerDisplayed } = useMainAppSelector(state => state.displayedComponent)
  const [shouldUpdateView, setShouldUpdateView] = useState(true)
  const [historyMoveTrigger, setHistoryMoveTrigger] = useState({})
  const [currentFeature, setCurrentFeature] = useState<Feature>()
  const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState<Object>({})
  const [handlePointerMoveEventPixel, setHandlePointerMoveEventPixel] = useState(null)

  const handleMovingAndZoom = () => {
    if (!shouldUpdateView) {
      setShouldUpdateView(true)
    }
    setHistoryMoveTrigger({ dummyUpdate: true })
    setMapMovingAndZoomEvent({ dummyUpdate: true })
  }

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
      setCurrentFeature={setCurrentFeature}
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
      {/** <></> can't be used to group condition as BaseMap needs the layers to be direct children * */}
      {isSuperUser && isMissionsLayerDisplayed && <MissionLayer />}
      {isSuperUser && <MissionsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />}
      {isSuperUser && <SelectedMissionLayer />}
      {isSuperUser && <MissionHoveredLayer feature={currentFeature} />}
      {isSuperUser && <MissionOverlay feature={currentFeature} />}
      {isSuperUser && <SelectedMissionOverlay />}
      {isSuperUser && <SelectedMissionActionsLayer />}
      {isSuperUser && <ControlOverlay feature={currentFeature} />}
      {isSuperUser && <SelectedControlOverlay />}
      <DrawLayer />
      <RegulatoryLayerSearch />
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
      <VesselCardOverlay feature={currentFeature} />
      <TrackTypeOverlay feature={currentFeature} pointerMoveEventPixel={handlePointerMoveEventPixel} />
      <VesselEstimatedPositionOverlay feature={currentFeature} pointerMoveEventPixel={handlePointerMoveEventPixel} />
      <VesselTrackOverlay feature={currentFeature} />
      {currentFeature && <LayerDetailsBox feature={currentFeature} />}
      <InterestPointLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      <RegulatoryPreviewLayer />
    </BaseMap>
  )
}
