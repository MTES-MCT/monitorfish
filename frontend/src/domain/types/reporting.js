/**
 * @typedef Reporting
 * @property {string} id
 * @property {ReportingType<string>} type
 * @property {string} vesselName
 * @property {string} internalReferenceNumber
 * @property {string} externalReferenceNumber
 * @property {string} ircs
 * @property {string} vesselIdentifier
 * @property {string} creationDate
 * @property {string} validationDate
 * @property {PendingAlert | InfractionSuspicion | Observation} value
 */

/**
 * @typedef CurrentAndArchivedReportingsOfSelectedVessel
 * @property {Reporting[]} current
 * @property {Reporting[]} archived
 */

/**
 * @typedef InfractionSuspicion
 * @property {string} reportingActor
 * @property {string | null} unit
 * @property {string | null} authorTrigram
 * @property {string | null} authorContact
 * @property {string} title
 * @property {string} description
 * @property {string} natinfCode
 * @property {string} dml
 */

/**
 * @typedef Observation
 * @property {string} reportingActor
 * @property {string | null} unit
 * @property {string | null} authorTrigram
 * @property {string | null} authorContact
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef UpdateReporting
 * @property {string} reportingActor
 * @property {string | undefined} unit
 * @property {string | undefined} authorTrigram
 * @property {string | undefined} authorContact
 * @property {string} title
 * @property {string | undefined} description
 * @property {string | undefined} natinfCode
 * @property {string | undefined} dml
 */
