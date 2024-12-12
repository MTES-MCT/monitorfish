import { createSlice } from '@reduxjs/toolkit'
import GeoJSON from 'ol/format/GeoJSON'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './features/Map/constants'

import type { GeoJSON as GeoJSONType } from './domain/types/GeoJSON'
import type { Extent } from 'ol/extent'

export const customHexToRGB = (hexColor: string | undefined): [number, number, number] => {
  if (!hexColor) {
    return [0, 0, 0]
  }
  const [r, g, b] = hexColor.substring(1).match(/.{1,2}/g) ?? []
  if (!r || !g || !b) {
    return [0, 0, 0]
  }

  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)]
}

export const booleanToInt = boolean => (boolean ? 1 : 0)
export const calculatePointsDistance = (coord1, coord2) => {
  const dx = coord1[0] - coord2[0]
  const dy = coord1[1] - coord2[1]

  return Math.sqrt(dx * dx + dy * dy)
}

export const calculateSplitPointCoordinates = (startNode, nextNode, distanceBetweenNodes, distanceToSplitPoint) => {
  const d = distanceToSplitPoint / distanceBetweenNodes
  const x = nextNode[0] + (startNode[0] - nextNode[0]) * d
  const y = nextNode[1] + (startNode[1] - nextNode[1]) * d

  return [x, y]
}

function getMonth(date) {
  const month = date.getUTCMonth() + 1

  return month < 10 ? `0${month}` : `${month}`
}

function getDay(date) {
  const day = date.getUTCDate()

  return day < 10 ? `0${day}` : `${day}`
}

