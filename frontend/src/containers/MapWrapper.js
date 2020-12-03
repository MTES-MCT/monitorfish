import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate';
import {Zoom} from 'ol/control';
import LayersEnum from "../domain/layers";
import MapCoordinatesBox from "../components/MapCoordinatesBox";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {
    selectedVesselStyle,
    getVesselNameStyle,
    VESSEL_SELECTOR_STYLE,
    VESSEL_NAME_STYLE
} from "../layers/styles/featuresStyles";
import MapAttributionsBox from "../components/MapAttributionsBox";
import Overlay from "ol/Overlay";
import VesselCard from "../components/VesselCard";
import VesselTrackCard from "../components/VesselTrackCard";
import ShowVesselsNamesBox from "./ShowVesselsNamesBox";
import VesselSummary from "./VesselSummary";
import showVesselTrackAndSummary from "../use_cases/showVesselTrackAndSummary";
import {useDispatch, useSelector} from "react-redux";
import {resetHideLayer, resetShowLayer} from "../reducers/Layer";
import {hideVesselNames, isMoving, resetAnimateToVessel, setUsingSearch} from "../reducers/Map";

const MIN_ZOOM_VESSEL_NAMES = 8;

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
                center: transform(centeredOnFrance, BACKEND_PROJECTION, OPENLAYERS_PROJECTION),
                zoom: 6,
                minZoom: 5
            }),
            controls: [new Zoom({className: 'zoom'})],
        })

        initialMap.on('click', handleMapClick)
        initialMap.on('pointermove', event => handlePointerMove(event, vesselCardOverlay, vesselTrackCardOverlay))
        initialMap.on('moveend', handleMovingAndZoom)

        setMap(initialMap)
    }, [])

    useEffect(() => {
        if (map && layer.layers.length && layer.layerToShow) {
            const layerToInsert = layer.layers
                .filter(currentLayer => {
                    if (layer.layerToShow.filter) {
                        return currentLayer.className_ === layer.layerToShow.type + ':' + layer.layerToShow.filter
                    }

                    return currentLayer.className_ === layer.layerToShow.type
                }).find(layer => layer)

            if (!layerToInsert) {
                return
            }

            if (map.getLayers().getLength() === 1) {
                map.getLayers().push(layerToInsert);
                dispatch(resetShowLayer());
                return
            }

            if (layerToInsert.className_ === LayersEnum.VESSELS) {
                map.getLayers().pop();
                map.getLayers().push(layerToInsert);
                dispatch(resetShowLayer());
                return
            }

            let index = map.getLayers().getLength() - 1
            map.getLayers().insertAt(index, layerToInsert);
            dispatch(resetShowLayer());
        }
    }, [layer.layers, layer.layerToShow, map])

    useEffect(() => {
        if (map && layer.layers.length && layer.layerToHide) {
            const layerToRemove = layer.layers
                .filter(currentLayer => {
                    if (layer.layerToHide.filter) {
                        return currentLayer.className_ === layer.layerToHide.type + ':' + layer.layerToHide.filter
                    }

                    return currentLayer.className_ === layer.layerToHide.type
                }).find(layer => layer)

            if (!layerToRemove) {
                return
            }

            map.getLayers().remove(layerToRemove);
            dispatch(resetHideLayer());
        }
    }, [layer.layers, layer.layerToHide, map])

    useEffect(() => {
        if (map && vessel.vesselTrackVector) {
            removeCurrentVesselTrackLayer();

            let belowVesselLayer = map.getLayers().getLength() - 1;
            map.getLayers().insertAt(belowVesselLayer, vessel.vesselTrackVector);
        } else if (map && !vessel.vesselTrackVector) {
            removeCurrentVesselTrackLayer();
        }
    }, [vessel.vesselTrackVector, map])

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
                vesselsLayer.getSource().forEachFeatureInExtent(extent, feature => {
                    feature.setStyle([...feature.getStyle(), getVesselNameStyle(feature)]);
                })
            })
    }

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
            return feature;
        });

        if (feature && feature.getId() && feature.getId().includes(LayersEnum.VESSELS)) {
            dispatch(showVesselTrackAndSummary(feature.getProperties().internalReferenceNumber, feature, false))
        }
    }

    useEffect(() => {
        if(vessel.loadingVessel) {
            let vesselAlreadyWithSelectorStyle = vessel.loadingVessel.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)

            if (!vesselAlreadyWithSelectorStyle) {
                vessel.loadingVessel.setStyle([...vessel.loadingVessel.getStyle(), selectedVesselStyle]);
                let vesselSummaryOverlay = mapRef.current.getOverlays().getArray().find(overlay => overlay.id === vesselSummaryID)
                document.getElementById(vesselSummaryOverlay.getId()).style.display = 'block';
                vesselSummaryOverlay.setPosition(vessel.loadingVessel.getGeometry().getCoordinates());
            }
        }
    }, [vessel.loadingVessel])

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

    function showCoordinatesInDMS(event) {
        const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel);
        const transformedCoordinates = transform(clickedCoordinates, OPENLAYERS_PROJECTION, BACKEND_PROJECTION)
        setCursorCoordinates(toStringHDMS(transformedCoordinates))
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
  box-shadow: 0px 0px 0px 1px rgba(5, 5, 94, 0.3) !important;
  top: -500px;
  left: -166px;
  width: 360px;
  height: 472px;
  text-align: left;
  background-color: #fff;
  border-radius: 2px;
  z-index: 100;
`

const VesselCardOverlay = styled.div`
  position: absolute;
  box-shadow: 0px 0px 0px 1px rgba(5, 5, 94, 0.3) !important;
  top: -210px;
  left: -166px;
  width: 360px;
  height: 180px;
  text-align: left;
  background-color: #fff;
  border-radius: 2px;
  z-index: 200;
`

const VesselTrackCardOverlay = styled.div`
  position: absolute;
  box-shadow: 0px 0px 0px 1px rgba(5, 5, 94, 0.3) !important;
  top: -145px;
  left: -166px;
  width: 360px;
  height: 125px;
  text-align: left;
  background-color: #fff;
  border-radius: 2px;
  z-index: 300;
`

const MapContainer = styled.div`
  height: 95vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  margin-top: 5vh;
`

export default MapWrapper
