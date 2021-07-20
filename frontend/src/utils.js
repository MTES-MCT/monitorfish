import { transform } from 'ol/proj'
import { CoordinatesFormat, WSG84_PROJECTION } from './domain/entities/map'
import { toStringHDMS } from 'ol/coordinate'
import { asArray, asString } from 'ol/color'
import { createSlice } from '@reduxjs/toolkit'

export const calculatePointsDistance = (coord1, coord2) => {
  const dx = coord1[0] - coord2[0]
  const dy = coord1[1] - coord2[1]

  return Math.sqrt(dx * dx + dy * dy)
}

export const calculateSplitPointCoords = (startNode, nextNode, distanceBetweenNodes, distanceToSplitPoint) => {
  const d = distanceToSplitPoint / distanceBetweenNodes
  const x = nextNode[0] + (startNode[0] - nextNode[0]) * d
  const y = nextNode[1] + (startNode[1] - nextNode[1]) * d

  return [x, y]
}

/**
 * Get coordinates in the specified format
 * @param {number[]} coordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @param {string} projection - The project of the entered coordinates.
 * @param {string} coordinatesFormat - The wanted format of the returned coordinates (DMS, DMD or DD)
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates
 */
export const getCoordinates = (coordinates, projection, coordinatesFormat) => {
  const transformedCoordinates = transform(coordinates, projection, WSG84_PROJECTION)

  switch (coordinatesFormat) {
    case CoordinatesFormat.DEGREES_MINUTES_SECONDS:
      return getDMSCoordinates(transformedCoordinates)
    case CoordinatesFormat.DEGREES_MINUTES_DECIMALS:
      return getDMDCoordinates(transformedCoordinates)
    case CoordinatesFormat.DECIMAL_DEGREES:
      return getDDCoordinates(transformedCoordinates)
  }
}

/**
 * Get coordinates in DD format
 * @param {number[]} transformedCoordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates in DD format
 */
function getDDCoordinates (transformedCoordinates) {
  if (!Array.isArray(transformedCoordinates) ||
    transformedCoordinates.length !== 2 ||
    !transformedCoordinates[0] ||
    !transformedCoordinates[1]) {
    return []
  }

  const negative = Math.sign(transformedCoordinates[0])
  const degreeSplit = transformedCoordinates[0].toString().split('.')
  if (degreeSplit.length) {
    let degree = degreeSplit[0].trim().replace(/-/g, '')
    switch (degree.length) {
      case 1:
        degree = `${negative ? '-' : ''}00${degree}.${degreeSplit[1].substring(0, 4)}`
        break
      case 2:
        degree = `${negative ? '-' : ''}0${degree}.${degreeSplit[1].substring(0, 4)}`
        break
      default:
        degree = `${negative ? '-' : ''}${degree}.${degreeSplit[1].substring(0, 4)}`
        break
    }

    return [
      `${transformedCoordinates[1] ? transformedCoordinates[1].toFixed(4) : null}°`,
      `${degree}°`
    ]
  }
}

/**
 * Get coordinates in DMD format
 * @param {number[]} transformedCoordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates in DMD format
 */
function getDMDCoordinates (transformedCoordinates) {
  const dms = getDMSCoordinates(transformedCoordinates)

  let latitude = dms[0]
  latitude = getDMDOf(latitude)

  let longitude = dms[1]
  longitude = getDMDOf(longitude)

  return [latitude, longitude]
}

function getDMDOf (latitudeOrLongitude) {
  const secondsSplit = latitudeOrLongitude.substring(
    latitudeOrLongitude.lastIndexOf('′') + 1,
    latitudeOrLongitude.lastIndexOf('″')
  )

  let decimal = ''
  if (secondsSplit) {
    decimal = (parseInt(secondsSplit) / 60).toFixed(3)
  }
  const firstPart = latitudeOrLongitude.split('′')[0]
  const lastPart = latitudeOrLongitude.split('″')[1]

  return `${firstPart}.${decimal.replace('0.', '')}′${lastPart}`
}

