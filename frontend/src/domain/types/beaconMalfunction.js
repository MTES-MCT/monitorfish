/**
 * @typedef BeaconMalfunction
 * @property {number} id
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} vesselIdentifier
 * @property {string} vesselName
 * @property {string} vesselStatus
 * @property {string} stage
 * @property {boolean} priority
 * @property {string} malfunctionStartDateTime
 * @property {string | null} malfunctionEndDateTime
 * @property {string} vesselStatusLastModificationDateTime
 */

/**
 * @typedef UpdateBeaconMalfunction
 * @property {string | null} [vesselStatus]
 * @property {string | null} [stage]
 */

/**
 * @typedef BeaconMalfunctionComment
 * @property {number} id
 * @property {string} comment
 * @property {string} userType
 * @property {string} dateTime
 */

/**
 * @typedef BeaconMalfunctionAction
 * @property {number} id
 * @property {int} beaconMalfunctionId
 * @property {string} propertyName
 * @property {string} previousValue
 * @property {string} nextValue
 * @property {string} dateTime
 */

/**
 * @typedef BeaconMalfunctionCommentInput
 * @property {string} comment
 * @property {string} userType
 */

/**
 * @typedef BeaconMalfunctionResumeAndDetails
 * @property {BeaconMalfunction} beaconMalfunction
 * @property {BeaconMalfunctionComment[]} comments
 * @property {BeaconMalfunctionAction[]} actions
 */

/**
 * @typedef VesselBeaconMalfunctionsResumeAndHistory
 * @property {BeaconMalfunctionResumeAndDetails || null} current
 * @property {VesselBeaconMalfunctionsResume} resume
 * @property {BeaconMalfunctionResumeAndDetails[]} history
 * @property {VesselIdentity} vesselIdentity
 */

/**
 * @typedef VesselBeaconMalfunctionsResume
 * @property {number} numberOfBeaconsAtSea
 * @property {number} numberOfBeaconsAtPort
 * @property {string || null} lastBeaconStatusDateTime
 * @property {string || null} lastBeaconStatusVesselStatus
 */
