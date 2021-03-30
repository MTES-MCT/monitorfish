import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Map from 'ol/Map'
import View from 'ol/View'
import { transform } from 'ol/proj'
import LayersEnum from '../domain/entities/layers'
import MapCoordinatesBox from '../components/MapCoordinatesBox'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import MapAttributionsBox from '../components/MapAttributionsBox'
import Overlay from 'ol/Overlay'
import VesselCard from '../components/VesselCard'
import VesselTrackCard from '../components/VesselTrackCard'
import showVesselTrackAndSidebar from '../domain/use_cases/showVesselTrackAndSidebar'
import { useDispatch, useSelector } from 'react-redux'
import {
    hideVesselNames,
    isMoving,
    resetAnimateToRegulatoryLayer,
    resetAnimateToVessel,
    setView
} from '../domain/reducers/Map'
import { COLORS } from '../constants/constants'
import showRegulatoryZoneMetadata from '../domain/use_cases/showRegulatoryZoneMetadata'
import LayerDetailsBox from '../components/LayerDetailsBox'
import { getVesselFeatureAndIdentity, getVesselIdentityFromFeature } from '../domain/entities/vessel'
import ScaleLine from 'ol/control/ScaleLine'
import VesselTrackLayer from '../layers/VesselTrackLayer'
import VesselsLayer, { MIN_ZOOM_VESSEL_NAMES } from '../layers/VesselsLayer'
import BaseLayer from '../layers/BaseLayer'
import DrawLayer from '../layers/DrawLayer'
import RegulatoryLayers from '../layers/RegulatoryLayers'
import { getCoordinates } from '../utils'
import AdministrativeLayers from '../layers/AdministrativeLayers'

const vesselCardID = 'vessel-card';
const vesselTrackCardID = 'vessel-track-card';
let lastEventForPointerMove, timeoutForPointerMove, timeoutForMove;
const hitPixelTolerance = 3;

