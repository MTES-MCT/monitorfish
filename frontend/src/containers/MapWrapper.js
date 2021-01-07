import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate';
import {Zoom} from 'ol/control';
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
import VesselSummary from "./VesselSummary";
import showVesselTrackAndSummary from "../domain/use_cases/showVesselTrackAndSummary";
import {useDispatch, useSelector} from "react-redux";
import {hideVesselNames, isMoving, resetAnimateToVessel} from "../domain/reducers/Map";
import {COLORS} from "../constants/constants";
import {updateVesselFeature} from "../domain/reducers/Vessel";

const MIN_ZOOM_VESSEL_NAMES = 9;

const vesselSummaryID = 'vessel-summary';
const vesselCardID = 'vessel-card';
const vesselTrackCardID = 'vessel-track-card';

const MapWrapper = () => {
    const layer = useSelector(state => state.layer)
    const vessel = useSelector(state => state.vessel)
    const mapState = useSelector(state => state.map)
    const dispatch = useDispatch()

    const [map, setMap] = useState()
    const [cursorCoordinates, setCursorCoordinates] = useState()
    const [vesselFeatureToShowOnCard, setVesselFeatureToShowOnCard] = useState(null)
    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
        const vesselCardOverlay = new Overlay({
            element: document.getElementById('vessel-card'),
            autoPan: true,
            autoPanAnimation: {
                duration: 400,
            },
            className: 'ol-overlay-container ol-selectable vessel-overlay'
        });

        const vesselSummaryOverlay = new Overlay({
            id: vesselSummaryID,
            element: document.getElementById(vesselSummaryID),
            autoPan: true,
            autoPanAnimation: {
                duration: 400,
            },
            className: 'ol-overlay-container ol-selectable vessel-summary-overlay'
        });

        const vesselTrackCardOverlay = new Overlay({
            element: document.getElementById('vessel-track-card'),
            autoPan: true,
            autoPanAnimation: {
                duration: 400,
            },
            className: 'ol-overlay-container ol-selectable vessel-track-overlay'
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
            overlays: [vesselSummaryOverlay, vesselCardOverlay, vesselTrackCardOverlay],
            view: new View({
                projection: OPENLAYERS_PROJECTION,
                center: transform(centeredOnFrance, WSG84_PROJECTION, OPENLAYERS_PROJECTION),
                zoom: 6,
                minZoom: 5
            }),
            controls: [],
        })

        initialMap.on('click', handleMapClick)
        initialMap.on('pointermove', event => handlePointerMove(event, vesselCardOverlay, vesselTrackCardOverlay))
        initialMap.on('moveend', handleMovingAndZoom)

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
        if (map && mapState.animateToVessel && vessel.selectedVesselFeature && !vessel.vesselBoxIsOpen) {
            map.getView().animate({
                center: [
                    mapState.animateToVessel.getGeometry().getCoordinates()[0],
                    mapState.animateToVessel.getGeometry().getCoordinates()[1] + 90000
                ],
                duration: 1000,
                zoom: MIN_ZOOM_VESSEL_NAMES
            });
            dispatch(resetAnimateToVessel())
        } else if (map && mapState.animateToVessel && vessel.selectedVesselFeature && vessel.vesselBoxIsOpen) {
            const resolution = mapRef.current.getView().getResolution()
            map.getView().animate({
                center: [
                    mapState.animateToVessel.getGeometry().getCoordinates()[0] + (resolution * 200),
                    mapState.animateToVessel.getGeometry().getCoordinates()[1] + (resolution * 150)
                ],
                duration: 1000,
                zoom: mapState.usingSearch ? MIN_ZOOM_VESSEL_NAMES : undefined
            });
            dispatch(resetAnimateToVessel())
        }
    }, [mapState.animateToVessel, map, vessel.vesselBoxIsOpen, vessel.selectedVesselFeature, mapState.usingSearch])

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
                    setTimeout(() => { feature.setStyle([...feature.getStyle(), getVesselNameStyle(feature)]) }, 100);
                })
            })
    }

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
            return feature;
        });

        if (feature && feature.getId() && feature.getId().includes(LayersEnum.VESSELS)) {
            dispatch(showVesselTrackAndSummary(feature, false, false))
        }
    }

    useEffect(() => {
        if(vessel.vesselSummaryIsOpen && vessel.selectedVesselFeature && !vessel.removeSelectedIconToFeature) {
            let vesselSummaryOverlay = mapRef.current.getOverlays().getArray().find(overlay => overlay.id === vesselSummaryID)
            document.getElementById(vesselSummaryOverlay.getId()).style.display = 'block';
            vesselSummaryOverlay.setPosition(vessel.selectedVesselFeature.getGeometry().getCoordinates());

            let vesselAlreadyWithSelectorStyle = vessel.selectedVesselFeature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
            if (!vesselAlreadyWithSelectorStyle) {
                vessel.selectedVesselFeature.setStyle([...vessel.selectedVesselFeature.getStyle(), selectedVesselStyle]);
                dispatch(updateVesselFeature(vessel.selectedVesselFeature))
            }
        }
    }, [vessel.vesselSummaryIsOpen, vessel.selectedVesselFeature])

    useEffect(() => {
        if(map && !vessel.vesselSummaryIsOpen) {
            let vesselSummaryOverlay = mapRef.current.getOverlays().getArray().find(overlay => overlay.id === vesselSummaryID)
            document.getElementById(vesselSummaryOverlay.getId()).style.display = 'none';
        }
    }, [vessel.vesselSummaryIsOpen, map])

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
            vesselCardOverlay.setPosition(feature.getGeometry().getCoordinates());
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else if (feature && feature.getId() && feature.getId().includes(`${LayersEnum.VESSEL_TRACK}:position`)) {
            setVesselFeatureToShowOnCard(feature)
            document.getElementById(vesselTrackCardID).style.display = 'block';
            mapRef.current.getTarget().style.cursor = 'pointer'
            vesselTrackCardOverlay.setPosition(feature.getGeometry().getCoordinates());
        } else {
            document.getElementById(vesselCardID).style.display = 'none';
            document.getElementById(vesselTrackCardID).style.display = 'none';
            setVesselFeatureToShowOnCard(null)
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
            <VesselCardOverlay id="vessel-card">
                { vesselFeatureToShowOnCard ? <VesselCard vessel={vesselFeatureToShowOnCard} /> : null }
            </VesselCardOverlay>
            <VesselSummaryOverlay id="vessel-summary">
                 <VesselSummary />
            </VesselSummaryOverlay>
            <VesselTrackCardOverlay id="vessel-track-card">
                { vesselFeatureToShowOnCard ? <VesselTrackCard vessel={vesselFeatureToShowOnCard} /> : null }
            </VesselTrackCardOverlay>

            <MapCoordinatesBox coordinates={cursorCoordinates}/>
            <MapAttributionsBox />
            <ShowVesselsNamesBox />
        </div>
    )
}

const VesselSummaryOverlay = styled.div`
  position: absolute;
  top: -535px;
  left: -185px;
  width: 370px;
  min-height: 500px;
  text-align: left;
  background-color: ${COLORS.grayBackground};
  border-radius: 1px;
  z-index: 100;
`

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
  left: -155px;
  width: 310px;
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
