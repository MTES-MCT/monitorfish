import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import OpenLayerMap from 'ol/Map'
import View from 'ol/View'
import { transform } from 'ol/proj'
import LayersEnum from '../domain/entities/layers'
import MapCoordinatesBox from '../components/map/MapCoordinatesBox'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import MapAttributionsBox from '../components/map/MapAttributionsBox'
import VesselCard from '../components/cards/VesselCard'
import VesselTrackCard from '../components/cards/VesselTrackCard'
import showVesselTrackAndSidebar from '../domain/use_cases/showVesselTrackAndSidebar'
import { useDispatch, useSelector } from 'react-redux'
import { hideVesselNames, isMoving, resetAnimateToRegulatoryLayer, resetAnimateToVessel } from '../domain/reducers/Map'
import { COLORS } from '../constants/constants'
import showRegulatoryZoneMetadata from '../domain/use_cases/showRegulatoryZoneMetadata'
import LayerDetailsBox from '../components/map/LayerDetailsBox'
import { getVesselFeatureAndIdentity, getVesselIdentityFromFeature } from '../domain/entities/vessel'
import ScaleLine from 'ol/control/ScaleLine'
import VesselTrackLayer from '../layers/VesselTrackLayer'
import VesselsLayer, { MIN_ZOOM_VESSEL_NAMES } from '../layers/VesselsLayer'
import BaseLayer from '../layers/BaseLayer'
import DrawLayer from '../layers/DrawLayer'
import RegulatoryLayers from '../layers/RegulatoryLayers'
import { getCoordinates } from '../utils'
import AdministrativeLayers from '../layers/AdministrativeLayers'
import TrackTypeCard from '../components/cards/TrackTypeCard'
import { trackTypes } from '../domain/entities/vesselTrack'
import { getOverlays, trackTypeCardID, vesselCardID, vesselTrackCardID } from '../components/overlays/overlays'
import MapHistory from './MapHistory'
import Zoom from 'ol/control/Zoom'
import MeasurementLayer from '../layers/MeasurementLayer'

let lastEventForPointerMove, timeoutForPointerMove, timeoutForMove
const hitPixelTolerance = 3

