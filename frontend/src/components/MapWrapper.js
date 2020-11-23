import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate';
import {Zoom} from 'ol/control';
import {Context} from "../Store";
import LayersEnum from "../domain/layers";
import MapCoordinatesBox from "./MapCoordinatesBox";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {
    selectedVesselStyle,
    getVesselNameStyle,
    VESSEL_SELECTOR_STYLE,
    VESSEL_NAME_STYLE
} from "../layers/styles/featuresStyles";
import MapAttributionsBox from "./MapAttributionsBox";
import Overlay from "ol/Overlay";
import VesselCard from "./VesselCard";
import VesselTrackCard from "./VesselTrackCard";
import ShowVesselsNamesBox from "./ShowVesselsNamesBox";

const MIN_ZOOM_VESSEL_NAMES = 8;

const MapWrapper = () => {
    const [state, dispatch] = useContext(Context)
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
            }
        });

        const vesselTrackCardOverlay = new Overlay({
            element: document.getElementById('vessel-track-card'),
            autoPan: true,
            autoPanAnimation: {
                duration: 400,
            }
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
                center: transform(centeredOnFrance, BACKEND_PROJECTION, OPENLAYERS_PROJECTION),
                zoom: 6,
                minZoom: 5
            }),
            controls: [new Zoom({className: 'zoom'})],
        })

        initialMap.on('click', handleMapClick)
        initialMap.on('pointermove', event => handlePointerMove(event, vesselCardOverlay, vesselTrackCardOverlay))
        initialMap.on('moveend', handleZoom)

        setMap(initialMap)
    }, [])

    useEffect(() => {
        if (map && state.layer.layers.length && state.layer.layerToShow) {
            state.layer.layers
                .filter(layer => {
                    if (state.layer.layerToShow.filter) {
                        return layer.className_ === state.layer.layerToShow.type + ':' + state.layer.layerToShow.filter
                    }

                    return layer.className_ === state.layer.layerToShow.type
                })
                .forEach(layer => {
                    if (map.getLayers().getLength() === 1) {
                        map.getLayers().push(layer);
                        dispatch({type: 'RESET_SHOW_LAYER'});
                        return
                    }

                    if (layer.className_ === LayersEnum.VESSELS) {
                        map.getLayers().pop();
                        map.getLayers().push(layer);
                        dispatch({type: 'RESET_SHOW_LAYER'});
                        return
                    }

                    let index = map.getLayers().getLength() - 1
                    map.getLayers().insertAt(index, layer);
                    dispatch({type: 'RESET_SHOW_LAYER'});
                })
        }
    }, [state.layer.layers, state.layer.layerToShow, map])

    useEffect(() => {
        if (map && state.layer.layers.length && state.layer.layerToHide) {
            state.layer.layers
                .filter(layer => {
                    if (state.layer.layerToHide.filter) {
                        return layer.className_ === state.layer.layerToHide.type + ':' + state.layer.layerToHide.filter
                    }

                    return layer.className_ === state.layer.layerToHide.type
                })
                .forEach(layer => {
                    map.getLayers().remove(layer);
                    dispatch({type: 'RESET_HIDE_LAYER'});
                })
        }
    }, [state.layer.layers, state.layer.layerToHide, map])

    useEffect(() => {
        if (map && state.vessel.vesselTrackVector) {
            removeVesselTrackLayer();

            let belowVesselLayer = map.getLayers().getLength() - 1;
            map.getLayers().insertAt(belowVesselLayer, state.vessel.vesselTrackVector);
        } else if (map && !state.vessel.vesselTrackVector) {
            removeVesselTrackLayer();
        }
    }, [state.vessel.vesselTrackVector, map])

    function removeVesselTrackLayer() {
        map.getLayers().getArray()
            .filter(layer => {
                return layer.className_ === LayersEnum.VESSEL_TRACK
            })
            .forEach(layer => {
                map.getLayers().remove(layer);
            })
    }

    useEffect(() => {
        if (map && state.vessel.vesselToMoveOn) {
            map.getView().animate({
                center: state.vessel.vesselToMoveOn.getGeometry().getCoordinates(),
                duration: 1000,
                zoom: MIN_ZOOM_VESSEL_NAMES
            });

        }
    }, [state.vessel.vesselToMoveOn, map])

    function removeVesselNameToAllFeatures() {
        state.layer.layers
            .filter(layer => layer.className_ === LayersEnum.VESSELS)
            .forEach(vesselsLayer => {
                vesselsLayer.getSource().getFeatures().map(feature => {
                    let stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_NAME_STYLE)
                    feature.setStyle([...stylesWithoutVesselName]);
                })
            })
    }

    const handleZoom = () => {
        if (isVesselNameMinimumZoom()) {
            dispatch({type: 'VESSEL_NAMES_ZOOM_HIDE', payload: false});
        } else if (isVesselNameMaximumZoom()) {
            dispatch({type: 'VESSEL_NAMES_ZOOM_HIDE', payload: true});
        }
    }

    function addVesselNameToAllFeatures() {
        state.layer.layers
            .filter(layer => layer.className_ === LayersEnum.VESSELS)
            .forEach(vesselsLayer => {
                vesselsLayer.getSource().getFeatures().map(feature => {
                    feature.setStyle([...feature.getStyle(), getVesselNameStyle(feature)]);
                })
            })
    }

    function isVesselNameMinimumZoom() {
        return mapRef.current && mapRef.current.getView().getZoom() > MIN_ZOOM_VESSEL_NAMES;
    }

    function isVesselNameMaximumZoom() {
        return mapRef.current && mapRef.current.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES;
    }

    useEffect(() => {
        if (state.layer.layers && state.vessel.showVesselNames
            && !state.vessel.vesselNamesZoomHide && isVesselNameMinimumZoom()) {
            addVesselNameToAllFeatures();
        } else if (state.layer.layers && state.vessel.showVesselNames
            && state.vessel.vesselNamesZoomHide && isVesselNameMaximumZoom()) {
            removeVesselNameToAllFeatures();
        } else if (state.layer.layers && !state.vessel.showVesselNames) {
            removeVesselNameToAllFeatures();
        }
    }, [state.vessel.showVesselNames, map, state.vessel.vesselNamesZoomHide])

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
            return feature;
        });

        if (feature && feature.getId()
            && feature.getId().includes(LayersEnum.VESSELS)) {

            let vesselNameStyle = feature.getStyle().filter(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
            if (vesselNameStyle.length === 0) {
                feature.setStyle([...feature.getStyle(), selectedVesselStyle]);
                dispatch({type: 'SHOW_VESSEL_TRACK', payload: feature});
            }
        }
    }

    useEffect(() => {
        if (map && state.vessel.previousVesselTrackShowed && !state.vessel.vessel) {
            removeSelectStyleToPreviouslySelectedFeature();
        }
    }, [state.vessel.previousVesselTrackShowed, state.vessel.vessel, map])

    function removeSelectStyleToPreviouslySelectedFeature() {
        state.layer.layers
            .filter(layer => layer.className_ === LayersEnum.VESSELS)
            .forEach(vesselsLayer => {
                vesselsLayer.getSource().getFeatures().map(feature => {
                    if (feature.getId() === state.vessel.previousVesselTrackShowed.getId()) {
                        let stylesWithoutVesselSelector = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
                        feature.setStyle([...stylesWithoutVesselSelector]);
                        dispatch({type: 'RESET_PREVIOUS_VESSEL_SHOWED'})
                    }
                })
            })
    }

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
            document.getElementById('vessel-card').style.display = 'block';
            vesselCardOverlay.setPosition(feature.getGeometry().getCoordinates());
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else if (feature && feature.getId() && feature.getId().includes(`${LayersEnum.VESSEL_TRACK}:position`)) {
            setVesselFeatureToShowOnCard(feature)
            document.getElementById('vessel-track-card').style.display = 'block';
            mapRef.current.getTarget().style.cursor = 'pointer'
            vesselTrackCardOverlay.setPosition(feature.getGeometry().getCoordinates());
        } else {
            document.getElementById('vessel-card').style.display = 'none';
            document.getElementById('vessel-track-card').style.display = 'none';
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
            <VesselTrackCardOverlay id="vessel-track-card">
                { vesselFeatureToShowOnCard ? <VesselTrackCard vessel={vesselFeatureToShowOnCard} /> : null }
            </VesselTrackCardOverlay>

            <MapCoordinatesBox coordinates={cursorCoordinates}/>
            <MapAttributionsBox />
            <ShowVesselsNamesBox />
        </div>
    )
}

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
`

const MapContainer = styled.div`
  height: 95vh;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  margin-top: 5vh;
`

export default MapWrapper