export const getDate = dateString => {
  if (dateString) {
    const date = new Date(dateString)

    return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()}`
  }

  return ''
}

export const getTime = (dateString: string, withoutSeconds: boolean) => {
  const date = new Date(dateString)

  let time = date.toLocaleTimeString([], {
    hour: '2-digit',
    hourCycle: 'h24',
    minute: '2-digit',
    second: withoutSeconds ? undefined : '2-digit',
    timeZone: 'UTC'
  })
  time = time.replace(':', 'h')
  time = time.replace('24h', '00h')

  return time
}

export const getDateTime = (dateString: string | undefined | null, withoutSeconds: boolean = false) => {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)
  const time = getTime(dateString, withoutSeconds)

  return `${getDay(date)}/${getMonth(date)}/${date.getUTCFullYear()} à ${time}`
}

/**
 * get the date before nofMonths for a given {@param date}
 * @param {Date} date
 * @param {Number} nofMonths no of months to get date before
 * @returns {Date} date before nofMonths months
 */
export function getDateMonthsBefore(date, nofMonths) {
  const thisMonth = date.getMonth()
  // set the month index of the date by subtracting nofMonths from the current month index
  date.setMonth(thisMonth - nofMonths)
  // When trying to add or subtract months from a Javascript Date() Object which is any end date of a month,
  // JS automatically advances your Date object to next month's first date if the resulting date does not exist in its month.
  // For example when you add 1 month to October 31, 2008 , it gives Dec 1, 2008 since November 31, 2008 does not exist.
  // if the result of subtraction is negative and add 6 to the index and check if JS has auto advanced the date,
  // then set the date again to last day of previous month
  // Else check if the result of subtraction is non negative, subtract nofMonths to the index and check the same.
  if (thisMonth - nofMonths < 0 && date.getMonth() !== thisMonth + nofMonths) {
    date.setDate(0)
  } else if (thisMonth - nofMonths >= 0 && date.getMonth() !== thisMonth - nofMonths) {
    date.setDate(0)
  }

  return date
}

/** @deprecated Use `@libs/localStorageManager`. */
export const getLocalStorageState = <T>(defaultValue: T, key: string): T => {
  const stickyValue = window.localStorage.getItem(key)

  return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
}

const SECONDS = 60
const MINUTES = 60
const HOURS = 24
const SECONDS_IN_DAY = HOURS * MINUTES * SECONDS

export function timeagoFrenchLocale(_, index, totalSec) {
  // Between 105s - 120s, round up to 2 minutes
  // Won’t work for already mounted components because won’t update between 60-120s
  if (index === 2 && totalSec >= 105) {
    return ['2 minutes ago', 'in 2 minutes']
  }

  // 1-6 days ago should be based on actual days of the week (from 0:00 - 23:59)
  if (index === 6 || index === 7) {
    // Calculate seconds since midnight for right now
    const now = new Date()
    const secondsSinceMidnight = now.getSeconds() + now.getMinutes() * SECONDS + now.getHours() * MINUTES * SECONDS

    // Subtract seconds since midnight from totalSec, divide by seconds in a day, round down
    // Result is off-by-one number of days since datetime (unless time was at midnight)
    const daysFloored = Math.floor((totalSec - secondsSinceMidnight) / SECONDS_IN_DAY)
    // If time was at midnight (00:00), it will divide evenly with SECONDS_IN_DAY
    // That will make it count as from the previous day, which we do not want
    const remainder = (totalSec - secondsSinceMidnight) % SECONDS_IN_DAY
    const days = remainder >= 1 ? daysFloored + 1 : daysFloored
    const noun = days === 1 ? 'jour' : 'jours'

    return [`il y a ${days} ${noun}`, `${days} ${noun}`]
  }

  // For 9-12 days ago, Convert “1 week ago” to “__ days ago”
  // For 13 days, round it to “2 weeks ago”
  if (index === 8) {
    const days = Math.round(totalSec / (SECONDS * MINUTES * HOURS))
    if (days > 8) {
      return days === 13 ? ['il y a 2 semaines', '2 semaines'] : [`il y a ${days} jours`, `${days} jours`]
    }
  }

  // For below 62 days (~ 2 months), show days number
  if (index === 9 || index === 10) {
    const days = Math.round(totalSec / (SECONDS * MINUTES * HOURS))
    if (days <= 62) {
      return [`il y a ${days} jours`, `${days} jours`]
    }

    return ['il y a %s mois', '%s mois']
  }

  return [
    ["à l'instant", 'un instant'],
    ['il y a %s secondes', '%s secondes'],
    ['il y a 1 minute', '1 minute'],
    ['il y a %s minutes', '%s minutes'],
    ['il y a 1 heure', '1 heure'],
    ['il y a %s heures', '%s heures'],
    ['il y a 1 jour', '1 jour'],
    ['il y a %s jours', '%s jours'],
    ['il y a 1 semaine', '1 semaine'],
    ['il y a %s semaines', '%s semaines'],
    ['il y a 1 mois', '1 mois'],
    ['il y a %s mois', '%s mois'],
    ['il y a 1 an', '1 an'],
    ['il y a %s ans', '%s ans']
  ][index]
}

const accentsMap = {
  a: 'á|à|ã|â|À|Á|Ã|Â',
  c: 'ç|Ç',
  e: 'é|è|ê|É|È|Ê',
  i: 'í|ì|î|Í|Ì|Î',
  n: 'ñ|Ñ',
  o: 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
  u: 'ú|ù|û|ü|Ú|Ù|Û|Ü'
}

export const removeAccents = text =>
  Object.keys(accentsMap).reduce((acc, cur) => acc.toString().replace(new RegExp(accentsMap[cur], 'g'), cur), text)

export function getTextForSearch(text) {
  if (!text) {
    return ''
  }

  return removeAccents(text)
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[_]/g, '')
    .replace(/[-]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}

export function getNauticalMilesFromMeters(length) {
  return Math.round((length / 1000) * 100 * 0.539957) / 100
}

export function createGenericSlice(initialState, reducers, topic) {
  const initialStateCopy = { ...initialState }
  const reducersCopy = { ...reducers }
  const sliceObject = {
    initialState: initialStateCopy,
    name: topic,
    reducers: reducersCopy
  }

  return createSlice(sliceObject)
}

/**
 * Get the extent of the first feature found in the GeoJSON object
 */
export const getExtentFromGeoJSON = (features: GeoJSONType.GeoJson): Extent | undefined => {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  const [firstFeature] = vectorSource.getFormat()?.readFeatures(features) ?? []
  if (!firstFeature) {
    return undefined
  }

  return firstFeature.getGeometry()?.getExtent()
}

/**
 * Merge objects with a key to array structure
 * Example: {
 *   {
 *     '2018-05-11': [],
 *     '2018-05-16': []
 *   }
 * @param {Object} objectOne - First object
 * @param {Object} objectTwo - Second object
 * @return {Object} The merged object
 */
export function mergeObjects(objectOne, objectTwo) {
  const mergedObject = {}

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(objectOne)) {
    if (!mergedObject[key]) {
      mergedObject[key] = []
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const innerKey of objectOne[key]) {
      mergedObject[key].push(innerKey)
    }
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(objectTwo)) {
    if (!mergedObject[key]) {
      mergedObject[key] = []
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const innerKey of objectTwo[key]) {
      mergedObject[key].push(innerKey)
    }
  }

  return mergedObject
}
