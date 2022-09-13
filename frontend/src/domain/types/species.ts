/**
 * @typedef Species
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef SpeciesGroup
 * @property {string} group
 * @property {string} comment
 */

/**
 * @typedef SpeciesAndSpeciesGroupsAPIData
 * @property {Species[]} species
 * @property {SpeciesGroup[]} groups
 */

/**
 * @typedef SpeciesAndSpeciesGroups
 * @property {Species[]} species
 * @property {Object<string, Object>} speciesByCode
 * @property {SpeciesGroup[]} groups
 */
