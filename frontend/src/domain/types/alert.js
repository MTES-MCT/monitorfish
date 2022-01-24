/**
 * @typedef Alert
 * @property {string} id
 * @property {string} type
 * @property {string} vesselName
 * @property {string} flagState
 * @property {string} internalReferenceNumber
 * @property {string} creationDate
 * @property {number} tripNumber
 * @property {ThreeMilesTrawlingAlert | PNOAndLANWeightToleranceAlert} value
 */

/**
 * @typedef ThreeMilesTrawlingAlert
 * @property {number} numberOfIncursion
 * @property {number} speed
 * @property {string} type
 * @property {string} name
 * @property {string} seaFront
 * @property {string} flagState
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
