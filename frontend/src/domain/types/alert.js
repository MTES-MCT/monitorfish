/**
 * @typedef Alert
 * @property {string} id
 * @property {string} type
 * @property {string} vesselName
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} vesselIdentifier
 * @property {string} creationDate
 * @property {number} tripNumber
 * @property {PendingAlert | PNOAndLANWeightToleranceAlert} value
 */

/**
 * @typedef PendingAlert
 * @property {number} speed
 * @property {string} type
 * @property {string | null} natinfCode
 * @property {string} seaFront
 * @property {string} flagState
 */

/**
 * @typedef SilencedAlert
 * @property {string} id
 * @property {string} vesselName
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} vesselIdentifier
 * @property {Date} silencedBeforeDate
 * @property {Date} silencedAfterDate
 * @property {PendingAlert | PNOAndLANWeightToleranceAlert} value
 * @property {boolean | null} isReactivated
 */

/**
 * @typedef PNOAndLANWeightToleranceAlert
 * @property {string} lanOperationNumber
 * @property {string} pnoOperationNumber
 * @property {number} percentOfTolerance
 * @property {number} minimumWeightThreshold
 * @property {PNOAndLANCatches[]} catchesOverTolerance
 * @property {string} type
 * @property {string} name
 */

/**
 * @typedef PNOAndLANCatches
 * @property {Object} pno
 * @property {Object} lan
 */

/**
 * @typedef SilencedAlertPeriodRequest
 * @property {string | null} silencedAlertPeriod
 * @property {Date | null} afterDateTime
 * @property {Date | null} beforeDateTime
 */
