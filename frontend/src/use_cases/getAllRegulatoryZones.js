import {getAllRegulatoryZonesFromAPI} from "../api/fetch";

const getRegulatoryZone = properties => {
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
                return getRegulatoryZone(feature.properties)
            })

            const uniqueFeaturesWithoutGeometry = featuresWithoutGeometry.reduce((acc, current) => {
                const found = acc.find(item =>
                    item.layer_name === current.layer_name &&
                    item.gears === current.gears &&
                    item.zones === current.zones &&
                    item.species === current.species &&
                    item.regulatoryReference === current.regulatoryReference);
                if (!found) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);

            return uniqueFeaturesWithoutGeometry
        })
}

export default getAllRegulatoryZones