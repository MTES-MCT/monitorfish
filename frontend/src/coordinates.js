import { transform } from 'ol/proj'
import { CoordinatesFormat, WSG84_PROJECTION } from './domain/entities/map'

const CoordinateLatLon = {
  LATITUDE: 'LATITUDE',
  LONGITUDE: 'LONGITUDE'
}

/**
 * Get coordinates in the specified format
 * @param {number[]} coordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @param {string} projection - The project of the entered coordinates.
 * @param {string} coordinatesFormat - The wanted format of the returned coordinates (DMS, DMD or DD)
 * @param {boolean} forPrint - If it's for print or not. Default to true
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates
 */
export const getCoordinates = (coordinates, projection, coordinatesFormat, forPrint = true) => {
  if (!coordinates) {
    return ['', '']
  }
  const transformedCoordinates = transform(coordinates, projection, WSG84_PROJECTION)

  switch (coordinatesFormat) {
    case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
      return getDMSCoordinates(transformedCoordinates)
    case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
      return getDMDCoordinates(transformedCoordinates)
    case CoordinatesFormat.DECIMAL_DEGREES:
      return getDDCoordinates(transformedCoordinates, forPrint)
  }
}

/**
 * Get coordinates in DD format
 * @param {number[]} transformedCoordinates - Coordinates ([longitude, latitude]) in DD format.
 * @param {boolean} forPrint - If it's for print or not
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates in DD format
 */
function getDDCoordinates (transformedCoordinates, forPrint) {
  if (!Array.isArray(transformedCoordinates) ||
    transformedCoordinates.length !== 2 ||
    !transformedCoordinates[0] ||
    !transformedCoordinates[1]) {
    return []
  }

  const negative = Math.sign(transformedCoordinates[0]) === -1
  const degreeSplit = transformedCoordinates[0].toString().split('.')
  const precision = forPrint ? 4 : 6

  if (degreeSplit.length) {
    let longitude = degreeSplit[0].trim().replace(/-/g, '')
    const decimals = degreeSplit[1] ? degreeSplit[1].substring(0, precision) : '000000'
    longitude = `${negative ? '-' : ''}${getPaddedDegrees(longitude, CoordinateLatLon.LONGITUDE)}.${decimals}`

    return [
      `${transformedCoordinates[1].toFixed(precision)}°`,
      `${longitude}°`
    ]
  }
}

/**
 * Get coordinates in DMD format
 * @param {number[]} transformedCoordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates in DMD format
 */
function getDMDCoordinates (transformedCoordinates) {
  const latitudeDMD = getDMDFromDecimal(transformedCoordinates[1], CoordinateLatLon.LATITUDE)
  const longitudeDMD = getDMDFromDecimal(transformedCoordinates[0], CoordinateLatLon.LONGITUDE)

  return [latitudeDMD, longitudeDMD]
}

/**
 * Get coordinates in DMS format
 * @param {number[]} transformedCoordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates in DMS format
 */
function getDMSCoordinates (transformedCoordinates) {
  const latitudeDMS = getDMSFromDecimal(transformedCoordinates[1], CoordinateLatLon.LATITUDE)
  const longitudeDMS = getDMSFromDecimal(transformedCoordinates[0], CoordinateLatLon.LONGITUDE)

  return [latitudeDMS, longitudeDMS]
}

function getDMDFromDecimal (dd, latitudeOrLongitude) {
  const hemisphere = getHemisphere(dd, latitudeOrLongitude)

  const absDD = Math.abs(dd)
  const degrees = truncate(absDD)
  const minutes = truncate((absDD - degrees) * 60)
  let decimal = (absDD - degrees) * 60
  decimal = ((decimal - Math.floor(decimal)) * Math.pow(10, 4)).toFixed(0)

  const formattedDegrees = getPaddedDegrees(degrees, latitudeOrLongitude)
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedDecimal = decimal.toString().padStart(3, '0').substring(0, 3)

  return `${formattedDegrees}° ${formattedMinutes}.${formattedDecimal}′ ${hemisphere}`
}

function getDMSFromDecimal (dd, latitudeOrLongitude) {
  const hemisphere = getHemisphere(dd, latitudeOrLongitude)

  const absDD = Math.abs(dd)
  const degrees = truncate(absDD)
  const minutes = truncate((absDD - degrees) * 60)
  const seconds = (Math.round(((((absDD - degrees) * 60 - minutes) * 60) + Number.EPSILON) * 100) / 100).toFixed(0)

  const formattedDegrees = getPaddedDegrees(degrees, latitudeOrLongitude)
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')

  return `${formattedDegrees}° ${formattedMinutes}′ ${formattedSeconds}″${hemisphere ? ` ${hemisphere}` : ''}`
}

const getHemisphere = (dd, latitudeOrLongitude) => {
  if (dd === 0) return ''

  switch (latitudeOrLongitude) {
    case CoordinateLatLon.LATITUDE: {
      return dd < 0
        ? 'S'
        : 'N'
    }
    case CoordinateLatLon.LONGITUDE: {
      return dd < 0
        ? 'W'
        : 'E'
    }
  }
}

const getPaddedDegrees = (degrees, latitudeOrLongitude) => {
  switch (latitudeOrLongitude) {
    case CoordinateLatLon.LATITUDE: {
      return degrees.toString().padStart(2, '0')
    }
    case CoordinateLatLon.LONGITUDE: {
      return degrees.toString().padStart(3, '0')
    }
  }
}

function truncate (n) {
  return n > 0
    ? Math.floor(n)
    : Math.ceil(n)
}

/**
 * Check if coordinates are the same or roughly the same (to the 0.000001 decimal degree - to avoid infinite rounding loop)
 * @param {number[]} nextCoordinates - Next coordinates ([longitude, latitude]) in decimal format.
 * @param {number[]} coordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @returns {boolean}
 */
export const coordinatesAreDistinct = (nextCoordinates, coordinates) => {
  const roundingDifference = 0.000002

  return nextCoordinates?.length && coordinates.length &&
    !isNaN(coordinates[0]) && !isNaN(coordinates[1]) &&
    !isNaN(nextCoordinates[0]) && !isNaN(nextCoordinates[1]) &&
    (coordinates[0] !== nextCoordinates[0] || coordinates[1] !== nextCoordinates[1]) &&
    (Math.abs(nextCoordinates[0] - coordinates[0]) > roundingDifference ||
      Math.abs(nextCoordinates[1] - coordinates[1]) > roundingDifference)
}
