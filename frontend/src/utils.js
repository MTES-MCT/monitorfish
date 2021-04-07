import {transform} from "ol/proj";
import {WSG84_PROJECTION} from "./domain/entities/map";
import {toStringHDMS} from "ol/coordinate";
import {asArray, asString} from "ol/color";

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

export let getCoordinates = (coordinates, projection) => {
    const transformedCoordinates = transform(coordinates, projection, WSG84_PROJECTION)
    const hourCoordinates = toStringHDMS(transformedCoordinates)
    let nSplit = hourCoordinates.split('N')
    if (nSplit.length > 1) {
        let degreeSplit = nSplit[1].split('°')
        if(degreeSplit.length) {
            let degree = degreeSplit[0].trim()
            switch (degree.length) {
                case 1: degree = `00${degree}`; break
                case 2: degree = `0${degree}`; break
                default: break
            }

            return [`${nSplit[0]} N`, `${degree}° ${degreeSplit[1]}`]
        }
    }

    let sSplit = hourCoordinates.split('S')
    if (sSplit.length > 1) {
        let degreeSplit = sSplit[1].split('°')
        if(degreeSplit.length) {
            let degree = degreeSplit[0].trim()
            switch (degree.length) {
                case 1: degree = `00${degree}`; break
                case 2: degree = `0${degree}`; break
                default: break
            }

            return [`${sSplit[0]} N`, `${degree}° ${degreeSplit[1]}`]
        }
    }
}

function getMonth(date) {
    let month = date.getUTCMonth() + 1
    return month < 10 ? '0' + month : '' + month
}

function getDay(date) {
    let day = date.getUTCDate()
    return day < 10 ? '0' + day : '' + day
}

export let getDate = dateString => {
    if (dateString) {
        let date = new Date(dateString)
        return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()}`
    }
}

export let getDateTime = (dateString, withoutSeconds) => {
    if (dateString) {
        let date = new Date(dateString)
        let timeOptions = withoutSeconds ? {
                hour: '2-digit',
                minute:'2-digit',
                timeZone: 'UTC',
            hourCycle: 'h24'} : {
            hour: '2-digit',
            minute:'2-digit',
            second: '2-digit',
            timeZone: 'UTC',
            hourCycle: 'h24'}

        let time = date.toLocaleTimeString([], timeOptions)
        time = time.replace(':', 'h')
        time = time.replace('24', '00')

        return `${getDay(date)}/${getMonth(date)}/${date.getFullYear()} à ${time}`
    }
}

export let arraysEqual = (a, b) => {
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

export const getLocalStorageState = (defaultValue, key) => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
}

export const getHash = string => {
    let len = string.length
    let h = 5381

    for (let i = 0; i < len; i++) {
        h = h * 33 ^ string.charCodeAt(i)
    }

    return h >>> 0
}

export const getColorWithAlpha = (color, alpha) => {
    const [r, g, b] = Array.from(asArray(color));
    return asString([r, g, b, alpha]);
}

export const timeagoFrenchLocale = function(number, index) {
    return [
        ["à l'instant", 'dans un instant'],
        ['il y a %s secondes', 'dans %s secondes'],
        ['il y a 1 minute', 'dans 1 minute'],
        ['il y a %s minutes', 'dans %s minutes'],
        ['il y a 1 heure', 'dans 1 heure'],
        ['il y a %s heures', 'dans %s heures'],
        ['il y a 1 jour', 'dans 1 jour'],
        ['il y a %s jours', 'dans %s jours'],
        ['il y a 1 semaine', 'dans 1 semaine'],
        ['il y a %s semaines', 'dans %s semaines'],
        ['il y a 1 mois', 'dans 1 mois'],
        ['il y a %s mois', 'dans %s mois'],
        ['il y a 1 an', 'dans 1 an'],
        ['il y a %s ans', 'dans %s ans'],
    ][index];
}

const accentsMap = {
    a: 'á|à|ã|â|À|Á|Ã|Â',
    e: 'é|è|ê|É|È|Ê',
    i: 'í|ì|î|Í|Ì|Î',
    o: 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
    u: 'ú|ù|û|ü|Ú|Ù|Û|Ü',
    c: 'ç|Ç',
    n: 'ñ|Ñ',
};

export const removeAccents = text => Object.keys(accentsMap)
    .reduce((acc, cur) => acc.replace(new RegExp(accentsMap[cur], 'g'), cur), text);