/**
 * Get coordinates in DMS format
 * @param {number[]} transformedCoordinates - Coordinates ([longitude, latitude]) in decimal format.
 * @returns {string[]} coordinates - The [latitude, longitude] coordinates in DMS format
 */
function getDMSCoordinates (transformedCoordinates) {
  const hourCoordinates = toStringHDMS(transformedCoordinates)

  const nSplit = hourCoordinates.split('N')
  if (nSplit.length > 1) {
    const degreeSplit = nSplit[1].split('°')
    if (degreeSplit.length) {
      let degree = degreeSplit[0].trim()
      switch (degree.length) {
        case 1:
          degree = `00${degree}`
          break
        case 2:
          degree = `0${degree}`
          break
        default:
          break
      }

      return [`${nSplit[0]} N`, `${degree}° ${degreeSplit[1]}`]
    }
  }

  const sSplit = hourCoordinates.split('S')
  if (sSplit.length > 1) {
    const degreeSplit = sSplit[1].split('°')
    if (degreeSplit.length) {
      let degree = degreeSplit[0].trim()
      switch (degree.length) {
        case 1:
          degree = `00${degree}`
          break
        case 2:
          degree = `0${degree}`
          break
        default:
          break
      }

      return [`${sSplit[0]} S`, `${degree}° ${degreeSplit[1]}`]
    }
  }

  const split = hourCoordinates.split('″')
  if (split.length > 2) {
    const degreeSplit = split[1].split('°')
    if (degreeSplit.length) {
      let degree = degreeSplit[0].trim()
      switch (degree.length) {
        case 1:
          degree = `00${degree}`
          break
        case 2:
          degree = `0${degree}`
          break
        default:
          break
      }

      return ['0° 00′ 00″', `${degree}° ${degreeSplit[1]}″${split[2]}`]
    }
  }
}

function getMonth (date) {
  const month = date.getUTCMonth() + 1
  return month < 10 ? '0' + month : '' + month
}

function getDay (date) {
  const day = date.getUTCDate()
  return day < 10 ? '0' + day : '' + day
}

export const getDate = dateString => {
  if (dateString) {
    const date = new Date(dateString)
    return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()}`
  }
}

export const getDateTime = (dateString, withoutSeconds) => {
  if (dateString) {
    const date = new Date(dateString)
    const timeOptions = withoutSeconds
      ? {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
          hourCycle: 'h24'
        }
      : {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
          hourCycle: 'h24'
        }

    let time = date.toLocaleTimeString([], timeOptions)
    time = time.replace(':', 'h')
    time = time.replace('24', '00')

    return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()} à ${time}`
  }
}

/**
 * get the date before nofMonths for a given {@param date}
 * @param {Date} date
 * @param {Number} nofMonths no of months to get date before
 * @returns {Date} date before nofMonths months
 */
export function getDateMonthsBefore (date, nofMonths) {
  const thisMonth = date.getMonth()
  // set the month index of the date by subtracting nofMonths from the current month index
  date.setMonth(thisMonth - nofMonths)
  // When trying to add or subtract months from a Javascript Date() Object which is any end date of a month,
  // JS automatically advances your Date object to next month's first date if the resulting date does not exist in its month.
  // For example when you add 1 month to October 31, 2008 , it gives Dec 1, 2008 since November 31, 2008 does not exist.
  // if the result of subtraction is negative and add 6 to the index and check if JS has auto advanced the date,
  // then set the date again to last day of previous month
  // Else check if the result of subtraction is non negative, subtract nofMonths to the index and check the same.
  if ((thisMonth - nofMonths < 0) && (date.getMonth() !== (thisMonth + nofMonths))) {
    date.setDate(0)
  } else if ((thisMonth - nofMonths >= 0) && (date.getMonth() !== thisMonth - nofMonths)) {
    date.setDate(0)
  }

  return date
}

