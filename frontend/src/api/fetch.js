import Layers from "../domain/entities/layers"
import {OPENLAYERS_PROJECTION, WSG84_PROJECTION} from "../domain/entities/map";

const HTTP_OK = 200

const LAST_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les dernières positions"
const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"
const VESSEL_SEARCH_ERROR_MESSAGE = "Nous n'avons pas pu chercher les navires dans notre base"
const REGULATORY_ZONES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les zones réglementaires"
const REGULATORY_ZONE_METADATA_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la couche réglementaire"
const GEAR_CODES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les codes des engins de pêches"

function throwIrretrievableAdministrativeZoneError(e, type) {
    throw Error(`Nous n'avons pas pu récupérer la zone ${type} : ${e}`)
}

function throwIrretrievableRegulatoryZoneError(e, regulatoryZone) {
    throw Error(`Nous n'avons pas pu récupérer la zone réglementaire ${regulatoryZone.layerName}/${regulatoryZone.zone} : ${e}`)
}

export function getVesselsLastPositionsFromAPI() {
    return fetch('/bff/v1/vessels')
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(LAST_POSITIONS_ERROR_MESSAGE)
            }
        })
        .catch(error => {
            console.error(error)
            throw Error(LAST_POSITIONS_ERROR_MESSAGE)
        })
        .then(vessels => {
            return vessels
        })
}

export function getVesselFromAPI(internalReferenceNumber, externalReferenceNumber, IRCS) {
    internalReferenceNumber = internalReferenceNumber ? internalReferenceNumber : ""
    externalReferenceNumber = externalReferenceNumber ? externalReferenceNumber : ""
    IRCS = IRCS ? IRCS : ""

    return fetch(`/bff/v1/vessels/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${IRCS}`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
            }
        })
        .catch(error => {
            console.error(error)
            throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
        })
        .then(vessel => vessel)
}

export function searchVesselsFromAPI(searched) {
    searched = searched ? searched : ""

    return fetch(`/bff/v1/vessels/search?searched=${searched}`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(VESSEL_SEARCH_ERROR_MESSAGE)
            }
        })
        .catch(error => {
            console.error(error)
            throw Error(VESSEL_SEARCH_ERROR_MESSAGE)
        })
}

export function getAllRegulatoryZonesFromAPI() {
    return fetch(`${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=monitorfish:` +
        `${Layers.REGULATORY}&outputFormat=application/json&propertyName=layer_name,engins,especes,references_reglementaires,zones,facade,region`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
            }
        })
        .catch(error => {
            console.error(error)
            throw Error(REGULATORY_ZONES_ERROR_MESSAGE)
        })

}


export function getAdministrativeZoneFromAPI(type, extent) {
    return fetch(getAdministrativeZoneURL(type, extent))
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json().then(response => {
                    return response
                }).catch(e => {
                    throwIrretrievableAdministrativeZoneError(e, type);
                })
            } else {
                response.text().then(response => {
                    throwIrretrievableAdministrativeZoneError(response, type);
                })
            }
        }).catch(e => {
            throwIrretrievableAdministrativeZoneError(e, type);
        })
}

export function getAdministrativeZoneURL(type, extent) {
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS&` +
        `version=1.1.0&request=GetFeature&typename=monitorfish:${type}&` +
        `outputFormat=application/json&srsname=${WSG84_PROJECTION}&` +
        `bbox=${extent.join(',')},${OPENLAYERS_PROJECTION}`
    );
}

export function getRegulatoryZoneFromAPI(type, regulatoryZone) {
    try {
        return fetch(getRegulatoryZoneURL(type, regulatoryZone))
            .then(response => {
                if (response.status === HTTP_OK) {
                    return response.json().then(response => {
                        return response
                    }).catch(e => {
                        throwIrretrievableRegulatoryZoneError(e, regulatoryZone);
                    })
                } else {
                    response.text().then(response => {
                        throwIrretrievableRegulatoryZoneError(response, regulatoryZone);
                    })
                }
            }).catch(e => {
                throwIrretrievableRegulatoryZoneError(e, regulatoryZone);
            })
    } catch (e) {
        throwIrretrievableRegulatoryZoneError(e, regulatoryZone);
    }
}

export function getRegulatoryZoneURL(type, regulatoryZone) {
    if (!regulatoryZone.layerName) {
        throw new Error('Le nom de la couche n\'est pas renseigné')
    }
    if (!regulatoryZone.zone) {
        throw new Error('Le nom de la zone n\'est pas renseigné')
    }

    let filter = `layer_name='${regulatoryZone.layerName.replace(/'/g, '\'\'')}' AND zones='${regulatoryZone.zone.replace(/'/g, '\'\'')}'`;
    return (
        `${process.env.REACT_APP_GEOSERVER_LOCAL_URL}/geoserver/wfs?service=WFS` +
        `&version=1.1.0&request=GetFeature&typename=monitorfish:${type}` +
        `&outputFormat=application/json&CQL_FILTER=` +
        filter.replace(/'/g, '%27').replace(/ /g, '%20')
    )
}

