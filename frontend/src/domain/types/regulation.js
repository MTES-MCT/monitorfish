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
 * @property {date} from
 * @property {date} to
 */

/**
 * @typedef HourInterval
 * @property {time} from
 * @property {time} to
 */

/**
 * @typedef FishingPeriod
 * @property {boolean} authorized
 * @property {boolean} annualRecurrence
 * @property {(DateInterval)} dateInterval
 * @property {date} date
 * @property {(string)} weekDays
 * @property {boolean} holidays
 * @property {HourInterval} timeInterval
 * @property {boolean} daytime
 */
