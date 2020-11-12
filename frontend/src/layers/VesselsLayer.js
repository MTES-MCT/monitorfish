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
import {getVessels, getVesselTrack} from "../api/fetch";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "../domain/map";

const VesselsLayer = () => {
    const [state, dispatch] = useContext(Context)
    const [vessels, setVessels] = useState(null)
    const [vesselTrack, setVesselTrack] = useState(null)

    useEffect(() => {
        // create and add vector source layer
        const initialVesselsLayer = new VectorLayer({
            source: new VectorSource(),
            className: Layers.VESSELS
        })
        dispatch({type: 'SET_LAYERS', payload: [initialVesselsLayer]});
    }, [])

    useEffect(() => {
        getVessels(setVessels, dispatch)

        if (state.vessel.vesselTrackToShow) {
            getVesselTrack(setVesselTrack, dispatch, state.vessel.vesselTrackToShow.getProperties().internalReferenceNumber)
        }
    }, [state.global.fetch, state.vessel.vesselTrackToShow])

    useEffect(() => {
        if (vessels && vessels.length && state.layer.layers) {
            let vesselsFeatures = vessels
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
                    });

                    iconFeature.setId(`${LayersEnum.VESSELS}:${index}`)

                    let vesselTrackInternalReferenceNumberToShow = state.vessel.vesselTrackToShow ? state.vessel.vesselTrackToShow.getProperties().internalReferenceNumber : null;
                    setVesselIconStyle(vessel, iconFeature, vesselTrackInternalReferenceNumberToShow);

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
    }, [vessels])

    useEffect(() => {
        if (vesselTrack && vesselTrack.positions.length && state.layer.layers) {
            let vesselTrackLines = buildVesselTrackLines()

            let circlePoints = buildCirclePoints(vesselTrackLines);
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

            dispatch({type: 'SET_VESSEL_TRACK', payload: vesselTrackVector})
        }
    }, [vesselTrack])

    function buildCirclePoints(vesselTrackLines) {
        return vesselTrackLines.map((feature, index) => {
            if (index === vesselTrackLines.length - 1) {
                return
            }

            const circleFeature = new Feature({
                geometry: new Point(feature.getGeometry().getCoordinates()[1]),
                name: 'vessel:track:circle:' + index
            });

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
                name: 'vessel:track:arrow:' + index,
                course: feature.getProperties().course
            });

            setArrowStyle(getTrackArrow(feature.getProperties().speed), arrowFeature);

            return arrowFeature
        }).filter(arrowPoint => arrowPoint);
    }

    function buildVesselTrackLines() {
        return vesselTrack.positions
            .filter(position => position)
            .map((position, index) => {
                let lastPoint = index + 1;
                if (lastPoint === vesselTrack.positions.length) {
                    return
                }

                // transform coord to EPSG 3857 standard Lat Long
                let firstPoint = new transform([position.longitude, position.latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)
                let secondPoint = new transform([vesselTrack.positions[index + 1].longitude, vesselTrack.positions[index + 1].latitude], BACKEND_PROJECTION, OPENLAYERS_PROJECTION)

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
