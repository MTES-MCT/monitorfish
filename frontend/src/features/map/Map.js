import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import BaseMap from './BaseMap'
import LayerDetailsBox from './controls/LayerDetailsBox'
import VesselsTracksLayer from '../../layers/VesselsTracksLayer'
import VesselsLayer from '../../layers/VesselsLayer'
import DrawLayer from '../../layers/DrawLayer'
import BaseLayer from '../../layers/BaseLayer'
import RegulatoryLayers from '../../layers/RegulatoryLayers'
import AdministrativeLayers from '../../layers/AdministrativeLayers'
import ShowRegulatoryMetadata from './ShowRegulatoryMetadata'
import RegulatoryPreviewLayer from '../../layers/RegulatoryPreviewLayer'
import MeasurementLayer from '../../layers/MeasurementLayer'
import MapHistory from './MapHistory'
import VesselCardOverlay from './overlays/VesselCardOverlay'
import VesselTrackCardOverlay from './overlays/VesselTrackCardOverlay'
import TrackTypeCardOverlay from './overlays/TrackTypeCardOverlay'
import MapVesselClickAndAnimationHandler from './MapVesselClickAndAnimationHandler'
import VesselEstimatedPositionLayer from '../../layers/VesselEstimatedPositionLayer'
import VesselSelectedLayer from '../../layers/VesselSelectedLayer'
import VesselEstimatedPositionCardOverlay from './overlays/VesselEstimatedPositionCardOverlay'
import VesselsLabelsLayer from '../../layers/VesselsLabelsLayer'
import InterestPointLayer from '../../layers/InterestPointLayer'
import MapMenu from './MapMenu'

const Map = () => {
  const gears = useSelector(state => state.gear.gears)

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
      <ShowRegulatoryMetadata />
      <MapVesselClickAndAnimationHandler
        mapMovingAndZoomEvent={mapMovingAndZoomEvent}
      />
      <MapHistory
        shouldUpdateView={shouldUpdateView}
        setShouldUpdateView={setShouldUpdateView}
        historyMoveTrigger={historyMoveTrigger}
      />
      <MapMenu/>
      <MeasurementLayer/>
      <VesselsLayer/>
      <VesselsTracksLayer/>
      <VesselsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      <DrawLayer/>
      <VesselEstimatedPositionLayer/>
      <VesselSelectedLayer/>
      <VesselCardOverlay feature={currentFeature}/>
      <TrackTypeCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselEstimatedPositionCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselTrackCardOverlay feature={currentFeature}/>
      <LayerDetailsBox gears={gears} feature={currentFeature}/>
      <InterestPointLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent}/>
      <RegulatoryPreviewLayer />
    </BaseMap>
  )
}

export default Map
