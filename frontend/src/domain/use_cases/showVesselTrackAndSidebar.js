import {getVesselFromAPI} from "../../api/fetch";
import LayersEnum from "../entities/layers";
import {
    setArrowStyle,
    setCircleStyle,
    VESSEL_SELECTOR_STYLE
} from "../../layers/styles/featuresStyles";
import {
    loadingVessel, openVesselSidebar, setSelectedVessel,
    setSelectedVesselTrackVector,
} from "../reducers/Vessel";
import {Vector} from "ol/layer";
import VectorSource from "ol/source/Vector";
import Layers from "../entities/layers";
import {transform} from "ol/proj";
import {WSG84_PROJECTION, OPENLAYERS_PROJECTION} from "../entities/map";
import {arraysEqual, calculatePointsDistance, calculateSplitPointCoords} from "../../utils";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {getTrackArrow, getTrackColor} from "../entities/vesselTrack";
import LineString from "ol/geom/LineString";
import {Style} from "ol/style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {animateToVessel, setUsingSearch} from "../reducers/Map";
import {setError} from "../reducers/Global";

const showVesselTrackAndSidebar = (feature, fromSearch, updateShowedVessel) => (dispatch, getState) => {
    if(getState().vessel.selectedVesselFeature === feature) {
        if(getState().vessel.selectedVessel && !updateShowedVessel) {
            dispatch(openVesselSidebar())
        }
        return
    }

    removePreviousSelectedFeature(getState);
    if(!updateShowedVessel) {
        dispatch(loadingVessel(feature))
    }

    if (fromSearch) {
        dispatch(setUsingSearch())
        dispatch(animateToVessel(feature));
    }

    if(feature) {
        dispatch(animateToVessel(feature));
    }
    dispatch(openVesselSidebar())

    getVesselFromAPI(
        feature.getProperties().internalReferenceNumber,
        feature.getProperties().externalReferenceNumber,
        feature.getProperties().IRCS)
        .then(vessel => {
            dispatch(setSelectedVessel(vessel))
            let vesselTrackLines = buildVesselTrackLines(vessel)

            let circlePoints = buildCirclePoints(vesselTrackLines, vessel.positions);
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

            dispatch(setSelectedVesselTrackVector(vesselTrackVector))
        }).catch(error => {
            dispatch(setError(error));
        });

}

function buildCirclePoints(vesselTrackLines, positions) {
    return vesselTrackLines.map((feature, index) => {
        if (index === vesselTrackLines.length - 1) {
            return
        }

        let firstPointCoordinatesOfLine = feature.getGeometry().getCoordinates()[0];
        let positionsOnLine = positions.filter(position => {
            let point = new transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
            return arraysEqual(firstPointCoordinatesOfLine, point)
        })

        let firstPositionOnLine
        if(positionsOnLine.length > 0) {
            firstPositionOnLine = positionsOnLine[0]
        } else {
            firstPositionOnLine = null
        }

        const circleFeature = new Feature({
            geometry: new Point(feature.getGeometry().getCoordinates()[1]),
            name: LayersEnum.VESSEL_TRACK + ':position:' + index,
            course: firstPositionOnLine ? firstPositionOnLine.course : null,
            positionType: firstPositionOnLine ? firstPositionOnLine.positionType : null,
            speed: firstPositionOnLine ? firstPositionOnLine.speed : null,
            dateTime: firstPositionOnLine ? firstPositionOnLine.dateTime : null
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
            let firstPoint = new transform([position.longitude, position.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
            let secondPoint = new transform([vessel.positions[index + 1].longitude, vessel.positions[index + 1].latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

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

function removePreviousSelectedFeature(getState) {
    let previousSelectedFeature = getState().vessel.selectedVesselFeature
    if (previousSelectedFeature) {
        let stylesWithoutVesselSelector = previousSelectedFeature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        previousSelectedFeature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default showVesselTrackAndSidebar