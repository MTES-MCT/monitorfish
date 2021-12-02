/**
 * @typedef Regulation
 * @property {string} bloc
 * @property {string} zoneTheme
 * @property {string} zoneName
 * @property {string} seaFront
 * @property {string} region
 * @property {GeoJSONGeometry} geometry
 * @property {[RegulatoryText]} regulatoryTextList
 * @property {[UpcomingRegulation]} UpcomingRegulationList
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
 * @typedef UpcomingRegulationList
 * @property {[RegulatoryText]} regulatoryTextList
 */

/**
 * @typedef SelectedRegulatoryZone
 * @property {string} topic
 * @property {string} zone
 * @property {string} prohibitedGears
 * @property {string} gears
 * @property {string} zone
 * @property {string} species
 * @property {string} prohibitedSpecies
 * @property {string} regulatoryReferences
 * @property {string} region
 */

/**
 * @typedef RegulatoryTopics {Object.<string, SelectedRegulatoryZone[]>}
 **/

/**
 * @typedef RegulatoryLawTypes {Object.<string, RegulatoryTopics>}
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
 * @typedef RegulatorySpeciesDetail
 * @property {string} code - FAO code
 * @property {string} quantity
 * @property {string} minimumSize
 */