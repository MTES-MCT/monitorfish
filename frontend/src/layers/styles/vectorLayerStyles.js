import {Style} from "ol/style";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Layers from "../../domain/layers";

export const getVectorLayerStyle = (type, regulatoryLayerName) => {
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
                color: '#05055E',
                width: 3,
            })
        })
        case Layers.SIX_MILES: return feature => new Style({
            stroke: new Stroke({
                color: '#05055E',
                width: 3,
            })
        })
        case Layers.TWELVE_MILES: return feature => new Style({
            stroke: new Stroke({
                color: '#05055E',
                width: 3,
            })
        })
        case Layers.ONE_HUNDRED_MILES: return feature => new Style({
            stroke: new Stroke({
                color: '#05055E',
                width: 3,
            })
        })
        case Layers.REGULATORY: return feature => new Style({
            stroke: new Stroke({
                color: '#05055E',
                width: 3,
            }),
            fill: new Fill({
                color: '#05055E'
            }),
        })

    }
}
