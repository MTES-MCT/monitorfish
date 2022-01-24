/**
 * @typedef VesselVoyage
 * @property {boolean} isLastVoyage
 * @property {boolean} isFirstVoyage
 * @property {string | null} startDate
 * @property {string | null} endDate
 * @property {int} tripNumber
 * @property {FishingActivities} ersMessagesAndAlerts
 */

/**
 * @typedef FishingActivities
 * @property {Alert[]} alerts
 * @property {ERSMessage[]} ersMessages
 */

/**
 * @typedef ERSMessage
 * @property {{
        isSuccess: boolean,
        rejectionCause: string,
        returnStatus: string
      }} acknowledge
 * @property {boolean} deleted
 * @property {string} ersId
 * @property {string} externalReferenceNumber
 * @property {string} flagState
 * @property {string} imo
 * @property {string} internalReferenceNumber
 * @property {string} ircs
 * @property {boolean} isCorrected
 * @property {Object} message
 * @property {string} messageType
 * @property {string} operationDateTime
 * @property {string} operationNumber
 * @property {string} operationType
 * @property {string} rawMessage
 * @property {string} referencedErsId
 * @property {number} tripNumber
 * @property {string} vesselName
 */
