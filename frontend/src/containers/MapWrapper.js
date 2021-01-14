import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {getTopLeft, getTopRight, getWidth} from 'ol/extent';
import {transform} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate';
import LayersEnum from "../domain/entities/layers";
import MapCoordinatesBox from "../components/MapCoordinatesBox";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/entities/map";
import {
    selectedVesselStyle,
    VESSEL_SELECTOR_STYLE,
    VESSEL_NAME_STYLE, getVesselNameStyle
} from "../layers/styles/featuresStyles";
import MapAttributionsBox from "../components/MapAttributionsBox";
import Overlay from "ol/Overlay";
import VesselCard from "../components/VesselCard";
import VesselTrackCard from "../components/VesselTrackCard";
import ShowVesselsNamesBox from "./ShowVesselsNamesBox";
import showVesselTrackAndSidebar from "../domain/use_cases/showVesselTrackAndSidebar";
import {useDispatch, useSelector} from "react-redux";
import {hideVesselNames, isMoving, resetAnimateToVessel} from "../domain/reducers/Map";
import {COLORS} from "../constants/constants";
import {updateVesselFeature} from "../domain/reducers/Vessel";
import showRegulatoryZoneMetadata from "../domain/use_cases/showRegulatoryZoneMetadata";
import LayerDetailsBox from "../components/LayerDetailsBox";

const MIN_ZOOM_VESSEL_NAMES = 9;

const vesselCardID = 'vessel-card';
const vesselTrackCardID = 'vessel-track-card';
let lastEventForPointerMove, timeoutForPointerMove, lastEventForMove, timeoutForMove;