export function getRegulatoryZoneMetadataFromAPI(regulatorySubZone) {

    let url
    try {
        url = getRegulatoryZoneURL(Layers.REGULATORY, regulatorySubZone)
    } catch (e) {
        return Promise.reject(e)
    }

    return fetch(url)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json().then(response => {
                    if (response.features.length === 1) {
                        return response.features[0].properties
                    } else {
                        throw Error("We found multiple layers for this layer")
                    }
                })
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
            }
        }).catch(error => {
            console.error(error)
            throw Error(REGULATORY_ZONE_METADATA_ERROR_MESSAGE)
        })
}

export function getAllGearCodesFromAPI() {
    return fetch(`/bff/v1/gears`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(GEAR_CODES_ERROR_MESSAGE)
            }
        }).catch(error => {
            console.error(error)
            throw Error(GEAR_CODES_ERROR_MESSAGE)
        })
}

export function getVesselERSMessagesFromAPI(vesselIdentity) {
    let internalReferenceNumber = vesselIdentity.internalReferenceNumber ? vesselIdentity.internalReferenceNumber : ""
    let externalReferenceNumber = vesselIdentity.externalReferenceNumber ? vesselIdentity.externalReferenceNumber : ""
    let ircs = vesselIdentity.ircs ? vesselIdentity.ircs : ""

    return Promise.resolve([{
        ersId: "1225234534",
        ersIdToDeleteOrCorrect: "",
        operationType: "DAT",
        operationDateTime: "2020-10-18T18:55Z",
        internalReferenceNumber: "",
        externalReferenceNumber: "",
        ircs: "",
        vesselName: "",
        flagState: "",
        imo: "",
        messageType: "DEP",
        parsedIntegrationDateTime: "",
        message: {
            'anticipatedActivity': 'FSH',
            'departureDatetimeUtc': '2020-10-18T18:55Z',
            'departurePort': 'FRHON',
            // TODO Ajouter le nom du port depuis le LOCODE
            'departurePortName': null,
            'gearOnboard': [{'gear': 'DRB', 'gearName': 'Drague', 'mesh': 92.0}, {'gear': 'OTB', 'gearName': 'Chalut de fond', 'mesh': 81.0}],
            'speciesOnboard': [{
                'economicZone': 'FRA',
                'effort_zone': 'B',
                'faoZone': '27.7.d',
                'freshness': null,
                'nb_fish': null,
                'packaging': 'BGS',
                'presentation': 'WHL',
                'preservationState': 'ALI',
                'species': 'SCE',
                'speciesName': 'Coquille St-Jacques atlantique',
                'statisticalRectangle': '28F0',
                'weight': 1.0
            }]
        },
    },
        {
            ersId: "1225234536",
            ersIdToDeleteOrCorrect: "",
            operationType: "DAT",
            operationDateTime: "2020-10-18T18:55Z",
            internalReferenceNumber: "",
            externalReferenceNumber: "",
            ircs: "",
            vesselName: "",
            flagState: "",
            imo: "",
            messageType: "FAR",
            parsedIntegrationDateTime: "2020-10-19T01:00Z",
            message: {
                'catches': [{
                    'economicZone': 'GBR',
                    'effort_zone': null,
                    'faoZone': '27.4.a',
                    'freshness': null,
                    'nb_fish': null,
                    'packaging': 'BOX',
                    'presentation': 'GUT',
                    'preservationState': 'FRE',
                    'species': 'HKE',
                    'speciesName': 'Merlu européen',
                    'statisticalRectangle': '49E6',
                    'weight': 1995.0
                },
                    {
                        'economicZone': 'GBR',
                        'effort_zone': null,
                        'faoZone': '27.4.a',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BOX',
                        'presentation': 'GUH',
                        'preservationState': 'FRE',
                        'species': 'HKE',
                        'speciesName': 'Merlu européen',
                        'statisticalRectangle': '49E6',
                        'weight': 33.0
                    },
                    {
                        'economicZone': 'GBR',
                        'effort_zone': null,
                        'faoZone': '27.4.a',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BOX',
                        'presentation': 'GUT',
                        'preservationState': 'FRE',
                        'species': 'LIN',
                        'speciesName': 'Lingue franche',
                        'statisticalRectangle': '49E6',
                        'weight': 754.0
                    },
                    {
                        'economicZone': 'GBR',
                        'effort_zone': null,
                        'faoZone': '27.4.b',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BOX',
                        'presentation': 'GUT',
                        'preservationState': 'FRE',
                        'species': 'POK',
                        'speciesName': 'Lieu noir',
                        'statisticalRectangle': '49E6',
                        'weight': 27.0
                    }],
                'farDatetimeUtc': '2020-10-19 01:00',
                'gear': 'LLS',
                'gearName': 'Palangre',
                'latitude': 60.43,
                'longitude': -3.633,
                'mesh': 80.0
            }
        },
        {
            ersId: "1225234539",
            ersIdToDeleteOrCorrect: "",
            operationType: "DAT",
            operationDateTime: "2020-10-19T01:00Z",
            internalReferenceNumber: "",
            externalReferenceNumber: "",
            ircs: "",
            vesselName: "",
            flagState: "",
            imo: "",
            messageType: "PNO",
            parsedIntegrationDateTime: "2020-10-19T01:00Z",
            message: {
                'catchOnboard': [{
                    'economicZone': 'FRA',
                    'effort_zone': null,
                    'faoZone': '27.8.b',
                    'freshness': null,
                    'nb_fish': null,
                    'packaging': 'BUL',
                    'presentation': 'WHL',
                    'preservationState': 'FRE',
                    'species': 'CTC',
                    'statisticalRectangle': '19E8',
                    'weight': 775.0
                },
                    {
                        'economicZone': 'FRA',
                        'effort_zone': null,
                        'faoZone': '27.8.b',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BUL',
                        'presentation': 'WHL',
                        'preservationState': 'FRE',
                        'species': 'LIN',
                        'speciesName': 'Lingue franche',
                        'statisticalRectangle': '19E8',
                        'weight': 754.0
                    },
                    {
                        'economicZone': 'FRA',
                        'effort_zone': null,
                        'faoZone': '27.8.b',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BUL',
                        'presentation': 'WHL',
                        'preservationState': 'FRE',
                        'species': 'WEG',
                        'statisticalRectangle': '19E8',
                        'weight': 85.0
                    },
                    {
                        'economicZone': 'FRA',
                        'effort_zone': null,
                        'faoZone': '27.8.b',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BUL',
                        'presentation': 'WHL',
                        'preservationState': 'FRE',
                        'species': 'POK',
                        'speciesName': 'Lieu noir',
                        'statisticalRectangle': '19E8',
                        'weight': 27.0
                    },
                    {
                        'economicZone': 'FRA',
                        'effort_zone': null,
                        'faoZone': '27.8.b',
                        'freshness': null,
                        'nb_fish': null,
                        'packaging': 'BUL',
                        'presentation': 'GUT',
                        'preservationState': 'FRE',
                        'species': 'HKE',
                        'statisticalRectangle': '19E8',
                        'weight': 10.0
                    }],
                'economicZone': 'FRA',
                'effort_zone': null,
                'faoZone': '27.8.b',
                'latitude': 45.389,
                'longitude': -1.303,
                'port': 'FRLC5',
                'portName': 'LA COTINIERE',
                'predictedArrivalDatetimeUtc': '2020-09-14T10:15Z',
                'purpose': 'LAN',
                'statisticalRectangle': '19E8',
                'trip_start_date': '2020-09-10'
            }
        },
        {
            ersId: "1225234526",
            ersIdToDeleteOrCorrect: "",
            operationType: "DAT",
            operationDateTime: "2020-10-18T18:55Z",
            internalReferenceNumber: "",
            externalReferenceNumber: "",
            ircs: "",
            vesselName: "",
            flagState: "",
            imo: "",
            messageType: "DIS",
            parsedIntegrationDateTime: "",
            message: {
                'catches': [{
                    'weight': 5.0,
                    'nb_fish': 1.0,
                    'species': 'NEP',
                    'faoZone': '27.8.a',
                    'freshness': null,
                    'packaging': 'BOX',
                    'effort_zone': null,
                    'presentation': 'DIM',
                    'economicZone': 'FRA',
                    'preservationState': 'ALI',
                    'statisticalRectangle': '24E5'
                }, {
                    'weight': 3.0,
                    'nb_fish': 2.0,
                    'species': 'BIB',
                    'faoZone': '27.8.a',
                    'freshness': null,
                    'packaging': 'BOX',
                    'effort_zone': null,
                    'presentation': 'DIM',
                    'economicZone': 'FRA',
                    'preservationState': 'FRE',
                    'statisticalRectangle': '24E5'
                }], 'discard_datetime_utc': '2020-10-19 13:38'
            }
        }])


    /*return fetch(`/bff/v1/ers/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${IRCS}`)
        .then(response => {
            if (response.status === HTTP_OK) {
                return response.json()
            } else {
                response.text().then(text => {
                    console.error(text)
                })
                throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
            }
        })
        .catch(error => {
            console.error(error)
            throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
        })
        .then(vessel => vessel)*/
}


