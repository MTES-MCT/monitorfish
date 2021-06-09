/**
 * @typedef CRS
 * @property {string} type
 * @property {Object} properties
 */

/**
 * @typedef GeoJSON
 * @property {CRS} crs
 * @property {number[]} bbox
 * @property {Object[]} features
 * @property {number} numberMatched
 * @property {number} numberReturned
 * @property {string} timeStamp
 * @property {number} totalFeatures
 * @property {string} type
 */

/**
 * @typedef GeoJSONGeometry
 * @property {{type: string, coordinates: Object}} geometry
 */