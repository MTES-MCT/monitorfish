import React, { useState } from 'react'

import BaseMap from './BaseMap'
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
import VesselCardOverlay from './overlays/VesselCardOverlay'
import VesselTrackCardOverlay from './overlays/VesselTrackCardOverlay'
import { TrackTypeCardOverlay } from './overlays/TrackTypeCardOverlay'
import { MapVesselClickAndAnimationHandler } from './MapVesselClickAndAnimationHandler'
import VesselEstimatedPositionLayer from './layers/VesselEstimatedPositionLayer'
import VesselSelectedLayer from './layers/VesselSelectedLayer'
import VesselEstimatedPositionCardOverlay from './overlays/VesselEstimatedPositionCardOverlay'
import VesselsLabelsLayer from './layers/VesselsLabelsLayer'
import InterestPointLayer from './layers/InterestPointLayer'
import MapMenu from './MapMenu'
import VesselAlertLayer from './layers/VesselAlertLayer'
import VesselBeaconMalfunctionLayer from './layers/VesselBeaconMalfunctionLayer'
import VesselAlertAndBeaconMalfunctionLayer from './layers/VesselAlertAndBeaconMalfunctionLayer'
import VesselInfractionSuspicionLayer from './layers/VesselInfractionSuspicionLayer'

const Map = () => {
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
      // BaseMap forwards map & mapClickEvent as props to children
      handleMovingAndZoom={handleMovingAndZoom}
      handlePointerMove={handlePointerMove}
      setCurrentFeature={setCurrentFeature}
      showCoordinates={true}
      showAttributions={true}
      container={'map'}
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
      <VesselsLayer/>
      <FilterLayer/>
      <VesselsTracksLayerMemoized/>
      <VesselsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      <DrawLayer/>
      <RegulatoryLayerSearch/>
      <VesselEstimatedPositionLayer/>
      <VesselSelectedLayer/>
      <VesselAlertLayer/>
      <VesselBeaconMalfunctionLayer/>
      <VesselAlertAndBeaconMalfunctionLayer/>
      <VesselInfractionSuspicionLayer/>
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
