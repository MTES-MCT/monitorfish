/**
 * @typedef RegulatoryZone
 * @property {string} lawType
 * @property {string} topic
 * @property {string} zone
 * @property {RegulatoryGears} regulatoryGears
 * @property {RegulatorySpecies} regulatorySpecies
 * @property {RegulatoryText[]} regulatoryReference
 * @property {GeoJSONGeometry} geometry
 * @property {string} region
 * @property {string} color
 * @property {boolean} showed
 * @property {string} uuid
 */

/**
 * @typedef RegulatoryText
 * @property {string} textName
 * @property {string} textURL
 * @property {startDate} Date
 * @property {endDate | 'infinite'} Date
 * @property {RegulatoryTextType} textType
 */

/**
 * @typedef {Map<string, RegulatoryZone[]>} RegulatoryTopics - key is a topic
 **/

/**
 * @typedef {Map<string, RegulatoryTopics>} RegulatoryLawTypes - key is the law type name
 **/

/**
 * @typedef DateInterval
 * @property {date} startDate
 * @property {date} endDate
 * /

/**
 * @typedef TimeInterval
 * @property {date} from
 * @property {date} to
 */

/**
 * @typedef FishingPeriod
 * @property {boolean} authorized
 * @property {boolean} annualRecurrence
 * @property {[DateInterval]} dateRanges
 * @property {[date]} dates
 * @property {[string]} weekdays
 * @property {boolean} holidays
 * @property {TimeInterval} timeIntervals
 * @property {boolean} holidays
 * @property {boolean} daytime
 * @property {string} otherInfo
 * @property {boolean} allYear
 */

/**
 * @typedef RegulatorySpeciesDetail
 * @property {string} code - FAO code
 * @property {string} quantity
 * @property {string} minimumSize
 */

/**
 * @typedef RegulatorySpecies
 * @property {boolean} authorized
 * @property {boolean} allSpecies
 * @property {string} otherInfo
 * @property {RegulatorySpeciesDetail[]} species
 * @property {string[]} speciesGroups - group name
 */

/**
 * @typedef Gear
 * @property {string} code
 * @property {string} name
 * @property {string} groupId
 * @property {string} category
 * @property {string} meshType - (One of greaterThan, greaterThanOrEqualTo, lowerThan, lowerThanOrEqualTo, equal, between)
 * @property {string[]} mesh
 */

/**
 * @typedef GearCategory
 * @property {string} name
 * @property {string} meshType
 * @property {string[]} mesh
 */

/**
 * @typedef RegulatoryGears
 * @property {boolean} authorized
 * @property {boolean} allGears
 * @property {boolean} allTowedGears
 * @property {boolean} allPassiveGears
 * @property {Gear[]} regulatedGears
 * @property {Object<string,GearCategory>} regulatedGearCategories
 * @property {string[]} selectedCategoriesAndGears - a list of categories name and gears code
 * @property {boolean} derogation
 * @property {string} otherInfo
*/

/**
 * @typedef RegulatorySpeciesDetail
 * @property {string} code - FAO code
 * @property {string} quantity
 * @property {string} minimumSize
 */
