import React, {useContext, useEffect, useState} from 'react';

import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Point from 'ol/geom/Point';
import {Icon, Style} from 'ol/style';
import {transform} from 'ol/proj'
import {Context} from "../Store";
import Layers from "../domain/LayersEnum";
import LayersEnum from "../domain/LayersEnum";
import {Vector} from "ol/layer";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import LineString from "ol/geom/LineString";
import getTrackColor from "../domain/ShipTrack";

const ShipsLayer = () => {
    const [state, dispatch] = useContext(Context)
    const [ships, setShips] = useState(null)
    const [shipTrack, setShipTrack] = useState(null)

    function getShips() {
        fetch('/bff/v1/positions')
            .then(response => response.json())
            .then(ships => {
                setShips(ships)
            })
            .catch(error => {
                dispatch({type: 'SET_ERROR', payload: error});
            });
    }

    useEffect(() => {
        // create and add vector source layer
        const initialShipsLayer = new VectorLayer({
            source: new VectorSource(),
            className: Layers.SHIPS
        })
        dispatch({type: 'SET_LAYERS', payload: [initialShipsLayer]});
    }, [])

    useEffect(() => {
        getShips()

        if (state.ship.shipTrackInternalReferenceNumberToShow) {
            getShipTrack()
        }
    }, [state.global.fetch, state.ship.shipTrackInternalReferenceNumberToShow])

    useEffect(() => {
        if (ships && ships.length && state.layer.layers) {
            let shipsFeatures = ships
                .filter(ship => ship)
                .map((ship, index) => {
                    // transform coord to EPSG 4326 standard Lat Long
                    const transformedCoordinates = transform([ship.longitude, ship.latitude], 'EPSG:4326', 'EPSG:3857')

                    const iconFeature = new Feature({
                        geometry: new Point(transformedCoordinates),
                        name: ship.internalReferenceNumber || ship.mmsi
                    });
                    iconFeature.setId(`${LayersEnum.SHIPS}:${index}`)

                    setShipIconStyle(ship, iconFeature);

                    return iconFeature;
                })

            state.layer.layers
                .filter(layer => layer.className_ === Layers.SHIPS)
                .map(layer => {
                    layer.setSource(
                        new VectorSource({
                            features: shipsFeatures
                        })
                    )
                    dispatch({type: 'REPLACE_SHIPS_LAYER', payload: layer})
                    dispatch({type: 'SHOW_LAYER', payload: Layers.SHIPS});
                });
        }
    }, [ships])

    useEffect(() => {
        if (shipTrack && shipTrack.positions.length && state.layer.layers) {
            let shipTrackLines = shipTrack.positions
                .filter(position => position)
                .map((position, index) => {
                    let lastPoint = index + 1;
                    if (lastPoint === shipTrack.positions.length) {
                        return
                    }

                    // transform coord to EPSG 3857 standard Lat Long
                    let firstPoint = new transform([position.longitude, position.latitude], 'EPSG:4326', 'EPSG:3857')
                    let secondPoint = new transform([shipTrack.positions[index + 1].longitude, shipTrack.positions[index + 1].latitude], 'EPSG:4326', 'EPSG:3857')

                    const dx = secondPoint[0] - firstPoint[0];
                    const dy = secondPoint[1] - firstPoint[1];
                    const rotation = Math.atan2(dy, dx);

                    const feature = new Feature({
                        geometry: new LineString([firstPoint, secondPoint]),
                        course: -rotation
                    })

                    let trackColor = getTrackColor(position.speed);

                    feature.setStyle(new Style({
                        fill: new Fill({color: trackColor, weight: 4}),
                        stroke: new Stroke({color: trackColor, width: 3})
                    }))

                    return feature
                }).filter(lineString => lineString)

            let arrowPoints = shipTrackLines.map((feature, index) => {
                if (index === shipTrackLines.length - 1) {
                    return
                }

                const arrowFeature = new Feature({
                    geometry: new Point(feature.getGeometry().getCoordinates()[1]),
                    name: 'ship:track:arrow:' + index
                });

                setArrowStyle(index, feature, arrowFeature);

                return arrowFeature
            }).filter(arrowPoint => arrowPoint)

            arrowPoints.forEach(arrowPoint => {
                shipTrackLines.push(arrowPoint)
            })

            let vectorLine = new VectorSource({
                features: shipTrackLines
            });

            let shipTrackVector = new Vector({
                source: vectorLine,
                className: Layers.SHIP_TRACK
            });

            dispatch({type: 'SET_SHIP_TRACK', payload: shipTrackVector})
        }
    }, [shipTrack])

    function getShipTrack() {
        fetch(`/bff/v1/positions/${state.ship.shipTrackInternalReferenceNumberToShow}`)
            .then(response => response.json())
            .then(shipTrack => {
                setShipTrack(shipTrack)
            })
            .catch(error => {
                dispatch({type: 'SET_ERROR', payload: error});
            });
    }

    const setShipIconStyle = (ship, iconFeature) => {
        const shipDate = new Date(ship.dateTime);
        const nowMinusTwoHours = new Date();
        nowMinusTwoHours.setHours(nowMinusTwoHours.getHours() - 3);

        const iconStyle = new Style({
            image: new Icon({
                src: 'boat_mf.png',
                offset: [0, 0],
                imgSize: [14, 14],
                rotation: ship.course,
                opacity: shipDate < nowMinusTwoHours ? 0.5 : 1
            }),
        });
        iconFeature.setStyle(iconStyle);
    }

    function setArrowStyle(index, feature, arrowFeature) {
        const arrowStyle = new Style({
            image: new Icon({
                src: 'arrow.png',
                offset: [0, 0],
                imgSize: [30, 30],
                rotation: feature.getProperties().course,
                rotateWithView: true,
                opacity: 1,
                scale: 0.4
            })
        });
        arrowFeature.setStyle(arrowStyle);
    }

    return null
}

export default ShipsLayer
