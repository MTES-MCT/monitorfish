/**
 * @typedef Regulation
 * @property {string} bloc
 * @property {string} zoneTheme
 * @property {string} zoneName
 * @property {string} seaFront
 * @property {string} region
 * @property {GeoJSONGeometry} geometry
 * @property {[RegulatoryText]} regulatoryTextList
 * @property {[RegulatoryTextToCome]} regulatoryTextToComeList
 * @property {string} color
 * @property {boolean} showed
 * @property {string} uuid
 */

/**
 * @typedef {string} RegulatoryTextType
 **/

/**
 * @typedef RegulatoryText
 * @property {string} textName
 * @property {string} textURL
 * @property {startDate} Date
 * @property {endDate | 'infinite'} Date
 * @property {RegulatoryTextType} textType
 */

/**
 * @typedef RegulatoryTextToCome
 * @property {[RegulatoryText]} regulatoryTextList
 */
