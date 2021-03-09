import {getVesselFromAPI} from "../../api/fetch";
import LayersEnum from "../entities/layers";
import {
    setArrowStyle,
    setCircleStyle,
    VESSEL_SELECTOR_STYLE
} from "../../layers/styles/featuresStyles";
import {
    loadingVessel, openVesselSidebar, resetLoadingVessel, setSelectedVessel,
    setSelectedVesselTrackVector,
} from "../reducers/Vessel";
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
import {animateToVessel} from "../reducers/Map";
import {removeError, setError} from "../reducers/Global";
import {Vector} from "ol/layer";
import VectorSource from "ol/source/Vector";
import Layers from "../entities/layers";

const showVesselTrackAndSidebar = (vesselFeatureAndIdentity, fromSearch, updateShowedVessel) => (dispatch, getState) => {
    let alreadySelectedVessel = getState().vessel.selectedVesselFeatureAndIdentity
    if(!updateShowedVessel &&
        alreadySelectedVessel &&
        alreadySelectedVessel.feature === vesselFeatureAndIdentity.feature) {
        if(getState().vessel.selectedVessel) {
            dispatch(openVesselSidebar())
        }

        return
    }

    removePreviousSelectedFeature(getState);
    if(vesselFeatureAndIdentity.feature && !updateShowedVessel) {
        dispatch(animateToVessel(vesselFeatureAndIdentity.feature))
        dispatch(removeError())
    }

    if(!updateShowedVessel) {
        dispatch(loadingVessel(vesselFeatureAndIdentity))
    }

    dispatch(openVesselSidebar())

    getVesselFromAPI(
        vesselFeatureAndIdentity.identity.internalReferenceNumber,
        vesselFeatureAndIdentity.identity.externalReferenceNumber,
        vesselFeatureAndIdentity.identity.ircs,
        getState().map.vesselTrackDepth)
        .then(vessel => {
            dispatch(removeError());
            dispatch(setSelectedVessel(vessel))

            if(vessel.positions && vessel.positions.length) {
                let vesselTrackVector = buildVesselTrackVector(vessel)
                dispatch(setSelectedVesselTrackVector(vesselTrackVector))
            }
        }).catch(error => {
            console.error(error)
            dispatch(setError(error));
            dispatch(resetLoadingVessel())
        });
}

function buildVesselTrackVector(vessel) {
    let vesselTrackLines = buildVesselTrackLines(vessel)

    let circlePoints = buildCirclePoints(vesselTrackLines, vessel.positions);
    circlePoints.forEach(circlePoint => {
        vesselTrackLines.push(circlePoint)
    })

    let arrowPoints = buildArrowPoints(vesselTrackLines)
    arrowPoints.forEach(arrowPoint => {
        vesselTrackLines.push(arrowPoint)
    })

    return new Vector({
        source: new VectorSource({
            features: vesselTrackLines
        }),
        className: Layers.VESSEL_TRACK
    })
}

function buildCirclePoints(vesselTrackLines, positions) {
    return vesselTrackLines.map((feature, index) => {
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
            geometry: new Point(feature.getGeometry().getCoordinates()[0]),
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
    let previousSelectedFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity
    if (previousSelectedFeatureAndIdentity && previousSelectedFeatureAndIdentity.feature) {
        let stylesWithoutVesselSelector = previousSelectedFeatureAndIdentity.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        previousSelectedFeatureAndIdentity.feature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default showVesselTrackAndSidebar