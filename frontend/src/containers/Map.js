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
console.log('HIT_PIXEL_TO_TOLERANCE ' + HIT_PIXEL_TO_TOLERANCE)

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
      const pixel = map.getEventPixel(event.originalEvent)
      const feature = map.forEachFeatureAtPixel(pixel, feature => feature, { hitTolerance: HIT_PIXEL_TO_TOLERANCE })
      setHandlePointerMoveEventPixel(event.pixel)
      if (feature && feature.getId()) {
        setCurrentFeature(feature)
        map.getTarget().style.cursor = 'pointer'
      } else if (map.getTarget().style) {
        map.getTarget().style.cursor = ''
        setCurrentFeature(null)
      }
    }
  }

  return (
        <BaseMap
          handleMovingAndZoom={handleMovingAndZoom}
          handlePointerMove={handlePointerMove}
          showCoordinates={true}
        >
            <MapVesselAnimation
              mapMovingAndZoomEvent={mapMovingAndZoomEvent}
            />
            <MapHistory
              shouldUpdateView={shouldUpdateView}
              setShouldUpdateView={setShouldUpdateView}
              historyMoveTrigger={historyMoveTrigger}/>
            <MeasurementLayer />
            <VesselTrackLayer />
            <VesselsLayer />
            <DrawLayer />
            <VesselCardOverlay feature={currentFeature} />
            <TrackTypeCardOverlay pointerMoveEventPixel={handlePointerMoveEventPixel} feature={currentFeature} />
            <VesselTrackCardOverlay feature={currentFeature} />
            <LayerDetailsBox gears={gears} feature={currentFeature} />
        </BaseMap>
  )
}

export default Map
