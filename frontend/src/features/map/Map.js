import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import AdministrativeLayers from '../../layers/AdministrativeLayers'
import BaseLayer from '../../layers/BaseLayer'
import DrawLayer from '../../layers/DrawLayer'
import FilterLayer from '../../layers/FilterLayer'
import VesselTrackCardOverlay from './overlays/VesselTrackCardOverlay'
import TrackTypeCardOverlay from './overlays/TrackTypeCardOverlay'
import MapVesselClickAndAnimationHandler from './MapVesselClickAndAnimationHandler'
import VesselEstimatedPositionLayer from '../../layers/VesselEstimatedPositionLayer'
import VesselSelectedLayer from '../../layers/VesselSelectedLayer'
import VesselEstimatedPositionCardOverlay from './overlays/VesselEstimatedPositionCardOverlay'
import VesselsLabelsLayer from '../../layers/VesselsLabelsLayer'
import InterestPointLayer from '../../layers/InterestPointLayer'
import MeasurementLayer from '../../layers/MeasurementLayer'
import RegulatoryLayers from '../../layers/RegulatoryLayers'
import RegulatoryPreviewLayer from '../../layers/RegulatoryPreviewLayer'
import VesselAlertAndBeaconMalfunctionLayer from '../../layers/VesselAlertAndBeaconMalfunctionLayer'
import VesselAlertLayer from '../../layers/VesselAlertLayer'
import VesselBeaconMalfunctionLayer from '../../layers/VesselBeaconMalfunctionLayer'
import VesselInfractionSuspicionLayer from '../../layers/VesselInfractionSuspicionLayer'
import VesselsLayer from '../../layers/VesselsLayer'
import VesselsTracksLayer from '../../layers/VesselsTracksLayer'
import BaseMap from './BaseMap'
import LayerDetailsBox from './controls/LayerDetailsBox'
import MapHistory from './MapHistory'
import MapMenu from './MapMenu'
import VesselCardOverlay from './overlays/VesselCardOverlay'
import ShowRegulatoryMetadata from './ShowRegulatoryMetadata'

function Map() {
  const gears = useSelector(state => state.gear.gears)
  const adminRole = useSelector(state => state.global.adminRole)

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

  const handlePointerMove = event => {
    if (event) {
      setHandlePointerMoveEventPixel(event.pixel)
    }
  }

  return (
    <BaseMap
      // BaseMap forwards map & mapClickEvent as props to children
      container="map"
      handleMovingAndZoom={handleMovingAndZoom}
      handlePointerMove={handlePointerMove}
      setCurrentFeature={setCurrentFeature}
      showAttributions
      showCoordinates
    >
      <BaseLayer />
      <RegulatoryLayers mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      <AdministrativeLayers />
      <ShowRegulatoryMetadata hasClickEvent />
      <MapVesselClickAndAnimationHandler hasClickEvent />
      <MapHistory
        historyMoveTrigger={historyMoveTrigger}
        setShouldUpdateView={setShouldUpdateView}
        shouldUpdateView={shouldUpdateView}
      />
      <MapMenu />
      <MeasurementLayer />
      <VesselsLayer />
      <FilterLayer />
      <VesselsTracksLayer />
      <VesselsLabelsLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      <DrawLayer />
      <VesselEstimatedPositionLayer />
      <VesselSelectedLayer />
      <VesselAlertLayer adminRole={adminRole} />
      <VesselBeaconMalfunctionLayer adminRole={adminRole} />
      <VesselAlertAndBeaconMalfunctionLayer adminRole={adminRole} />
      <VesselInfractionSuspicionLayer adminRole={adminRole} />
      <VesselCardOverlay feature={currentFeature} />
      <TrackTypeCardOverlay feature={currentFeature} pointerMoveEventPixel={handlePointerMoveEventPixel} />
      <VesselEstimatedPositionCardOverlay
        feature={currentFeature}
        pointerMoveEventPixel={handlePointerMoveEventPixel}
      />
      <VesselTrackCardOverlay feature={currentFeature} />
      <LayerDetailsBox feature={currentFeature} gears={gears} />
      <InterestPointLayer mapMovingAndZoomEvent={mapMovingAndZoomEvent} />
      <RegulatoryPreviewLayer />
    </BaseMap>
  )
}

export default Map
