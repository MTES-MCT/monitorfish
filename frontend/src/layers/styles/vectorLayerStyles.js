import {Style} from "ol/style";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Layers from "../../domain/entities/layers";
import {getColorWithAlpha} from "../../utils";

export const getVectorLayerStyle = type => {
    switch (type) {
        case Layers.EEZ: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get('union')}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.9)', width: 2})
            })
        })
        case Layers.FAO: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get('f_division') ? feature.get('f_division') : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.THREE_MILES: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.SIX_MILES: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.TWELVE_MILES: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.ONE_HUNDRED_MILES: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.REGULATORY: return (feature, hash, gearCategory) => {
            let lastNumber = hash.toString().slice(-1)

            switch (gearCategory) {
                case 'Sennes': {
                    return getTrawlStyles(lastNumber, getStyle)
                }
                case 'Chaluts': {
                    return getTrawlStyles(lastNumber, getStyle)
                }
                case 'Filets tournants': {
                    return getFishnetStyles(lastNumber, getStyle)
                }
                case 'Filets soulevés': {
                    return getFishnetStyles(lastNumber, getStyle)
                }
                case 'Filets maillants et filets emmêlants': {
                    return getFishnetStyles(lastNumber, getStyle)
                }
                case 'Lignes et hameçons': {
                    switch (lastNumber) {
                        case '0': return getStyle(getColorWithAlpha('#FFD3C7', 0.75))
                        case '1': return getStyle(getColorWithAlpha('#FFB199', 0.75))
                        case '2': return getStyle(getColorWithAlpha('#FFB199', 0.75))
                        case '3': return getStyle(getColorWithAlpha('#FF8F66', 0.75))
                        case '4': return getStyle(getColorWithAlpha('#FF8F66', 0.75))
                        case '5': return getStyle(getColorWithAlpha('#FC4C0D', 0.75))
                        case '6': return getStyle(getColorWithAlpha('#FC4C0D', 0.75))
                        case '7': return getStyle(getColorWithAlpha('#C9390D', 0.75))
                        case '8': return getStyle(getColorWithAlpha('#9B2F08', 0.75))
                        case '9': return getStyle(getColorWithAlpha('#721E04', 0.75))
                    }
                    break
                }
                case 'Dragues': {
                    switch (lastNumber) {
                        case '0': return getStyle(getColorWithAlpha('#F8F8C9', 0.75))
                        case '1': return getStyle(getColorWithAlpha('#EAE89B', 0.75))
                        case '2': return getStyle(getColorWithAlpha('#EAE89B', 0.75))
                        case '3': return getStyle(getColorWithAlpha('#EBEB60', 0.75))
                        case '4': return getStyle(getColorWithAlpha('#EBEB60', 0.75))
                        case '5': return getStyle(getColorWithAlpha('#D9D932', 0.75))
                        case '6': return getStyle(getColorWithAlpha('#D9D932', 0.75))
                        case '7': return getStyle(getColorWithAlpha('#B3B312', 0.75))
                        case '8': return getStyle(getColorWithAlpha('#969600', 0.75))
                        case '9': return getStyle(getColorWithAlpha('#717100', 0.75))
                    }
                    break
                }
                case 'Pièges': {
                    switch (lastNumber) {
                        case '0': return getStyle(getColorWithAlpha('#EAD0B2', 0.75))
                        case '1': return getStyle(getColorWithAlpha('#DCB57F', 0.75))
                        case '2': return getStyle(getColorWithAlpha('#DCB57F', 0.75))
                        case '3': return getStyle(getColorWithAlpha('#CF994F', 0.75))
                        case '4': return getStyle(getColorWithAlpha('#CF994F', 0.75))
                        case '5': return getStyle(getColorWithAlpha('#AD6918', 0.75))
                        case '6': return getStyle(getColorWithAlpha('#AD6918', 0.75))
                        case '7': return getStyle(getColorWithAlpha('#844F10', 0.75))
                        case '8': return getStyle(getColorWithAlpha('#703F09', 0.75))
                        case '9': return getStyle(getColorWithAlpha('#512A03', 0.75))
                    }
                    break
                }
                default: {
                    // Pièges
                    return getStyle(getColorWithAlpha('#022f40', 0.75))
                }
            }
        }
    }
}

const getFishnetStyles = (lastNumber, getStyle) => {
    switch (lastNumber) {
        case '0': return getStyle(getColorWithAlpha('#BBDDC4', 0.75))
        case '1': return getStyle(getColorWithAlpha('#86C195', 0.75))
        case '2': return getStyle(getColorWithAlpha('#86C195', 0.75))
        case '3': return getStyle(getColorWithAlpha('#449C5A', 0.75))
        case '4': return getStyle(getColorWithAlpha('#449C5A', 0.75))
        case '5': return getStyle(getColorWithAlpha('#087021', 0.75))
        case '6': return getStyle(getColorWithAlpha('#087021', 0.75))
        case '7': return getStyle(getColorWithAlpha('#0B541E', 0.75))
        case '8': return getStyle(getColorWithAlpha('#073613', 0.75))
        case '9': return getStyle(getColorWithAlpha('#041B0A', 0.75))
    }
}

const getTrawlStyles = (lastNumber, getStyle) => {
    switch (lastNumber) {
        case '0': return getStyle(getColorWithAlpha('#DFF7F3', 0.75))
        case '1': return getStyle(getColorWithAlpha('#C7EAE5', 0.75))
        case '2': return getStyle(getColorWithAlpha('#C7EAE5', 0.75))
        case '3': return getStyle(getColorWithAlpha('#91CFC9', 0.75))
        case '4': return getStyle(getColorWithAlpha('#91CFC9', 0.75))
        case '5': return getStyle(getColorWithAlpha('#56B3AB', 0.75))
        case '6': return getStyle(getColorWithAlpha('#56B3AB', 0.75))
        case '7': return getStyle(getColorWithAlpha('#499390', 0.75))
        case '8': return getStyle(getColorWithAlpha('#36696B', 0.75))
        case '9': return getStyle(getColorWithAlpha('#294F50', 0.75))
    }
}

const getStyle = color => new Style({
    stroke: new Stroke({
        color: 'rgba(5, 5, 94, 0.7)',
        width: 1,
    }),
    fill: new Fill({
        color: color,
    }),
})
