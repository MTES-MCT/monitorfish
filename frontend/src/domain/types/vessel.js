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
 * @typedef VesselIdentity
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} mmsi
 * @property {string} flagState
 * @property {string} vesselName
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
 * @property {string} vesselIdentifier
 * @property {boolean} lastControlInfraction
 * @property {number} postControlComment
 * @property {number} estimatedCurrentLatitude
 * @property {number} estimatedCurrentLongitude
 * @property {boolean} isAtPort
 * @property {boolean} underCharter
 * @property {String[]} alerts
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
 * @property {boolean} underCharter
 */

/**
 * @typedef SelectedVessel
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
 * @property {number} course
 * @property {string | null} dateTime
 * @property {string | null} departureDateTime
 * @property {string | null} destination
 * @property {number | null} emissionPeriod
 * @property {string | null} from
 * @property {Gear[] | null} gearOnboard
 * @property {string | null} lastErsDateTime
 * @property {number | null} latitude
 * @property {number | null} longitude
 * @property {string | null} positionType
 * @property {string | null} registryPortLocode
 * @property {string | null} registryPortName
 * @property {string[] | null} segments
 * @property {Species[] | null} speciesOnboard
 * @property {number | null} speed
 * @property {number | null} totalWeightOnboard
 * @property {number | null} tripNumber
 * @property {string | null} lastControlDateTime
 * @property {boolean | null} lastControlInfraction
 * @property {number | null} postControlComment
 * @property {boolean} underCharter
 */

/**
 * @typedef VesselTrackDepth
 * @property {string | null} trackDepth
 * @property {Date | null} afterDateTime
 * @property {Date | null} beforeDateTime
 */

/**
 * @typedef ShowedVesselTrack
 * @property {string} identity
 * @property {VesselIdentity} vessel
 * @property {string[]} coordinates
 * @property {VesselPosition[]} positions
 * @property {VesselTrackDepth} trackDepth
 * @property {boolean} toShow
 * @property {boolean} toHide
 */

/**
 * @typedef FishingActivityShowedOnMap
 * @property {string} id - The operation number for ERS
 * @property {Date} date - The effective date of message
 * @property {string} name - The message name
 * @property {string[] | null} coordinates - The coordinates of the fishing activity
 * @property {boolean} isDeleted - true if the message was deleted
 * @property {boolean} isNotAcknowledged - true id the message was not acknowledged
 */
