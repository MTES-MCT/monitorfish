import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate';
import LayersEnum from "../domain/entities/layers";
import MapCoordinatesBox from "../components/MapCoordinatesBox";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/entities/map";
import {
    selectedVesselStyle,
    VESSEL_SELECTOR_STYLE,
    VESSEL_NAME_STYLE, getVesselNameStyle, getSVG
} from "../layers/styles/featuresStyles";
import MapAttributionsBox from "../components/MapAttributionsBox";
import Overlay from "ol/Overlay";
import VesselCard from "../components/VesselCard";
import VesselTrackCard from "../components/VesselTrackCard";
import ShowVesselsNamesBox from "./ShowVesselsNamesBox";
import showVesselTrackAndSidebar from "../domain/use_cases/showVesselTrackAndSidebar";
import {useDispatch, useSelector} from "react-redux";
import {hideVesselNames, isMoving, resetAnimateToVessel, setView} from "../domain/reducers/Map";
import {COLORS} from "../constants/constants";
import {updateVesselFeatureAndIdentity} from "../domain/reducers/Vessel";
import showRegulatoryZoneMetadata from "../domain/use_cases/showRegulatoryZoneMetadata";
import LayerDetailsBox from "../components/LayerDetailsBox";
import {getVesselFeatureAndIdentity, getVesselIdentityFromFeature} from "../domain/entities/vessel";
import Point from "ol/geom/Point";

const MIN_ZOOM_VESSEL_NAMES = 9;

const tileBaseLayer = 'ol-layer';
const vesselCardID = 'vessel-card';
const vesselTrackCardID = 'vessel-track-card';
let lastEventForPointerMove, timeoutForPointerMove, lastEventForMove, timeoutForMove;