export const arraysEqual = (a, b) => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export const getTextWidth = text => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = 'Normal 12px Arial'
  const metrics = context.measureText(text)

  return metrics.width
}

export const getLocalStorageState = (defaultValue, key) => {
  const stickyValue = window.localStorage.getItem(key)
  return stickyValue !== null
    ? JSON.parse(stickyValue)
    : defaultValue
}

export const getHash = string => {
  const len = string.length
  let h = 5381

  for (let i = 0; i < len; i++) {
    h = h * 33 ^ string.charCodeAt(i)
  }

  return h >>> 0
}

export const getColorWithAlpha = (color, alpha) => {
  const [r, g, b] = Array.from(asArray(color))
  return asString([r, g, b, alpha])
}

export const timeagoFrenchLocale = function (number, index) {
  return [
    ['à l\'instant', 'dans un instant'],
    ['il y a %s secondes', 'dans %s secondes'],
    ['il y a 1 minute', 'dans 1 minute'],
    ['il y a %s minutes', 'dans %s minutes'],
    ['il y a 1 heure', 'dans 1 heure'],
    ['il y a %s heures', 'dans %s heures'],
    ['il y a 1 jour', 'dans 1 jour'],
    ['il y a %s jours', 'dans %s jours'],
    ['il y a 1 semaine', 'dans 1 semaine'],
    ['il y a %s semaines', 'dans %s semaines'],
    ['il y a 1 mois', 'dans 1 mois'],
    ['il y a %s mois', 'dans %s mois'],
    ['il y a 1 an', 'dans 1 an'],
    ['il y a %s ans', 'dans %s ans']
  ][index]
}

const accentsMap = {
  a: 'á|à|ã|â|À|Á|Ã|Â',
  e: 'é|è|ê|É|È|Ê',
  i: 'í|ì|î|Í|Ì|Î',
  o: 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
  u: 'ú|ù|û|ü|Ú|Ù|Û|Ü',
  c: 'ç|Ç',
  n: 'ñ|Ñ'
}

export const removeAccents = text => Object.keys(accentsMap)
  .reduce((acc, cur) => acc.replace(new RegExp(accentsMap[cur], 'g'), cur), text)

export function getNauticalMilesFromMeters (length) {
  return Math.round((length / 1000) * 100 * 0.539957) / 100
}

export function createGenericSlice (initialState, reducers, layerName) {
  const initialStateCopy = Object.assign({}, initialState)
  const reducersCopy = Object.assign({}, reducers)
  const sliceObject = {
    name: layerName,
    initialState: initialStateCopy,
    reducers: reducersCopy
  }
  return createSlice(sliceObject)
}

export function findIfSearchStringIncludedInProperty (zone, propertiesToSearch, searchText) {
  return zone[propertiesToSearch] && searchText ? getTextForSearch(zone[propertiesToSearch]).includes(getTextForSearch(searchText)) : false
}

function getTextForSearch (text) {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[_]/g, '')
    .replace(/[-]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}

export function search (searchText, propertiesToSearch, regulatoryZones) {
  if (regulatoryZones) {
    const foundRegulatoryZones = { ...regulatoryZones }
    Object.keys(foundRegulatoryZones)
      .forEach(key => {
        foundRegulatoryZones[key] = foundRegulatoryZones[key]
          .filter(zone => {
            let searchStringIncludedInProperty = false
            propertiesToSearch.forEach(property => {
              searchStringIncludedInProperty =
                searchStringIncludedInProperty || findIfSearchStringIncludedInProperty(zone, property, searchText)
            })
            return searchStringIncludedInProperty
          })
        if (!foundRegulatoryZones[key] || !foundRegulatoryZones[key].length > 0) {
          delete foundRegulatoryZones[key]
        }
      })

    return foundRegulatoryZones
  }
}

export const formatDataForSelectPicker = list => {
  const array = list.map(e => {
    const obj = {
      label: e,
      value: e
    }
    return obj
  })
  return array
}
