/**
 * @typedef Gear
 * @property {number} dimension
 * @property {string} gear
 * @property {number} mesh
 */

/**
 * @typedef Species
 * @property {string} species
 * @property {string} faoZone
 * @property {string} gear
 * @property {number} weight
 */

/**
 * @typedef VesselLastPosition
 * @property {number} course
 * @property {string} dateTime
 * @property {string} departureDateTime
 * @property {string} destination
 * @property {string} district
 * @property {string} districtCode
 * @property {number} emissionPeriod
 * @property {string} externalReferenceNumber
 * @property {string} flagState
 * @property {string} from
 * @property {Gear[]} gearOnboard
 * @property {string} internalReferenceNumber
 * @property {string} ircs
 * @property {string} lastErsDateTime
 * @property {number} latitude
 * @property {number} length
 * @property {number} longitude
 * @property {string} mmsi
 * @property {string} positionType
 * @property {string} registryPortLocode
 * @property {string} registryPortName
 * @property {string[]} segments
 * @property {Species[]} speciesOnboard
 * @property {number} speed
 * @property {number} totalWeightOnboard
 * @property {number} tripNumber
 * @property {string} vesselName
 * @property {number} width
 * @property {string} lastControlDateTime
 * @property {boolean} lastControlInfraction
 * @property {number} postControlComment
 */

/**
 * @typedef VesselPosition
 * @property {number} course
 * @property {string} dateTime
 * @property {string} destination
 * @property {string} externalReferenceNumber
 * @property {string} flagState
 * @property {string} from
 * @property {string} internalReferenceNumber
 * @property {string} ircs
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} mmsi
 * @property {string} positionType
 * @property {number} speed
 * @property {number} tripNumber
 * @property {string} vesselName
 */

/**
 * @typedef Vessel
 * @property {string[]} declaredFishingGears
 * @property {string} district
 * @property {string} districtCode
 * @property {string} externalReferenceNumber
 * @property {string} flagState
 * @property {number} gauge
 * @property {number} id
 * @property {string} imo
 * @property {string} internalReferenceNumber
 * @property {string} ircs
 * @property {number} length
 * @property {string} mmsi
 * @property {string} navigationLicenceExpirationDate
 * @property {string[]} operatorEmails
 * @property {string} operatorName
 * @property {string[]} operatorPhones
 * @property {boolean} pinger
 * @property {VesselPosition[]} positions
 * @property {number} power
 * @property {string[]} proprietorEmails
 * @property {string} proprietorName
 * @property {string[]} proprietorPhones
 * @property {string} registryPort
 * @property {string} sailingCategory
 * @property {string} sailingType
 * @property {string[]} vesselEmails
 * @property {string} vesselName
 * @property {string[]} vesselPhones
 * @property {string} vesselType
 * @property {number} width
 */
