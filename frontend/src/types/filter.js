/**
 * @typedef VesselFilter
 * @property {FilterValues} filters
 * @property {string} name
 * @property {string} color
 * @property {boolean} showed
 * @property {string} uuid
 */

/**
 * @typedef FilterValues
 * @property {string[]} countriesFiltered
 * @property {string[]} fleetSegmentsFiltered
 * @property {string[]} gearsFiltered
 * @property {string[]} speciesFiltered
 * @property {string[]} districtsFiltered
 * @property {string[]} vesselsSizeValuesChecked
 * @property {{
 *      name: string,
 *      code: string,
 *      feature: GeoJSONGeometry
 *    }[]} zonesSelected
 */
