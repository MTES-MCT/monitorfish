/**
 * @typedef Reporting
 * @property {string} id
 * @property {string} type
 * @property {string} vesselName
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} vesselIdentifier
 * @property {string} creationDate
 * @property {string} validationDate
 * @property {PendingAlert} value
 */

/**
 * @typedef CurrentAndArchivedReportings
 * @property {Reporting[]} current
 * @property {Reporting[]} archived
 */

