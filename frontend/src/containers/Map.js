import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isMoving } from '../domain/reducers/Map'

import BaseMap from './BaseMap'
import LayerDetailsBox from '../components/map/LayerDetailsBox'
import VesselTrackLayer from '../layers/VesselTrackLayer'
import VesselsLayer from '../layers/VesselsLayer'
import DrawLayer from '../layers/DrawLayer'
import MapHistory from './MapHistory'
import MeasurementLayer from '../layers/MeasurementLayer'
import VesselCardOverlay from '../components/overlays/VesselCardOverlay'
import VesselTrackCardOverlay from '../components/overlays/VesselTrackCardOverlay'
import TrackTypeCardOverlay from '../components/overlays/TrackTypeCardOverlay'
import MapVesselAnimation from '../components/map/MapVesselAnimation'
import { HIT_PIXEL_TO_TOLERANCE } from '../constants/constants'
import VesselEstimatedPositionLayer from '../layers/VesselEstimatedPositionLayer'
import VesselEstimatedPositionCardOverlay from '../components/overlays/VesselEstimatedPositionCardOverlay'

const Map = () => {
  const gears = useSelector(state => state.gear.gears)
  const dispatch = useDispatch()

  const [shouldUpdateView, setShouldUpdateView] = useState(true)
  const [historyMoveTrigger, setHistoryMoveTrigger] = useState({})
  const [currentFeature, setCurrentFeature] = useState(null)
  const [mapMovingAndZoomEvent, setMapMovingAndZoomEvent] = useState(null)
  const [handlePointerMoveEventPixel, setHandlePointerMoveEventPixel] = useState(null)

  const handleMovingAndZoom = () => {
    dispatch(isMoving())
    if (!shouldUpdateView) {
      setShouldUpdateView(true)
    }
    setHistoryMoveTrigger({ dummyUpdate: true })
    setMapMovingAndZoomEvent({ dummyUpdate: true })
  }

  const handlePointerMove = (event, map) => {
    if (event && map) {
      setHandlePointerMoveEventPixel(event.pixel)
    }
  }

  return (
    <BaseMap
      handleMovingAndZoom={handleMovingAndZoom}
      handlePointerMove={handlePointerMove}
      setCurrentFeature={setCurrentFeature}
      showCoordinates={true}
      showAttributions={true}
    >
      <MapVesselAnimation
        mapMovingAndZoomEvent={mapMovingAndZoomEvent}
      />
      <MapHistory
        shouldUpdateView={shouldUpdateView}
        setShouldUpdateView={setShouldUpdateView}
        historyMoveTrigger={historyMoveTrigger}/>
      <MeasurementLayer/>
      <VesselTrackLayer/>
      <VesselsLayer/>
      <DrawLayer/>
      <VesselEstimatedPositionLayer/>
      <VesselCardOverlay feature={currentFeature}/>
      <TrackTypeCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselEstimatedPositionCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature}/>
      <VesselTrackCardOverlay feature={currentFeature}/>
      <LayerDetailsBox gears={gears} feature={currentFeature}/>
    </BaseMap>
  )
}

export default Map
