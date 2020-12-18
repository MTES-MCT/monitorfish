import * as Comlink from 'comlink'
import {mapToRegulatoryZone} from '../domain/entities/regulatory'

class MapperWorker {
    convertGeoJSONFeaturesToObject(features) {
        const featuresWithoutGeometry = features.features.map(feature => {
            return mapToRegulatoryZone(feature.properties)
        })

        const uniqueFeaturesWithoutGeometry = featuresWithoutGeometry.reduce((acc, current) => {
            const found = acc.find(item =>
                item.layerName === current.layerName &&
                item.zone === current.zone);
            if (!found) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        const layerNamesArray = uniqueFeaturesWithoutGeometry
            .map(layer => layer.layerName)
            .map(layerName => {
                return uniqueFeaturesWithoutGeometry.filter(layer => layer.layerName === layerName)
            })

        const layersNamesToZones = layerNamesArray.reduce((accumulatedObject, zone) => {
            accumulatedObject[zone[0].layerName] = zone;
            return accumulatedObject;
        }, {});

        return layersNamesToZones
    }
}

Comlink.expose(MapperWorker)
