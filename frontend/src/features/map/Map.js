import React, { useState } from 'react'

import { BaseMap } from './BaseMap'
import { LayerDetailsBox } from './controls/LayerDetailsBox'
import { VesselsTracksLayerMemoized } from './layers/VesselsTracksLayer'
import VesselsLayer from './layers/VesselsLayer'
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
import VesselTrackCardOverlay from './overlays/VesselTrackCardOverlay'
import { TrackTypeCardOverlay } from './overlays/TrackTypeCardOverlay'
import { MapVesselClickAndAnimationHandler } from './MapVesselClickAndAnimationHandler'
import VesselEstimatedPositionLayer from './layers/VesselEstimatedPositionLayer'
import VesselSelectedLayer from './layers/VesselSelectedLayer'
import VesselEstimatedPositionCardOverlay from './overlays/VesselEstimatedPositionCardOverlay'
import { VesselsLabelsLayer } from './layers/VesselsLabelsLayer'
import InterestPointLayer from './layers/InterestPointLayer'
import MapMenu from './MapMenu'
import VesselAlertLayer from './layers/VesselAlertLayer'
import VesselBeaconMalfunctionLayer from './layers/VesselBeaconMalfunctionLayer'
import VesselAlertAndBeaconMalfunctionLayer from './layers/VesselAlertAndBeaconMalfunctionLayer'
import VesselInfractionSuspicionLayer from './layers/VesselInfractionSuspicionLayer'
import { MissionLayer } from './layers/Mission/MissionLayer'
import { SelectedMissionLayer } from './layers/Mission/SelectedMissionLayer'
import { MissionsLabelsLayer } from './layers/Mission/MissionsLabelsLayer/MissionsLabelsLayer'
import { MissionOverlay } from './overlays/MissionOverlay'
import { SelectedMissionOverlay } from './overlays/SelectedMissionOverlay'
import { MissionHoveredLayer } from './layers/Mission/HoveredMissionLayer'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { SelectedMissionActionsLayer } from './layers/Mission/SelectedMissionActionsLayer'
import { ControlOverlay } from './overlays/ControlOverlay'
import { SelectedControlOverlay } from './overlays/SelectedControlOverlay'
import { getEnvironmentVariable } from '../../api/utils'
import { useSelector } from 'react-redux'

const IS_DEV_ENV = getEnvironmentVariable('REACT_APP_IS_DEV_ENV')

const Map = () => {
  const { isAdmin } = useMainAppSelector(state => state.global)
  const { areVesselsDisplayed } = useSelector(state => state.displayedComponent)
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
      {IS_DEV_ENV && isAdmin && <MissionLayer/>}
      {IS_DEV_ENV && isAdmin && <SelectedMissionLayer feature={currentFeature}/>}
      {IS_DEV_ENV && isAdmin && <MissionHoveredLayer feature={currentFeature}/>}
      {IS_DEV_ENV && isAdmin && <MissionsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>}
      {IS_DEV_ENV && isAdmin && <MissionOverlay feature={currentFeature}/>}
      {IS_DEV_ENV && isAdmin && <SelectedMissionOverlay/>}
      {IS_DEV_ENV && isAdmin && <SelectedMissionActionsLayer/>}
      {IS_DEV_ENV && isAdmin && <ControlOverlay feature={currentFeature}/>}
      {IS_DEV_ENV && isAdmin && <SelectedControlOverlay/>}
      <DrawLayer/>
      <RegulatoryLayerSearch/>
      <VesselsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      {/** <></> can't be used to group condition as BaseMap needs the layers to be direct children **/}
      {areVesselsDisplayed && <VesselsLayer/>}
      {areVesselsDisplayed && <VesselsTracksLayerMemoized/>}
      {areVesselsDisplayed && <VesselEstimatedPositionLayer/>}
      {areVesselsDisplayed && <VesselSelectedLayer/>}
      {areVesselsDisplayed && <VesselAlertLayer/>}
      {areVesselsDisplayed && <VesselBeaconMalfunctionLayer/>}
      {areVesselsDisplayed && <VesselAlertAndBeaconMalfunctionLayer/>}
      {areVesselsDisplayed && <VesselInfractionSuspicionLayer/>}
      <VesselCardOverlay feature={currentFeature}/>
      <TrackTypeCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselEstimatedPositionCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselTrackCardOverlay feature={currentFeature}/>
      {currentFeature && <LayerDetailsBox feature={currentFeature}/>}
      <InterestPointLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      <RegulatoryPreviewLayer />
    </BaseMap>
  )
}

export default Map