const MapWrapper = () => {
    const layer = useSelector(state => state.layer)
    const gears = useSelector(state => state.gear.gears)
    const vessel = useSelector(state => state.vessel)
    const mapState = useSelector(state => state.map)
    const dispatch = useDispatch()

    const [map, setMap] = useState()
    const [cursorCoordinates, setCursorCoordinates] = useState()
    const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
    const [regulatoryFeatureToShowOnCard, setRegulatoryFeatureToShowOnCard] = useState(null)
    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
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

        const OSMLayer = new VectorTileLayer({
            source: new OSM({
                attributions: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
            }),
        })

        const centeredOnFrance = [2.99049, 46.82801];
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                OSMLayer
            ],
            renderer: (['webgl', 'canvas']),
            overlays: [vesselCardOverlay, vesselTrackCardOverlay],
            view: new View({
                projection: OPENLAYERS_PROJECTION,
                center: transform(centeredOnFrance, WSG84_PROJECTION, OPENLAYERS_PROJECTION),
                zoom: 6,
                minZoom: 3
            }),
            controls: [],
        })

        initialMap.on('click', handleMapClick)
        initialMap.on('pointermove', event => {
            if (event.dragging || timeoutForPointerMove) {
                timeoutForPointerMove && (lastEventForPointerMove = event);
                return;
            }

            timeoutForPointerMove = setTimeout(() => {
                timeoutForPointerMove = null;
                handlePointerMove(event, vesselCardOverlay, vesselTrackCardOverlay)
            }, 100);
        })
        initialMap.on('moveend', event => {
            if (timeoutForMove) {
                timeoutForMove && (lastEventForMove = event);
                return;
            }

            timeoutForMove = setTimeout(() => {
                timeoutForMove = null;
                handleMovingAndZoom()
            }, 100);
        })

        setMap(initialMap)
    }, [])

    useEffect(() => {
        if (map && layer.layers.length) {

            addLayersToMap();
            removeLayersToMap();
        }
    }, [layer.layers, map])

    function addLayersToMap() {
        const layersToInsert = layer.layers.filter(layer => {
            return !map.getLayers().getArray().some(layer_ => layer === layer_)
        })

        layersToInsert.map(layerToInsert => {
            if (!layerToInsert) {
                return
            }

            if (map.getLayers().getLength() === 1) {
                map.getLayers().push(layerToInsert);
                return
            }

            if (layerToInsert.className_ === LayersEnum.VESSELS) {
                removeCurrentVesselLayer()
                map.getLayers().push(layerToInsert);
                return
            }

            let index = map.getLayers().getLength() - 1
            map.getLayers().insertAt(index, layerToInsert);
        })
    }

    function removeLayersToMap() {
        let tileBaseLayer = 'ol-layer';
        const layersToRemove = map.getLayers().getArray().filter(showedLayer => {
            return !layer.layers.some(layer_ => showedLayer === layer_)
        })
            .filter(layer => layer.className_ !== tileBaseLayer)
            .filter(layer => layer.className_ !== LayersEnum.VESSEL_TRACK)

        layersToRemove.map(layerToRemove => {
            map.getLayers().remove(layerToRemove);
        })
    }

    function removeCurrentVesselLayer() {
        const layerToRemove = map.getLayers().getArray()
            .find(layer => layer.className_ === LayersEnum.VESSELS)

        if (!layerToRemove) {
            return
        }

        map.getLayers().remove(layerToRemove)
    }

    useEffect(() => {
        if (map && vessel.selectedVesselTrackVector) {
            removeCurrentVesselTrackLayer();

            let belowVesselLayer = map.getLayers().getLength() - 1;
            map.getLayers().insertAt(belowVesselLayer, vessel.selectedVesselTrackVector);
        } else if (map && !vessel.selectedVesselTrackVector) {
            removeCurrentVesselTrackLayer();
        }
    }, [vessel.selectedVesselTrackVector, map])

    function removeCurrentVesselTrackLayer() {
        const layerToRemove = map.getLayers().getArray()
            .find(layer => layer.className_ === LayersEnum.VESSEL_TRACK)

        if (!layerToRemove) {
            return
        }

        map.getLayers().remove(layerToRemove)
    }

    useEffect(() => {
        if (map && mapState.animateToVessel && vessel.selectedVesselFeature && vessel.vesselSidebarIsOpen) {
            if(map.getView().getZoom() >= 8) {
                const resolution = map.getView().getResolution()
                map.getView().animate({
                    center: [
                        mapState.animateToVessel.getGeometry().getCoordinates()[0] + (resolution * 200),
                        mapState.animateToVessel.getGeometry().getCoordinates()[1] + (resolution * 150)
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
                            mapState.animateToVessel.getGeometry().getCoordinates()[1] + (resolution * 150)
                        ],
                        duration: 500,
                        zoom: undefined
                    })
                });
            }

            dispatch(resetAnimateToVessel())
        }
    }, [mapState.animateToVessel, map, vessel.vesselSidebarIsOpen, vessel.selectedVesselFeature, mapState.usingSearch])

    function removeVesselNameToAllFeatures() {
        layer.layers
            .filter(layer => layer.className_ === LayersEnum.VESSELS)
            .forEach(vesselsLayer => {
                vesselsLayer.getSource().getFeatures().map(feature => {
                    let stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_NAME_STYLE)
                    feature.setStyle([...stylesWithoutVesselName]);
                })
            })
    }

    const handleMovingAndZoom = () => {
        dispatch(isMoving())
        if (isVesselNameMinimumZoom()) {
            dispatch(hideVesselNames(false));
        } else if (isVesselNameMaximumZoom()) {
            dispatch(hideVesselNames(true));
        }
    }

    function isVesselNameMinimumZoom() {
        return mapRef.current && mapRef.current.getView().getZoom() > MIN_ZOOM_VESSEL_NAMES;
    }

    function isVesselNameMaximumZoom() {
        return mapRef.current && mapRef.current.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES;
    }

    useEffect(() => {
        if (map) {
            let extent = mapRef.current.getView().calculateExtent(mapRef.current.getSize());

            if(mapState.vesselNamesHiddenByZoom === undefined) {
                return
            }

            if (layer.layers && mapState.vesselNamesShowedOnMap
                && !mapState.vesselNamesHiddenByZoom && isVesselNameMinimumZoom()) {
                addVesselNameToAllFeatures(extent);
            } else if (layer.layers && mapState.vesselNamesShowedOnMap
                && mapState.vesselNamesHiddenByZoom && isVesselNameMaximumZoom()) {
                removeVesselNameToAllFeatures(extent);
            } else if (layer.layers && !mapState.vesselNamesShowedOnMap) {
                removeVesselNameToAllFeatures(extent);
            }
        }
    }, [mapState.vesselNamesShowedOnMap, map, mapState.vesselNamesHiddenByZoom, mapState.isMoving])

    function addVesselNameToAllFeatures(extent) {
        layer.layers
            .filter(layer => layer.className_ === LayersEnum.VESSELS)
            .forEach(vesselsLayer => {
                vesselsLayer.getSource().forEachFeatureIntersectingExtent(extent, feature => {
                    feature.setStyle([...feature.getStyle(), getVesselNameStyle(feature)])
                })
            })
    }

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
            return feature;
        });

        if (feature && feature.getId() && feature.getId().includes(LayersEnum.VESSELS)) {
            dispatch(showVesselTrackAndSidebar(feature, false, false))
        } else if(feature && feature.getId() && feature.getId().includes(LayersEnum.REGULATORY)) {
            let zone = {
                layerName: feature.getProperties().layer_name,
                zone: feature.getProperties().zones
            }
            dispatch(showRegulatoryZoneMetadata(zone))
        }
    }

    useEffect(() => {
        if(vessel.selectedVesselFeature && !vessel.removeSelectedIconToFeature) {
            let vesselAlreadyWithSelectorStyle = vessel.selectedVesselFeature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
            if (!vesselAlreadyWithSelectorStyle) {
                vessel.selectedVesselFeature.setStyle([...vessel.selectedVesselFeature.getStyle(), selectedVesselStyle]);
                dispatch(updateVesselFeature(vessel.selectedVesselFeature))
            }
        }
    }, [vessel.selectedVesselFeature])

    const handlePointerMove = (event, vesselCardOverlay, vesselTrackCardOverlay) => {
        const pixel = mapRef.current.getEventPixel(event.originalEvent);
        const feature = mapRef.current.forEachFeatureAtPixel(pixel, feature => {
            return feature;
        });

        showPointerAndCardIfVessel(feature, mapRef.current.getCoordinateFromPixel(event.pixel), vesselCardOverlay, vesselTrackCardOverlay);
        showCoordinatesInDMS(event)
    }

    function showPointerAndCardIfVessel(feature, coordinates, vesselCardOverlay, vesselTrackCardOverlay) {
        if (feature && feature.getId() && feature.getId().includes(LayersEnum.VESSELS)) {
            setVesselFeatureToShowOnCard(feature)

            document.getElementById(vesselCardID).style.display = 'block';
            document.getElementById(vesselTrackCardID).style.display = 'none';

            vesselCardOverlay.setPosition(feature.getGeometry().getCoordinates());
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else if (feature && feature.getId() && feature.getId().includes(`${LayersEnum.VESSEL_TRACK}:position`)) {
            setVesselFeatureToShowOnCard(feature)

            document.getElementById(vesselTrackCardID).style.display = 'block';
            document.getElementById(vesselCardID).style.display = 'none';

            mapRef.current.getTarget().style.cursor = 'pointer'
            vesselTrackCardOverlay.setPosition(feature.getGeometry().getCoordinates());
        } else if (feature && feature.getId() && feature.getId().includes(`${LayersEnum.REGULATORY}`)) {
            setRegulatoryFeatureToShowOnCard(feature)
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else {
            document.getElementById(vesselCardID).style.display = 'none';
            document.getElementById(vesselTrackCardID).style.display = 'none';
            setVesselFeatureToShowOnCard(null)
            setRegulatoryFeatureToShowOnCard(null)
            mapRef.current.getTarget().style.cursor = ''
        }
    }

    async function showCoordinatesInDMS(event) {
        const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel);
        const transformedCoordinates = transform(clickedCoordinates, OPENLAYERS_PROJECTION, WSG84_PROJECTION)
        const stringHDMS = toStringHDMS(transformedCoordinates)
        setCursorCoordinates(stringHDMS)
    }

    return (
        <div>
            <MapContainer ref={mapElement} />
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
            <ShowVesselsNamesBox />
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
  border-radius: 1px;
  z-index: 200;
`

const VesselTrackCardOverlay = styled.div`
  position: absolute;
  top: -170px;
  left: -175px;
  width: 350px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 1px;
  z-index: 300;
`

const MapContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
`

export default MapWrapper
