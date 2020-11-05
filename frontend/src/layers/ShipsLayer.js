import {useContext, useEffect, useState} from 'react';

import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Point from 'ol/geom/Point';
import {Style} from 'ol/style';
import {transform} from 'ol/proj'
import {Context} from "../Store";
import Layers from "../domain/enum";
import LayersEnum from "../domain/enum";
import {Vector} from "ol/layer";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import LineString from "ol/geom/LineString";
import {getTrackArrow, getTrackColor} from "../domain/shipTrack";
import {calculatePointsDistance, calculateSplitPointCoords} from "../utils";
import {setArrowStyle, setCircleStyle, setShipIconStyle} from "./styles/featuresStyles";
import {getShips, getShipTrack} from "../api/fetch";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";

const ShipsLayer = () => {
    const [state, dispatch] = useContext(Context)
    const [ships, setShips] = useState(null)
    const [shipTrack, setShipTrack] = useState(null)

    useEffect(() => {
        // create and add vector source layer
        const initialShipsLayer = new VectorLayer({
            source: new VectorSource(),
            className: Layers.SHIPS
        })
        dispatch({type: 'SET_LAYERS', payload: [initialShipsLayer]});
    }, [])

    useEffect(() => {
        getShips(setShips, dispatch)

        if (state.ship.shipTrackToShow) {
            getShipTrack(setShipTrack, dispatch, state.ship.shipTrackToShow.getProperties().internalReferenceNumber)
        }
    }, [state.global.fetch, state.ship.shipTrackToShow])

    useEffect(() => {
        if (ships && ships.length && state.layer.layers) {
            let shipsFeatures = ships
                .filter(ship => ship)
                .map((ship, index) => {
                    const transformedCoordinates = transform([ship.longitude, ship.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)

                    const iconFeature = new Feature({
                        geometry: new Point(transformedCoordinates),
                        internalReferenceNumber: ship.internalReferenceNumber,
                        externalReferenceNumber: ship.externalReferenceNumber,
                        MMSI: ship.MMSI,
                        flagState: ship.flagState,
                        vesselName: ship.vesselName,
                    });

                    iconFeature.setId(`${LayersEnum.SHIPS}:${index}`)

                    let shipTrackInternalReferenceNumberToShow = state.ship.shipTrackToShow ? state.ship.shipTrackToShow.getProperties().internalReferenceNumber : null;
                    setShipIconStyle(ship, iconFeature, shipTrackInternalReferenceNumberToShow);

                    return iconFeature;
                })

            state.layer.layers
                .filter(layer => layer.className_ === Layers.SHIPS)
                .forEach(layer => {
                    layer.setSource(
                        new VectorSource({
                            features: shipsFeatures
                        })
                    )
                    dispatch({type: 'REPLACE_SHIPS_LAYER', payload: layer})
                    dispatch({type: 'SHOW_LAYER', payload: {type: Layers.SHIPS}});
                });
        }
    }, [ships])

    useEffect(() => {
        if (shipTrack && shipTrack.positions.length && state.layer.layers) {
            let shipTrackLines = buildShipTrackLines()

            let circlePoints = buildCirclePoints(shipTrackLines);
            circlePoints.forEach(circlePoint => {
                shipTrackLines.push(circlePoint)
            })

            let arrowPoints = buildArrowPoints(shipTrackLines)
            arrowPoints.forEach(arrowPoint => {
                shipTrackLines.push(arrowPoint)
            })

            let shipTrackVector = new Vector({
                source: new VectorSource({
                    features: shipTrackLines
                }),
                className: Layers.SHIP_TRACK
            });

            dispatch({type: 'SET_SHIP_TRACK', payload: shipTrackVector})
        }
    }, [shipTrack])

    function buildCirclePoints(shipTrackLines) {
        return shipTrackLines.map((feature, index) => {
            if (index === shipTrackLines.length - 1) {
                return
            }

            const circleFeature = new Feature({
                geometry: new Point(feature.getGeometry().getCoordinates()[1]),
                name: 'ship:track:circle:' + index
            });

            setCircleStyle(getTrackColor(feature.getProperties().speed), circleFeature);

            return circleFeature
        }).filter(circlePoint => circlePoint)
    }

    function buildArrowPoints(shipTrackLines) {
        return shipTrackLines.map((feature, index) => {
            let pointsDistance = calculatePointsDistance(feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1])
            let newPoint = calculateSplitPointCoords(feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1], pointsDistance, pointsDistance / 2)

            const arrowFeature = new Feature({
                geometry: new Point(newPoint),
                name: 'ship:track:arrow:' + index,
                course: feature.getProperties().course
            });

            setArrowStyle(getTrackArrow(feature.getProperties().speed), arrowFeature);

            return arrowFeature
        }).filter(arrowPoint => arrowPoint);
    }

    function buildShipTrackLines() {
        return shipTrack.positions
            .filter(position => position)
            .map((position, index) => {
                let lastPoint = index + 1;
                if (lastPoint === shipTrack.positions.length) {
                    return
                }

                // transform coord to EPSG 3857 standard Lat Long
                let firstPoint = new transform([position.longitude, position.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)
                let secondPoint = new transform([shipTrack.positions[index + 1].longitude, shipTrack.positions[index + 1].latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)

                const dx = secondPoint[0] - firstPoint[0];
                const dy = secondPoint[1] - firstPoint[1];
                const rotation = Math.atan2(dy, dx);

                const feature = new Feature({
                    geometry: new LineString([firstPoint, secondPoint]),
                    course: -rotation,
                    speed: position.speed
                })

                let trackColor = getTrackColor(position.speed);

                feature.setStyle(new Style({
                    fill: new Fill({color: trackColor, weight: 4}),
                    stroke: new Stroke({color: trackColor, width: 3})
                }))

                return feature
            }).filter(lineString => lineString);
    }

    return null
}

export default ShipsLayer