const MapWrapper = () => {
    const layer = useSelector(state => state.layer)
    const gears = useSelector(state => state.gear.gears)
    const vessel = useSelector(state => state.vessel)
    const regulatoryZoneMetadata = useSelector(state => state.regulatory.regulatoryZoneMetadata)
    const mapState = useSelector(state => state.map)
    const dispatch = useDispatch()

    const [map, setMap] = useState()
    const [shouldUpdateView, setShouldUpdateView] = useState(true)
    const [cursorCoordinates, setCursorCoordinates] = useState()
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

        if(window.location.hash !== '') {
            let hash = window.location.hash.replace('@', '');
            let viewParts = hash.split(',');
            if (viewParts.length === 3) {
                initialMap.getView().setCenter([parseFloat(viewParts[0]), parseFloat(viewParts[1])]);
                initialMap.getView().setZoom(parseFloat(viewParts[2]));
            }
        } else if(mapState) {
            if(mapState.view && mapState.view.center && mapState.view.zoom) {
                initialMap.getView().setCenter(mapState.view.center);
                initialMap.getView().setZoom(mapState.view.zoom);
            }
        }

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
            reorganizeLayers();
        }
    }, [layer.layers, map, layer.layersAndAreas])

    useEffect(() => {
        if (map && layer.layers.length) {
            addLayersToMap();
            removeLayersToMap();
        }
    }, [layer.layers])

    function reorganizeLayers() {
        const layersToRemove = map.getLayers().getArray().filter(showedLayer => {
            return !layer.layers.some(layer_ => showedLayer === layer_)
        })
            .filter(layer => layer.className_ !== tileBaseLayer)
            .filter(layer => layer.className_ !== LayersEnum.VESSEL_TRACK)

        if(layersToRemove.length) {
            return
        }

        const layersToInsert = layer.layers.filter(layer => {
            return !map.getLayers().getArray().some(layer_ => layer === layer_)
        })

        if(layersToInsert.length === 0 && layer.layersAndAreas.length > 1) {
            let sortedLayersToArea = [...layer.layersAndAreas].sort((a, b) => a.area - b.area).reverse()

            sortedLayersToArea.forEach((layerAndArea, index) => {
                index = index + 1
                let layer = map.getLayers().getArray().find(layer => layer.className_ === layerAndArea.name)

                if(layer) {
                    map.getLayers().remove(layer);
                    map.getLayers().insertAt(index, layer);
                }
            })
        }
    }

    function addLayersToMap() {
        const layersToInsert = layer.layers.filter(layer => {
            return !map.getLayers().getArray().some(layer_ => layer === layer_)
        })

        layersToInsert.map(layerToInsert => {
            if (!layerToInsert) {
                return
            }

            // Add vessel layer
            if (map.getLayers().getLength() === 1) {
                map.getLayers().push(layerToInsert);
                return
            }

            // Replace vessel layer
            if (layerToInsert.className_ === LayersEnum.VESSELS) {
                removeCurrentVesselLayer()
                map.getLayers().push(layerToInsert);
                return
            }

            // Add other layers
            let index = map.getLayers().getLength() - 1
            map.getLayers().insertAt(index, layerToInsert);
        })
    }

    function removeLayersToMap() {
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
        if(vessel.selectedVessel && vessel.selectedVessel.positions && vessel.selectedVessel.positions.length) {
            const vesselsLayer = map.getLayers().getArray()
                .find(layer => layer.className_ === LayersEnum.VESSELS)

            const featureToModify = vesselsLayer.getSource().getFeatures().find(feature => {
                const properties = feature.getProperties()
                return properties.externalReferenceNumber === vessel.selectedVessel.externalReferenceNumber &&
                    properties.internalReferenceNumber === vessel.selectedVessel.internalReferenceNumber &&
                    properties.ircs === vessel.selectedVessel.ircs
            })

            if(featureToModify) {
                const lastPosition = vessel.selectedVessel.positions[vessel.selectedVessel.positions.length - 1]
                const newCoordinates = new transform([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

                featureToModify.setGeometry(new Point(newCoordinates))
            }
        }
    }, [vessel.selectedVessel])

    useEffect(() => {
        if (map && vessel.selectedVesselTrackVector) {
            removeCurrentVesselTrackLayer();

            let belowVesselLayer = map.getLayers().getLength() - 1;
            map.getLayers().insertAt(belowVesselLayer, vessel.selectedVesselTrackVector);
        } else if (map && !vessel.selectedVesselTrackVector) {
            removeCurrentVesselTrackLayer();
        }
    }, [vessel.selectedVesselTrackVector, map])

    function addMetadataIsShowedProperty(layerToAddProperty, metadataIsShowedPropertyName) {
        const features = layerToAddProperty.getSource().getFeatures()
        if (features.length) {
            layerToAddProperty.getSource().getFeatures()
                .forEach(feature => feature.set(metadataIsShowedPropertyName, true))
        } else if (layer.lastShowedFeatures.length) {
            layer.lastShowedFeatures
                .forEach(feature => feature.set(metadataIsShowedPropertyName, true))
        }
    }

    function removeMetadataIsShowedProperty(regulatoryLayers, metadataIsShowedPropertyName) {
        regulatoryLayers.forEach(layer => {
            layer.getSource().getFeatures()
                .filter(feature => feature.getProperties().metadataIsShowed)
                .forEach(feature => feature.set(metadataIsShowedPropertyName, false))
        })
    }

    useEffect(() => {
        if (map) {
            let metadataIsShowedPropertyName = "metadataIsShowed";
            let regulatoryLayers = map.getLayers().getArray().filter(layer => layer.className_.includes(LayersEnum.REGULATORY))
            if (regulatoryZoneMetadata) {
                let layerToAddProperty = regulatoryLayers.find(layer => {
                    return layer.className_ === `${LayersEnum.REGULATORY}:${regulatoryZoneMetadata.layerName}:${regulatoryZoneMetadata.zone}`
                })

                if (layerToAddProperty) {
                    addMetadataIsShowedProperty(layerToAddProperty, metadataIsShowedPropertyName);
                }
            } else {
                removeMetadataIsShowedProperty(regulatoryLayers, metadataIsShowedPropertyName);
            }
        }
    }, [regulatoryZoneMetadata, layer.lastShowedFeatures])

    function removeCurrentVesselTrackLayer() {
        const layerToRemove = map.getLayers().getArray()
            .find(layer => layer.className_ === LayersEnum.VESSEL_TRACK)

        if (!layerToRemove) {
            return
        }

        map.getLayers().remove(layerToRemove)
    }

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
                removeVesselNameToAllFeatures();
            } else if (layer.layers && !mapState.vesselNamesShowedOnMap) {
                removeVesselNameToAllFeatures();
            }
        }
    }, [mapState.vesselNamesShowedOnMap, map, mapState.vesselNamesHiddenByZoom, mapState.isMoving])

    function addVesselNameToAllFeatures(extent) {
        layer.layers
            .filter(layer => layer.className_ === LayersEnum.VESSELS)
            .forEach(vesselsLayer => {
                vesselsLayer.getSource().forEachFeatureIntersectingExtent(extent, feature => {
                    getSVG(feature).then(svg => {
                        let style = getVesselNameStyle(feature, svg)
                        feature.setStyle([...feature.getStyle(), style])
                    })
                })
            })
    }

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
            return feature;
        });

        if (feature && feature.getId() && feature.getId().includes(LayersEnum.VESSELS)) {
            let vessel = getVesselIdentityFromFeature(feature)
            dispatch(showVesselTrackAndSidebar(getVesselFeatureAndIdentity(feature, vessel), false, false))
        } else if(feature && feature.getId() && feature.getId().includes(LayersEnum.REGULATORY)) {
            let zone = {
                layerName: feature.getProperties().layer_name,
                zone: feature.getProperties().zones
            }
            dispatch(showRegulatoryZoneMetadata(zone))
        }
    }

    useEffect(() => {
        if(vessel.selectedVesselFeatureAndIdentity &&
            vessel.selectedVesselFeatureAndIdentity.feature &&
            !vessel.removeSelectedIconToFeature) {
            let style = vessel.selectedVesselFeatureAndIdentity.feature.getStyle()
            let vesselAlreadyWithSelectorStyle = vessel.selectedVesselFeatureAndIdentity.feature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
            if (!vesselAlreadyWithSelectorStyle) {
                vessel.selectedVesselFeatureAndIdentity.feature.setStyle([...style, selectedVesselStyle]);
                let vesselIdentity = getVesselIdentityFromFeature(vessel.selectedVesselFeatureAndIdentity.feature)
                dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(vessel.selectedVesselFeatureAndIdentity.feature, vesselIdentity)))
            }
        }
    }, [vessel.selectedVesselFeatureAndIdentity])

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
