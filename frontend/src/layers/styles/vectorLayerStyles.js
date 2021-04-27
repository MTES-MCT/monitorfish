import {Style} from "ol/style";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Layers from "../../domain/entities/layers";
import {getColorWithAlpha} from "../../utils";

export const getVectorLayerStyle = type => {
    switch (type) {
        case Layers.EEZ.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.EEZ.subZoneFieldKey) ? feature.get(Layers.EEZ.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.9)', width: 2})
            })
        })
        case Layers.FAO.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.FAO.subZoneFieldKey) ? feature.get(Layers.FAO.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.AEM.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.AEM.subZoneFieldKey) ? feature.get(Layers.AEM.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.cormoran.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.cormoran.subZoneFieldKey) ? feature.get(Layers.cormoran.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.situations.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 2,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.situations.subZoneFieldKey) ? feature.get(Layers.situations.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.brexit.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 2,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.brexit.subZoneFieldKey) ? feature.get(Layers.brexit.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.rectangles_stat.code: return feature => new Style({
            stroke: new Stroke({
                color: '#767AB2',
                width: 1,
            }),
            text: new Text({
                font: '12px Avenir',
                text: `${feature.get(Layers.rectangles_stat.subZoneFieldKey) ? feature.get(Layers.rectangles_stat.subZoneFieldKey) : ''}`,
                fill: new Fill({color: '#05055E'}),
                stroke: new Stroke({color: 'rgba(255,255,255,0.4)', width: 2})
            })
        })
        case Layers.THREE_MILES.code: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.SIX_MILES.code: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.TWELVE_MILES.code: return feature => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            })
        })
        case Layers.REGULATORY.code: return (feature, hash, gearCategory) => {
            let lastNumber = hash.toString().slice(-1)

            let metadataIsShowed = null
            if(feature) {
                metadataIsShowed = feature.getProperties().metadataIsShowed
            }

            switch (gearCategory) {
                case 'Sennes': {
                    return getTrawlStyles(lastNumber, getStyle, metadataIsShowed)
                }
                case 'Chaluts': {
                    return getTrawlStyles(lastNumber, getStyle, metadataIsShowed)
                }
                case 'Filets tournants': {
                    return getFishnetStyles(lastNumber, getStyle, metadataIsShowed)
                }
                case 'Filets soulevés': {
                    return getFishnetStyles(lastNumber, getStyle, metadataIsShowed)
                }
                case 'Filets maillants et filets emmêlants': {
                    return getFishnetStyles(lastNumber, getStyle, metadataIsShowed)
                }
                case 'Lignes et hameçons': {
                    switch (lastNumber) {
                        case '0': return getStyle(getColorWithAlpha('#FFD3C7', 0.75), metadataIsShowed)
                        case '1': return getStyle(getColorWithAlpha('#FFB199', 0.75), metadataIsShowed)
                        case '2': return getStyle(getColorWithAlpha('#FFB199', 0.75), metadataIsShowed)
                        case '3': return getStyle(getColorWithAlpha('#FF8F66', 0.75), metadataIsShowed)
                        case '4': return getStyle(getColorWithAlpha('#FF8F66', 0.75), metadataIsShowed)
                        case '5': return getStyle(getColorWithAlpha('#FC4C0D', 0.75), metadataIsShowed)
                        case '6': return getStyle(getColorWithAlpha('#FC4C0D', 0.75), metadataIsShowed)
                        case '7': return getStyle(getColorWithAlpha('#C9390D', 0.75), metadataIsShowed)
                        case '8': return getStyle(getColorWithAlpha('#9B2F08', 0.75), metadataIsShowed)
                        case '9': return getStyle(getColorWithAlpha('#721E04', 0.75), metadataIsShowed)
                    }
                    break
                }
                case 'Dragues': {
                    switch (lastNumber) {
                        case '0': return getStyle(getColorWithAlpha('#F8F8C9', 0.75), metadataIsShowed)
                        case '1': return getStyle(getColorWithAlpha('#EAE89B', 0.75), metadataIsShowed)
                        case '2': return getStyle(getColorWithAlpha('#EAE89B', 0.75), metadataIsShowed)
                        case '3': return getStyle(getColorWithAlpha('#EBEB60', 0.75), metadataIsShowed)
                        case '4': return getStyle(getColorWithAlpha('#EBEB60', 0.75), metadataIsShowed)
                        case '5': return getStyle(getColorWithAlpha('#D9D932', 0.75), metadataIsShowed)
                        case '6': return getStyle(getColorWithAlpha('#D9D932', 0.75), metadataIsShowed)
                        case '7': return getStyle(getColorWithAlpha('#B3B312', 0.75), metadataIsShowed)
                        case '8': return getStyle(getColorWithAlpha('#969600', 0.75), metadataIsShowed)
                        case '9': return getStyle(getColorWithAlpha('#717100', 0.75), metadataIsShowed)
                    }
                    break
                }
                case 'Pièges': {
                    switch (lastNumber) {
                        case '0': return getStyle(getColorWithAlpha('#EAD0B2', 0.75), metadataIsShowed)
                        case '1': return getStyle(getColorWithAlpha('#DCB57F', 0.75), metadataIsShowed)
                        case '2': return getStyle(getColorWithAlpha('#DCB57F', 0.75), metadataIsShowed)
                        case '3': return getStyle(getColorWithAlpha('#CF994F', 0.75), metadataIsShowed)
                        case '4': return getStyle(getColorWithAlpha('#CF994F', 0.75), metadataIsShowed)
                        case '5': return getStyle(getColorWithAlpha('#AD6918', 0.75), metadataIsShowed)
                        case '6': return getStyle(getColorWithAlpha('#AD6918', 0.75), metadataIsShowed)
                        case '7': return getStyle(getColorWithAlpha('#844F10', 0.75), metadataIsShowed)
                        case '8': return getStyle(getColorWithAlpha('#703F09', 0.75), metadataIsShowed)
                        case '9': return getStyle(getColorWithAlpha('#512A03', 0.75), metadataIsShowed)
                    }
                    break
                }
                default: {
                    // Pièges
                    return getStyle(getColorWithAlpha('#022f40', 0.75), metadataIsShowed)
                }
            }
        }
       default: return () => new Style({
            stroke: new Stroke({
                color: 'rgba(5, 5, 94, 0.5)',
                width: 2,
            }),
           fill: new Fill({
               color: 'rgba(5, 5, 94, 0.2)',
           }),
        })
    }
}

