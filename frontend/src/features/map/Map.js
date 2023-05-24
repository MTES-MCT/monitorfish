import React, { useContext, useState } from 'react'

import { BaseMap } from './BaseMap'
import { LayerDetailsBox } from './controls/LayerDetailsBox'
import { VesselsTracksLayerMemoized } from './layers/Vessel/VesselsTracksLayer'
import { VesselsLayer } from './layers/Vessel/VesselsLayer'
import FilterLayer from './layers/FilterLayer'
import { RegulatoryLayerSearch } from './layers/RegulatoryLayerSearch'
import { DrawLayer } from './layers/DrawLayer'
import { BaseLayer } from './layers/BaseLayer'
import { RegulatoryLayers } from './layers/RegulatoryLayers'
import { AdministrativeLayers } from './layers/AdministrativeLayers'
import { RegulatoryPreviewLayer } from './layers/RegulatoryPreviewLayer'
import MeasurementLayer from './layers/MeasurementLayer'
import MapHistory from './MapHistory'
import { VesselCardOverlay } from './overlays/VesselCardOverlay'
import VesselTrackOverlay from './overlays/VesselTrackOverlay'
import { TrackTypeOverlay } from './overlays/TrackTypeOverlay'
import { MapVesselClickAndAnimationHandler } from './MapVesselClickAndAnimationHandler'
import VesselEstimatedPositionLayer from './layers/Vessel/VesselEstimatedPositionLayer'
import VesselSelectedLayer from './layers/Vessel/VesselSelectedLayer'
import VesselEstimatedPositionOverlay from './overlays/VesselEstimatedPositionOverlay'
import { VesselsLabelsLayer } from './layers/Vessel/VesselsLabelsLayer'
import InterestPointLayer from './layers/InterestPointLayer'
import MapMenu from './MapMenu'
import VesselAlertLayer from './layers/Vessel/VesselAlertLayer'
import VesselBeaconMalfunctionLayer from './layers/Vessel/VesselBeaconMalfunctionLayer'
import VesselAlertAndBeaconMalfunctionLayer from './layers/Vessel/VesselAlertAndBeaconMalfunctionLayer'
import VesselInfractionSuspicionLayer from './layers/Vessel/VesselInfractionSuspicionLayer'
import { MissionLayer } from './layers/Mission/MissionLayer'
import { SelectedMissionLayer } from './layers/Mission/SelectedMissionLayer'
import { MissionsLabelsLayer } from './layers/Mission/MissionsLabelsLayer/MissionsLabelsLayer'
import { MissionOverlay } from './overlays/MissionOverlay'
import { SelectedMissionOverlay } from './overlays/SelectedMissionOverlay'
import { MissionHoveredLayer } from './layers/Mission/HoveredMissionLayer'
import { SelectedMissionActionsLayer } from './layers/Mission/SelectedMissionActionsLayer'
import { ControlOverlay } from './overlays/ControlOverlay'
import { SelectedControlOverlay } from './overlays/SelectedControlOverlay'
import { useSelector } from 'react-redux'
import { AuthorizationContext } from '../../context/AuthorizationContext'

const Map = () => {
  const isSuperUser = useContext(AuthorizationContext)
  const { areVesselsDisplayed, isMissionsLayerDisplayed } = useSelector(state => state.displayedComponent)
  const [shouldUpdateView, setShouldUpdateView] = useState(true)
  const [historyMoveTrigger, setHistoryMoveTrigger] = useState({})
  const [currentFeature, setCurrentFeature] = useState(null)
  const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState(null)
  const [handlePointerMoveEventPixel, setHandlePointerMoveEventPixel] = useState(null)

  const handleMovingAndZoom = () => {
    if (!shouldUpdateView) {
      setShouldUpdateView(true)
    }
    setHistoryMoveTrigger({ dummyUpdate: true })
    setMapMovingAndZoomEvent({ dummyUpdate: true })
  }

  const handlePointerMove = (event) => {
    if (event) {
      setHandlePointerMoveEventPixel(event.pixel)
    }
  }

  return (
    <BaseMap
      // BaseMap forwards map as props to children
      handleMovingAndZoom={handleMovingAndZoom}
      handlePointerMove={handlePointerMove}
      setCurrentFeature={setCurrentFeature}
      showCoordinates={true}
      showAttributions={true}
      isMainApp
    >
      <BaseLayer />
      <RegulatoryLayers mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      <AdministrativeLayers />
      <MapVesselClickAndAnimationHandler/>
      <MapHistory
        shouldUpdateView={shouldUpdateView}
        setShouldUpdateView={setShouldUpdateView}
        historyMoveTrigger={historyMoveTrigger}
      />
      <MapMenu/>
      <MeasurementLayer/>
      <FilterLayer/>
      {/** <></> can't be used to group condition as BaseMap needs the layers to be direct children **/}
      {isSuperUser && isMissionsLayerDisplayed && <MissionLayer/>}
      {isSuperUser && <MissionsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>}
      {isSuperUser && <SelectedMissionLayer feature={currentFeature}/>}
      {isSuperUser && <MissionHoveredLayer feature={currentFeature}/>}
      {isSuperUser && <MissionOverlay feature={currentFeature}/>}
      {isSuperUser && <SelectedMissionOverlay/>}
      {isSuperUser && <SelectedMissionActionsLayer/>}
      {isSuperUser && <ControlOverlay feature={currentFeature}/>}
      {isSuperUser && <SelectedControlOverlay/>}
      <DrawLayer/>
      <RegulatoryLayerSearch/>
      <VesselsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      {/** <></> can't be used to group condition as BaseMap needs the layers to be direct children **/}
      {<VesselsLayer/>}
      {areVesselsDisplayed && <VesselEstimatedPositionLayer/>}
      {areVesselsDisplayed && <VesselSelectedLayer/>}
      {areVesselsDisplayed && <VesselAlertLayer/>}
      {areVesselsDisplayed && <VesselBeaconMalfunctionLayer/>}
      {areVesselsDisplayed && <VesselAlertAndBeaconMalfunctionLayer/>}
      {areVesselsDisplayed && <VesselInfractionSuspicionLayer/>}
      {<VesselsTracksLayerMemoized/>}
      <VesselCardOverlay feature={currentFeature}/>
      <TrackTypeOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselEstimatedPositionOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselTrackOverlay feature={currentFeature}/>
      {currentFeature && <LayerDetailsBox feature={currentFeature}/>}
      <InterestPointLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      <RegulatoryPreviewLayer />
    </BaseMap>
  )
}

export default Map
