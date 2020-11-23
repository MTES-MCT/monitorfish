import {transform} from "ol/proj";
import {BACKEND_PROJECTION, OPENLAYERS_PROJECTION} from "./domain/map";
import {toStringHDMS} from "ol/coordinate";

export let calculatePointsDistance = (coord1, coord2) => {
    let dx = coord1[0] - coord2[0];
    let dy = coord1[1] - coord2[1];

    return Math.sqrt(dx * dx + dy * dy);
};

export let calculateSplitPointCoords = (startNode, nextNode, distanceBetweenNodes, distanceToSplitPoint) => {
    let d = distanceToSplitPoint / distanceBetweenNodes;
    let x = nextNode[0] + (startNode[0] - nextNode[0]) * d;
    let y = nextNode[1] + (startNode[1] - nextNode[1]) * d;

    return [x, y];
};

export let getCoordinates = coordinates => {
    const transformedCoordinates = transform(coordinates, OPENLAYERS_PROJECTION, BACKEND_PROJECTION)
    const hourCoordinates = toStringHDMS(transformedCoordinates)
    let nSplit = hourCoordinates.split('N')
    if (nSplit.length > 1) {
        return [`${nSplit[0]} N`, nSplit[1]]
    }

    let sSplit = hourCoordinates.split('S')
    if (sSplit.length > 1) {
        return [`${nSplit[0]} S`, nSplit[1]]
    }
}

export let getDateTime = dateString => {
    if (dateString) {
        const date = new Date(dateString)
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.toLocaleTimeString('fr-FR')}`
    }
}

export let getTextWidth =  text => {
    let canvas = undefined,
        context = undefined,
        metrics = undefined;

    canvas = document.createElement( "canvas" )
    context = canvas.getContext( "2d" );
    context.font = "Normal 12px Arial";
    metrics = context.measureText( text );

    return metrics.width;
}
