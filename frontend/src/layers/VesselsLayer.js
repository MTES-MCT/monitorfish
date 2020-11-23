import {useContext, useEffect, useState} from 'react';

import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Point from 'ol/geom/Point';
import {Style} from 'ol/style';
import {transform} from 'ol/proj'
import {Context} from "../Store";
import Layers from "../domain/layers";
import LayersEnum from "../domain/layers";
import {Vector} from "ol/layer";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import LineString from "ol/geom/LineString";
import {getTrackArrow, getTrackColor} from "../domain/vesselTrack";
import {calculatePointsDistance, calculateSplitPointCoords} from "../utils";
import {setArrowStyle, setCircleStyle, setVesselIconStyle} from "./styles/featuresStyles";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";
import {toStringHDMS} from "ol/coordinate";

const VesselsLayer = () => {
    const [state, dispatch] = useContext(Context)

    useEffect(() => {
        // create and add vector source layer
        const initialVesselsLayer = new VectorLayer({
            source: new VectorSource(),
            className: Layers.VESSELS
        })
        dispatch({type: 'SET_LAYERS', payload: [initialVesselsLayer]});
    }, [])

    useEffect(() => {
        if (state.vessel.vessels && state.vessel.vessels.length && state.layer.layers) {
            let vesselsFeatures = state.vessel.vessels
                .filter(vessel => vessel)
                .map((vessel, index) => {
                    const transformedCoordinates = transform([vessel.longitude, vessel.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)

                    const iconFeature = new Feature({
                        geometry: new Point(transformedCoordinates),
                        internalReferenceNumber: vessel.internalReferenceNumber,
                        externalReferenceNumber: vessel.externalReferenceNumber,
                        MMSI: vessel.MMSI,
                        flagState: vessel.flagState,
                        vesselName: vessel.vesselName,
                        coordinates: toStringHDMS(transformedCoordinates),
                        course: vessel.course,
                        positionType: vessel.positionType,
                        speed: vessel.speed,
                        IRCS: vessel.IRCS,
                        dateTime: vessel.dateTime
                    });

                    iconFeature.setId(`${LayersEnum.VESSELS}:${index}`)

                    let vesselTrackInternalReferenceNumberToShow
                    if (state.vessel.vesselTrackToShow) {
                        vesselTrackInternalReferenceNumberToShow = state.vessel.vesselTrackToShow.getProperties().internalReferenceNumber
                    } else if (state.vessel.vessel) {
                        // The first position will always be non-null as it is the source of selection
                        vesselTrackInternalReferenceNumberToShow = state.vessel.vessel.positions[0].internalReferenceNumber
                    } else {
                        vesselTrackInternalReferenceNumberToShow = null
                    }

                    setVesselIconStyle(vessel, iconFeature, vesselTrackInternalReferenceNumberToShow, state.vessel.showVesselNames && !state.vessel.vesselNamesZoomHide);

                    return iconFeature;
                })

            state.layer.layers
                .filter(layer => layer.className_ === Layers.VESSELS)
                .forEach(layer => {
                    layer.setSource(
                        new VectorSource({
                            features: vesselsFeatures
                        })
                    )
                    dispatch({type: 'REPLACE_VESSELS_LAYER', payload: layer})
                    dispatch({type: 'SHOW_LAYER', payload: {type: Layers.VESSELS}});
                });
        }
    }, [state.vessel.vessels], state.vessel.showVesselNames, state.vessel.vesselNamesZoomHide)

    useEffect(() => {
        if (state.vessel.vessel && state.vessel.vessel.positions && state.vessel.vessel.positions.length && state.layer.layers) {
            let vesselTrackLines = buildVesselTrackLines(state.vessel.vessel)

            let circlePoints = buildCirclePoints(vesselTrackLines, state.vessel.vessel.positions);
            circlePoints.forEach(circlePoint => {
                vesselTrackLines.push(circlePoint)
            })

            let arrowPoints = buildArrowPoints(vesselTrackLines)
            arrowPoints.forEach(arrowPoint => {
                vesselTrackLines.push(arrowPoint)
            })

            let vesselTrackVector = new Vector({
                source: new VectorSource({
                    features: vesselTrackLines
                }),
                className: Layers.VESSEL_TRACK
            });

            dispatch({type: 'SET_VESSEL_TRACK_VECTOR', payload: vesselTrackVector})
            dispatch({type: 'RESET_SHOW_VESSEL_TRACK'})
        }
    }, [state.vessel.vessel])

    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function buildCirclePoints(vesselTrackLines, positions) {
        return vesselTrackLines.map((feature, index) => {
            if (index === vesselTrackLines.length - 1) {
                return
            }

            let position = positions.filter(position => {
                let point = new transform([position.longitude, position.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)
                return arraysEqual(feature.getGeometry().getCoordinates()[0], point)
            })
            if(position.length > 0) {
                position = position[0]
            } else {
                position = null
            }

            const circleFeature = new Feature({
                geometry: new Point(feature.getGeometry().getCoordinates()[1]),
                name: LayersEnum.VESSEL_TRACK + ':position:' + index,
                course: position ? position.course : null,
                positionType: position ? position.positionType : null,
                speed: position ? position.speed : null,
                dateTime: position ? position.dateTime : null
            });

            circleFeature.setId(LayersEnum.VESSEL_TRACK + ':position:' + index)
            setCircleStyle(getTrackColor(feature.getProperties().speed), circleFeature);

            return circleFeature
        }).filter(circlePoint => circlePoint)
    }

    function buildArrowPoints(vesselTrackLines) {
        return vesselTrackLines.map((feature, index) => {
            let pointsDistance = calculatePointsDistance(feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1])
            let newPoint = calculateSplitPointCoords(feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1], pointsDistance, pointsDistance / 2)

            const arrowFeature = new Feature({
                geometry: new Point(newPoint),
                name: LayersEnum.VESSEL_TRACK + ':arrow:' + index,
                course: feature.getProperties().course
            });

            arrowFeature.setId(LayersEnum.VESSEL_TRACK + ':arrow:' + index)
            setArrowStyle(getTrackArrow(feature.getProperties().speed), arrowFeature);

            return arrowFeature
        }).filter(arrowPoint => arrowPoint);
    }

    function buildVesselTrackLines(vessel) {
        return vessel.positions
            .filter(position => position)
            .map((position, index) => {
                let lastPoint = index + 1;
                if (lastPoint === vessel.positions.length) {
                    return
                }

                // transform coord to EPSG 3857 standard Lat Long
                let firstPoint = new transform([position.longitude, position.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)
                let secondPoint = new transform([vessel.positions[index + 1].longitude, vessel.positions[index + 1].latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)

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

export default VesselsLayer
