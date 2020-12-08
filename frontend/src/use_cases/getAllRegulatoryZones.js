import {getAllRegulatoryZonesFromAPI} from "../api/fetch";

const mapToRegulatoryZone = properties => {
    return {
        layerName: properties.layer_name,
        gears: properties.engins,
        zone: properties.zones,
        species: properties.especes,
        regulatoryReference: properties.references_reglementaires
    }
}

const getAllRegulatoryZones = () => (dispatch, getState) => {
    return getAllRegulatoryZonesFromAPI()
        .then(features => {
            const featuresWithoutGeometry = features.features.map(feature => {
                return mapToRegulatoryZone(feature.properties)
            })

            const uniqueFeaturesWithoutGeometry = featuresWithoutGeometry.reduce((acc, current) => {
                const found = acc.find(item =>
                    item.layerName === current.layerName &&
                    item.gears === current.gears &&
                    item.zone === current.zone &&
                    item.species === current.species &&
                    item.regulatoryReference === current.regulatoryReference);
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
        })
}

export default getAllRegulatoryZones
