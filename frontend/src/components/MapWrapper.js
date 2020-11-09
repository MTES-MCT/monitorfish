import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import Map from 'ol/Map'
import View from 'ol/View'
import VectorTileLayer from 'ol/layer/Tile'
import {OSM} from 'ol/source';
import {transform} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate';
import {Attribution, Zoom} from 'ol/control';
import {Context} from "../Store";
import LayersEnum from "../domain/layers";
import Layers from "../domain/layers";
import MapCoordinatesBox from "./MapCoordinatesBox";
import ZoneLayerSelectionBox from "./ZoneLayerSelectionBox";
import ShipsSearchBox from "./ShipsSearchBox";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {selectedShipStyle} from "../layers/styles/featuresStyles";
import RegulatoryLayerSelectionBox from "./RegulatoryLayerSelectionBox";
import MapAttributionsBox from "./MapAttributionsBox";

const MapWrapper = () => {
    const [state, dispatch] = useContext(Context)
    const [map, setMap] = useState()
    const [cursorCoordinates, setCursorCoordinates] = useState()

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
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
            view: new View({
                projection: OPENLAYERS_PROJECTION,
                center: transform(centeredOnFrance, BACKEND_PROJECTION, OPENLAYERS_PROJECTION),
                zoom: 6,
                minZoom: 5
            }),
            controls: [new Zoom({className: 'zoom'})],
        })

        // set map onclick handler
        initialMap.on('click', handleMapClick)
        initialMap.on('pointermove', handlePointerMove)

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

                    if (layer.className_ === LayersEnum.SHIPS) {
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
        if (map && state.ship.shipTrack) {
            map.getLayers().getArray()
                .filter(layer => {
                    return layer.className_ === LayersEnum.SHIP_TRACK
                })
                .forEach(layer => {
                    map.getLayers().remove(layer);
                })

            let belowShipLayer = map.getLayers().getLength() - 1;
            map.getLayers().insertAt(belowShipLayer, state.ship.shipTrack);
        }
    }, [state.ship.shipTrack, state.ship.shipTrackToShow, map])


    useEffect(() => {
        if (map && state.ship.shipToMoveOn) {
            map.getView().animate({
                center: state.ship.shipToMoveOn.getGeometry().getCoordinates(),
                duration: 1000,
                zoom: 8
            });

        }
    }, [state.ship.shipToMoveOn, map])

    const handleMapClick = event => {
        const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, feature => {
            return feature;
        });

        if (feature && feature.getId() && feature.getId().includes(LayersEnum.SHIPS)) {
            feature.setStyle([feature.getStyle(), selectedShipStyle]);
            dispatch({type: 'SHOW_SHIP_TRACK', payload: feature});
        }
    }

    useEffect(() => {
        if (map && state.ship.previousShipTrackShowed) {
            removeSelectStyleToPreviouslySelectedFeature();
        }
    }, [state.ship.previousShipTrackShowed, map])

    function removeSelectStyleToPreviouslySelectedFeature() {
        state.layer.layers
            .filter(layer => layer.className_ === LayersEnum.SHIPS)
            .forEach(shipsLayer => {
                shipsLayer.getSource().getFeatures().map(feature => {
                    if (feature.getId() === state.ship.previousShipTrackShowed.getId()) {
                        feature.setStyle(feature.getStyle()[0])
                    }
                })
            })
    }

    function showPointerIfShipFeature(feature) {
        if (feature && feature.getId() && feature.getId().includes(LayersEnum.SHIPS)) {
            mapRef.current.getTarget().style.cursor = 'pointer'
        } else {
            mapRef.current.getTarget().style.cursor = ''
        }
    }

    function showCoordinatesInDMS(event) {
        const clickedCoordinates = mapRef.current.getCoordinateFromPixel(event.pixel);
        const transformedCoordinates = transform(clickedCoordinates, OPENLAYERS_PROJECTION, BACKEND_PROJECTION)
        setCursorCoordinates(toStringHDMS(transformedCoordinates))
    }

    const handlePointerMove = event => {
        const pixel = mapRef.current.getEventPixel(event.originalEvent);
        const feature = mapRef.current.forEachFeatureAtPixel(pixel, feature => {
            return feature;
        });

        showPointerIfShipFeature(feature);
        showCoordinatesInDMS(event);
    }

    return (
        <div>
            <MapContainer ref={mapElement} />

            <ShipsSearchBox/>
            <ZoneLayerSelectionBox
                layers={[
                    { layer: Layers.EEZ, layerName: 'ZEE' },
                    { layer: Layers.FAO, layerName: 'FAO' },
                    { layer: Layers.THREE_MILES, layerName: '3 Milles' },
                    { layer: Layers.SIX_MILES, layerName: '6 Milles' },
                    { layer: Layers.TWELVE_MILES, layerName: '12 Milles' },
                    { layer: Layers.ONE_HUNDRED_MILES, layerName: '100 Milles' },
                    { layer: Layers.COAST_LINES, layerName: 'Trait de côte' }
                ]}/>
            <RegulatoryLayerSelectionBox />
            <MapCoordinatesBox coordinates={cursorCoordinates}/>
            <MapAttributionsBox />

        </div>
    )
}

const MapContainer = styled.div`
  height: 100vh;
  width: 100%;
`

export default MapWrapper