const getFishnetStyles = (lastNumber, getStyle, metadataIsShowed) => {
    switch (lastNumber) {
        case '0': return getStyle(getColorWithAlpha('#BBDDC4', 0.75), metadataIsShowed)
        case '1': return getStyle(getColorWithAlpha('#86C195', 0.75), metadataIsShowed)
        case '2': return getStyle(getColorWithAlpha('#86C195', 0.75), metadataIsShowed)
        case '3': return getStyle(getColorWithAlpha('#449C5A', 0.75), metadataIsShowed)
        case '4': return getStyle(getColorWithAlpha('#449C5A', 0.75), metadataIsShowed)
        case '5': return getStyle(getColorWithAlpha('#087021', 0.75), metadataIsShowed)
        case '6': return getStyle(getColorWithAlpha('#087021', 0.75), metadataIsShowed)
        case '7': return getStyle(getColorWithAlpha('#0B541E', 0.75), metadataIsShowed)
        case '8': return getStyle(getColorWithAlpha('#073613', 0.75), metadataIsShowed)
        case '9': return getStyle(getColorWithAlpha('#041B0A', 0.75), metadataIsShowed)
    }
}

const getTrawlStyles = (lastNumber, getStyle, metadataIsShowed) => {
    switch (lastNumber) {
        case '0': return getStyle(getColorWithAlpha('#DFF7F3', 0.75), metadataIsShowed)
        case '1': return getStyle(getColorWithAlpha('#C7EAE5', 0.75), metadataIsShowed)
        case '2': return getStyle(getColorWithAlpha('#C7EAE5', 0.75), metadataIsShowed)
        case '3': return getStyle(getColorWithAlpha('#91CFC9', 0.75), metadataIsShowed)
        case '4': return getStyle(getColorWithAlpha('#91CFC9', 0.75), metadataIsShowed)
        case '5': return getStyle(getColorWithAlpha('#56B3AB', 0.75), metadataIsShowed)
        case '6': return getStyle(getColorWithAlpha('#56B3AB', 0.75), metadataIsShowed)
        case '7': return getStyle(getColorWithAlpha('#499390', 0.75), metadataIsShowed)
        case '8': return getStyle(getColorWithAlpha('#36696B', 0.75), metadataIsShowed)
        case '9': return getStyle(getColorWithAlpha('#294F50', 0.75), metadataIsShowed)
    }
}

const getStyle = (color, metadataIsShowed) => new Style({
    stroke: new Stroke({
        color: 'rgba(5, 5, 94, 0.7)',
        width: metadataIsShowed ? 3 : 1,
    }),
    fill: new Fill({
        color: color,
    }),
})
