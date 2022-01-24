/**
 * @typedef BeaconStatus
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
 * @typedef UpdateBeaconStatus
 * @property {string | null} [vesselStatus]
 * @property {string | null} [stage]
 */

/**
 * @typedef BeaconStatusComment
 * @property {number} id
 * @property {string} comment
 * @property {string} userType
 * @property {string} dateTime
 */

/**
 * @typedef BeaconStatusCommentInput
 * @property {string} comment
 * @property {string} userType
 */

/**
 * @typedef BeaconStatusWithDetails
 * @property {BeaconStatus} beaconStatus
 * @property {BeaconStatusComment[]} comments
 */
