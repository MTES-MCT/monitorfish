/**
 * @typedef BeaconMalfunction
 * @property {number} id
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} flagState
 * @property {string} vesselIdentifier
 * @property {string} vesselName
 * @property {string} vesselStatus
 * @property {string} stage
 * @property {boolean} priority
 * @property {string} malfunctionStartDateTime
 * @property {string | null} malfunctionEndDateTime
 * @property {string} vesselStatusLastModificationDateTime
 * @property {string} endOfBeaconMalfunctionReason
 * @property {string} notificationRequested
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
 * @typedef BeaconMalfunctionNotification
 * @property {number} id
 * @property {int} beaconMalfunctionId
 * @property {string} notificationType
 * @property {string} communicationMeans
 * @property {string} recipientFunction
 * @property {string} recipientName
 * @property {string} recipientAddressOrNumber
 * @property {string} dateTime
 * @property {boolean || null} success
 * @property {string || null} errorMessage
 */

/**
 * @typedef BeaconMalfunctionNotifications
 * @property {int} beaconMalfunctionId
 * @property {string} notificationType
 * @property {string} dateTimeUtc
 * @property {BeaconMalfunctionNotification[]} notifications
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
 * @property {VesselBeaconMalfunctionsResume} resume
 * @property {BeaconMalfunctionNotifications[]} notifications
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
 * @property {string || null} lastBeaconMalfunctionDateTime
 * @property {string || null} lastBeaconMalfunctionVesselStatus
 */