const Map = ({ isBackOffice }) => {
  const gears = useSelector(state => state.gear.gears)
  const vessel = useSelector(state => state.vessel)
  const mapState = useSelector(state => state.map)
  const dispatch = useDispatch()

  const [map, setMap] = useState()
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldUpdateView, setShouldUpdateView] = useState(true)
  const [initRenderIsDone, setInitRenderIsDone] = useState(false)
  const [cursorCoordinates, setCursorCoordinates] = useState('')
  const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
  const [trackTypeToShowOnCard, setTrackTypeToShowOnCard] = useState(null)
  const [regulatoryFeatureToShowOnCard, setRegulatoryFeatureToShowOnCard] = useState(null)
  const [historyMoveTrigger, setHistoryMoveTrigger] = useState({})
  const mapElement = useRef()
  const mapRef = useRef()
  mapRef.current = map

  useEffect(() => {
    initMap()
  }, [mapState.selectedBaseLayer])

  useEffect(() => {
    animateToRegulatoryLayer()
  }, [mapState.animateToRegulatoryLayer, map])

  useEffect(() => {
    animateToVessel()
  }, [mapState.animateToVessel, map, vessel.vesselSidebarIsOpen, vessel.selectedVesselFeatureAndIdentity])

  function initMap () {
    if (!map) {
      const { vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay } = getOverlays()
      const centeredOnFrance = [2.99049, 46.82801]
      const initialMap = new OpenLayerMap({
        target: mapElement.current,
        layers: [],
        renderer: (['webgl', 'canvas']),
        overlays: [vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay],
        view: new View({
          projection: OPENLAYERS_PROJECTION,
          center: transform(centeredOnFrance, WSG84_PROJECTION, OPENLAYERS_PROJECTION),
          zoom: 6,
          minZoom: 3
        }),
        units: 'm',
        controls: [
          new ScaleLine({ units: 'nautical' }),
          new Zoom({
            className: 'zoom'
          })
        ]
      })

      initialMap.on('click', handleMapClick)
      initialMap.on('pointermove', event => throttleAndHandlePointerMove(
        event,
        vesselCardOverlay,
        vesselTrackCardOverlay,
        trackTypeCardOverlay))
      initialMap.on('moveend', () => throttleAndHandleMovingAndZoom())

      setMap(initialMap)

      // Wait 15 seconds to not apply any animate() before this init phase
      setTimeout(() => {
        setInitRenderIsDone(true)
      }, 15000)
    }
  }

  function throttleAndHandleMovingAndZoom () {
    if (timeoutForMove) {
      return
    }

    timeoutForMove = setTimeout(() => {
      timeoutForMove = null
      handleMovingAndZoom()
    }, 100)
  }

  function throttleAndHandlePointerMove (event, vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay) {
    if (event.dragging || timeoutForPointerMove) {
      if (timeoutForPointerMove) {
        lastEventForPointerMove = event
      }
      return
    }

    timeoutForPointerMove = setTimeout(() => {
      timeoutForPointerMove = null
      handlePointerMove(lastEventForPointerMove, vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay)
    }, 100)
  }

  function animateToRegulatoryLayer () {
    if (map && mapState.animateToRegulatoryLayer && mapState.animateToRegulatoryLayer.center && !isAnimating && initRenderIsDone) {
      if (map.getView().getZoom() < 8) {
        setIsAnimating(true)
        map.getView().animate({
          center: [
            mapState.animateToRegulatoryLayer.center[0],
            mapState.animateToRegulatoryLayer.center[1]
          ],
          duration: 1000,
          zoom: 8
        }, () => {
          setIsAnimating(false)
          dispatch(resetAnimateToRegulatoryLayer())
        })
      } else {
        setIsAnimating(true)
        map.getView().animate({
          center: [
            mapState.animateToRegulatoryLayer.center[0],
            mapState.animateToRegulatoryLayer.center[1]
          ],
          duration: 1000
        }, () => {
          setIsAnimating(false)
          dispatch(resetAnimateToRegulatoryLayer())
        })
      }
    }
  }

  function animateToVessel () {
    if (map && mapState.animateToVessel && vessel.selectedVesselFeatureAndIdentity && vessel.vesselSidebarIsOpen) {
      if (map.getView().getZoom() >= 8) {
        const resolution = map.getView().getResolution()
        map.getView().animate({
          center: [
            mapState.animateToVessel.getGeometry().getCoordinates()[0] + (resolution * 200),
            mapState.animateToVessel.getGeometry().getCoordinates()[1]
          ],
          duration: 1000,
          zoom: undefined
        })
      } else {
        map.getView().animate({
          center: [
            mapState.animateToVessel.getGeometry().getCoordinates()[0],
            mapState.animateToVessel.getGeometry().getCoordinates()[1]
          ],
          duration: 800,
          zoom: 8
        }, () => {
          const resolution = map.getView().getResolution()
          map.getView().animate({
            center: [
              mapState.animateToVessel.getGeometry().getCoordinates()[0] + (resolution * 200),
              mapState.animateToVessel.getGeometry().getCoordinates()[1]
            ],
            duration: 500,
            zoom: undefined
          })
        })
      }

      dispatch(resetAnimateToVessel())
    }
  }

  function isVesselNameMinimumZoom () {
    return mapRef.current && mapRef.current.getView().getZoom() > MIN_ZOOM_VESSEL_NAMES
  }

  function isVesselNameMaximumZoom () {
    return mapRef.current && mapRef.current.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES
  }

  const handleMovingAndZoom = () => {
    dispatch(isMoving())
    if (!shouldUpdateView) {
      setShouldUpdateView(true)
    }
    setHistoryMoveTrigger({ dummyUpdate: true })

    if (isVesselNameMinimumZoom()) {
      dispatch(hideVesselNames(false))
    } else if (isVesselNameMaximumZoom()) {
      dispatch(hideVesselNames(true))
    }
  }

  const handleMapClick = event => {
    const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => feature, { hitTolerance: hitPixelTolerance })

    if (feature && feature.getId() && feature.getId().toString().includes(LayersEnum.VESSELS.code)) {
      const vessel = getVesselIdentityFromFeature(feature)
      dispatch(showVesselTrackAndSidebar(getVesselFeatureAndIdentity(feature, vessel), false, false))
    } else if (feature && feature.getId() && feature.getId().toString().includes(LayersEnum.REGULATORY.code)) {
      const zone = {
        layerName: feature.getProperties().layer_name,
        zone: feature.getProperties().zones
      }
      dispatch(showRegulatoryZoneMetadata(zone))
    }
  }

  const handlePointerMove = (event, vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay) => {
    if (event) {
      const pixel = mapRef.current.getEventPixel(event.originalEvent)
      const feature = mapRef.current.forEachFeatureAtPixel(pixel, feature => feature, { hitTolerance: hitPixelTolerance })

      showPointerAndCardIfVessel(feature, mapRef.current.getCoordinateFromPixel(event.pixel), vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay)
      showCoordinatesInDMS(event)
    }
  }

  function showPointerAndCardIfVessel (feature, coordinates, vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay) {
    if (feature && feature.getId() && feature.getId().toString().includes(LayersEnum.VESSELS.code)) {
      setVesselFeatureToShowOnCard(feature)

      document.getElementById(vesselCardID).style.display = 'block'
      document.getElementById(vesselTrackCardID).style.display = 'none'
      document.getElementById(trackTypeCardID).style.display = 'none'

      vesselCardOverlay.setPosition(feature.getGeometry().getCoordinates())
      mapRef.current.getTarget().style.cursor = 'pointer'
    } else if (feature && feature.getId() && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:position`)) {
      setVesselFeatureToShowOnCard(feature)

      document.getElementById(vesselTrackCardID).style.display = 'block'
      document.getElementById(vesselCardID).style.display = 'none'
      document.getElementById(trackTypeCardID).style.display = 'none'

      mapRef.current.getTarget().style.cursor = 'pointer'
      vesselTrackCardOverlay.setPosition(feature.getGeometry().getCoordinates())
    } else if (feature && feature.getId() && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:line`)) {
      setTrackTypeToShowOnCard(feature.getProperties().trackType)

      document.getElementById(trackTypeCardID).style.display = 'block'
      document.getElementById(vesselTrackCardID).style.display = 'none'
      document.getElementById(vesselCardID).style.display = 'none'

      mapRef.current.getTarget().style.cursor = 'pointer'
      trackTypeCardOverlay.setPosition(coordinates)
    } else if (feature && feature.getId() && feature.getId().toString().includes(`${LayersEnum.REGULATORY.code}`)) {
      setRegulatoryFeatureToShowOnCard(feature)

      mapRef.current.getTarget().style.cursor = 'pointer'
    } else {
      document.getElementById(vesselCardID).style.display = 'none'
      document.getElementById(vesselTrackCardID).style.display = 'none'
      document.getElementById(trackTypeCardID).style.display = 'none'

      setVesselFeatureToShowOnCard(null)
      setRegulatoryFeatureToShowOnCard(null)
      setTrackTypeToShowOnCard(null)
      if (mapRef.current.getTarget().style) {
        mapRef.current.getTarget().style.cursor = ''
      }
    }
  }

  function showCoordinatesInDMS (event) {
    const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel)
    const coordinates = getCoordinates(clickedCoordinates, OPENLAYERS_PROJECTION)
    setCursorCoordinates(`${coordinates[0]} ${coordinates[1]}`)
  }

  return (
        <div>
            <MapContainer ref={mapElement} />
            {isBackOffice === null && <MapHistory
              map={map}
              mapRef={mapRef}
              shouldUpdateView={shouldUpdateView}
              setShouldUpdateView={setShouldUpdateView}
              historyMoveTrigger={historyMoveTrigger}
            />}
            <BaseLayer map={map} />
            <VesselTrackLayer map={map} />
            <VesselsLayer map={map} mapRef={mapRef}/>
            <DrawLayer map={map} />
            <MeasurementLayer map={map} />
            <RegulatoryLayers map={map} />
            <AdministrativeLayers map={map} />

            <VesselCardOverlay id={vesselCardID}>
                {
                    vesselFeatureToShowOnCard ? <VesselCard vessel={vesselFeatureToShowOnCard} /> : null
                }
            </VesselCardOverlay>
            <VesselTrackCardOverlay id={vesselTrackCardID}>
                {
                    vesselFeatureToShowOnCard ? <VesselTrackCard vessel={vesselFeatureToShowOnCard} /> : null
                }
            </VesselTrackCardOverlay>
            <TrackTypeCardOverlay id={trackTypeCardID} isBig={trackTypeToShowOnCard === trackTypes.SEARCHING}>
                {
                    trackTypeToShowOnCard ? <TrackTypeCard isBig={trackTypeToShowOnCard === trackTypes.SEARCHING} trackType={trackTypeToShowOnCard} /> : null
                }
            </TrackTypeCardOverlay>
            <MapCoordinatesBox coordinates={cursorCoordinates}/>
            {
                regulatoryFeatureToShowOnCard ? <LayerDetailsBox gears={gears} regulatory={regulatoryFeatureToShowOnCard}/> : null
            }

            <MapAttributionsBox />
        </div>
  )
}

const VesselCardOverlay = styled.div`
  position: absolute;
  top: -277px;
  left: -185px;
  width: 387px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 200;
`

const VesselTrackCardOverlay = styled.div`
  position: absolute;
  top: -170px;
  left: -175px;
  width: 350px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 300;
`

const TrackTypeCardOverlay = styled.div`
  position: absolute;
  top: -39px;
  left: ${props => props.isBig ? '-170px' : '-100px'};
  width: ${props => props.isBig ? '340px' : '200px'};;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 2px;
  z-index: 100;
`

const MapContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default Map