const MapWrapper = () => {
    const gears = useSelector(state => state.gear.gears)
    const vessel = useSelector(state => state.vessel)
    const mapState = useSelector(state => state.map)
    const dispatch = useDispatch()

    const [map, setMap] = useState()
    const [isAnimating, setIsAnimating] = useState(false)
    const [initRenderIsDone, setInitRenderIsDone] = useState(false)
    const [shouldUpdateView, setShouldUpdateView] = useState(true)
    const [cursorCoordinates, setCursorCoordinates] = useState('')
    const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
    const [regulatoryFeatureToShowOnCard, setRegulatoryFeatureToShowOnCard] = useState(null)
    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    window.addEventListener('popstate', event => {
        if (event.state === null) {
            return
        }

        if(mapRef.current) {
            mapRef.current.getView().setCenter(event.state.center)
            mapRef.current.getView().setZoom(event.state.zoom)
            setShouldUpdateView(false)
        }
    });

    useEffect(() => {
        if(!map) {
            const vesselCardOverlay = new Overlay({
                element: document.getElementById(vesselCardID),
                autoPan: true,
                autoPanAnimation: {
                    duration: 400,
                },
                className: 'ol-overlay-container ol-selectable'
            });

            const vesselTrackCardOverlay = new Overlay({
                element: document.getElementById(vesselTrackCardID),
                autoPan: true,
                autoPanAnimation: {
                    duration: 400,
                },
                className: 'ol-overlay-container ol-selectable'
            });

            const centeredOnFrance = [2.99049, 46.82801];
            const initialMap = new Map({
                target: mapElement.current,
                layers: [],
                renderer: (['webgl', 'canvas']),
                overlays: [vesselCardOverlay, vesselTrackCardOverlay],
                view: new View({
                    projection: OPENLAYERS_PROJECTION,
                    center: transform(centeredOnFrance, WSG84_PROJECTION, OPENLAYERS_PROJECTION),
                    zoom: 6,
                    minZoom: 3
                }),
                controls: [new ScaleLine({units: 'nautical'})],
            })

            if(window.location.hash !== '') {
                let hash = window.location.hash.replace('@', '');
                let viewParts = hash.split(',');
                if (viewParts.length === 3 && !Number.isNaN(viewParts[0]) && !Number.isNaN(viewParts[1]) && !Number.isNaN(viewParts[2])) {
                    initialMap.getView().setCenter([parseFloat(viewParts[0]), parseFloat(viewParts[1])]);
                    initialMap.getView().setZoom(parseFloat(viewParts[2]));
                }
            } else if(mapState) {
                if(mapState.view && mapState.view.center && mapState.view.center[0] && mapState.view.center[1] && mapState.view.zoom) {
                    initialMap.getView().setCenter(mapState.view.center);
                    initialMap.getView().setZoom(mapState.view.zoom);
                }
            }

            initialMap.on('click', handleMapClick)
            initialMap.on('pointermove', event => {
                if (event.dragging || timeoutForPointerMove) {
                    if(timeoutForPointerMove) {
                        lastEventForPointerMove = event
                    }
                    return;
                }

                timeoutForPointerMove = setTimeout(() => {
                    timeoutForPointerMove = null;
                    handlePointerMove(lastEventForPointerMove, vesselCardOverlay, vesselTrackCardOverlay)
                }, 100);
            })
            initialMap.on('moveend', event => {
                if (timeoutForMove) {
                    return;
                }

                timeoutForMove = setTimeout(() => {
                    timeoutForMove = null;
                    handleMovingAndZoom()
                }, 100);
            })

            setMap(initialMap)

            // Wait 8 seconds to not apply any animate() before this init phase
            setTimeout(() => {
                setInitRenderIsDone(true)
            }, 8000)
        }
    }, [mapState.selectedBaseLayer])

    useEffect(() => {
        if (map && mapState.animateToRegulatoryLayer && mapState.animateToRegulatoryLayer.center && !isAnimating && initRenderIsDone) {
            if(map.getView().getZoom() < 8) {
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
                    duration: 1000,
                }, () => {
                    setIsAnimating(false)
                    dispatch(resetAnimateToRegulatoryLayer())
                })
            }
        }
    }, [mapState.animateToRegulatoryLayer, map])

    useEffect(() => {
        if (map && mapState.animateToVessel && vessel.selectedVesselFeatureAndIdentity && vessel.vesselSidebarIsOpen) {
            if(map.getView().getZoom() >= 8) {
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
                });
            }

            dispatch(resetAnimateToVessel())
        }
    }, [mapState.animateToVessel, map, vessel.vesselSidebarIsOpen, vessel.selectedVesselFeatureAndIdentity])

    function isVesselNameMinimumZoom() {
        return mapRef.current && mapRef.current.getView().getZoom() > MIN_ZOOM_VESSEL_NAMES;
    }

    function isVesselNameMaximumZoom() {
        return mapRef.current && mapRef.current.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES;
    }

    const handleMovingAndZoom = () => {
        dispatch(isMoving())
        updateViewHistory(shouldUpdateView, mapRef, dispatch);

        if (isVesselNameMinimumZoom()) {
            dispatch(hideVesselNames(false));
        } else if (isVesselNameMaximumZoom()) {
            dispatch(hideVesselNames(true));
        }
    }

    function updateViewHistory(shouldUpdateView, mapRef, dispatch) {
        if (!shouldUpdateView) {
            setShouldUpdateView(true)
            return
        }

        const center = mapRef.current.getView().getCenter();
        let view = {
            zoom: mapRef.current.getView().getZoom().toFixed(2),
            center: center,
        };
        let url = `@${center[0].toFixed(2)},${center[1].toFixed(2)},${mapRef.current.getView().getZoom().toFixed(2)}`

        dispatch(setView(view))
        window.history.pushState(view, 'map', url);
    }

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => feature, {hitTolerance: hitPixelTolerance});

        if (feature && feature.getId() && feature.getId().includes(LayersEnum.VESSELS.code)) {
            let vessel = getVesselIdentityFromFeature(feature)
            dispatch(showVesselTrackAndSidebar(getVesselFeatureAndIdentity(feature, vessel), false, false))
        } else if(feature && feature.getId() && feature.getId().includes(LayersEnum.REGULATORY.code)) {
            let zone = {
                layerName: feature.getProperties().layer_name,
                zone: feature.getProperties().zones
            }
            dispatch(showRegulatoryZoneMetadata(zone))
        }
    }

    const handlePointerMove = (event, vesselCardOverlay, vesselTrackCardOverlay) => {
        if(event) {
            const pixel = mapRef.current.getEventPixel(event.originalEvent);
            const feature = mapRef.current.forEachFeatureAtPixel(pixel, feature => feature, {hitTolerance: hitPixelTolerance});

            showPointerAndCardIfVessel(feature, mapRef.current.getCoordinateFromPixel(event.pixel), vesselCardOverlay, vesselTrackCardOverlay);
            showCoordinatesInDMS(event)
        }
    }

    function showPointerAndCardIfVessel(feature, coordinates, vesselCardOverlay, vesselTrackCardOverlay) {
        if (feature && feature.getId() && feature.getId().toString().includes(LayersEnum.VESSELS.code)) {
            setVesselFeatureToShowOnCard(feature)

            document.getElementById(vesselCardID).style.display = 'block';
            document.getElementById(vesselTrackCardID).style.display = 'none';

            vesselCardOverlay.setPosition(feature.getGeometry().getCoordinates());
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else if (feature && feature.getId() && feature.getId().toString().includes(`${LayersEnum.VESSEL_TRACK.code}:position`)) {
            setVesselFeatureToShowOnCard(feature)

            document.getElementById(vesselTrackCardID).style.display = 'block';
            document.getElementById(vesselCardID).style.display = 'none';

            mapRef.current.getTarget().style.cursor = 'pointer'
            vesselTrackCardOverlay.setPosition(feature.getGeometry().getCoordinates());
        } else if (feature && feature.getId() && feature.getId().toString().includes(`${LayersEnum.REGULATORY.code}`)) {
            setRegulatoryFeatureToShowOnCard(feature)
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else {
            document.getElementById(vesselCardID).style.display = 'none';
            document.getElementById(vesselTrackCardID).style.display = 'none';
            setVesselFeatureToShowOnCard(null)
            setRegulatoryFeatureToShowOnCard(null)
            if(mapRef.current.getTarget().style) {
                mapRef.current.getTarget().style.cursor = ''
            }
        }
    }

    async function showCoordinatesInDMS(event) {
        const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel);
        const coordinates = getCoordinates(clickedCoordinates, OPENLAYERS_PROJECTION)
        setCursorCoordinates(`${coordinates[0]} ${coordinates[1]}`)
    }

    return (
        <div>
            <MapContainer ref={mapElement} />
            <BaseLayer map={map} />
            <VesselTrackLayer map={map} />
            <VesselsLayer map={map} mapRef={mapRef}/>
            <DrawLayer map={map} />
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
  top: -236px;
  left: -185px;
  width: 370px;
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

const MapContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default MapWrapper
