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
  .reduce((acc, cur) => acc.toString().replace(new RegExp(accentsMap[cur], 'g'), cur), text)

export function getTextForSearch (text) {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[ ]/g, '')
    .replace(/[_]/g, '')
    .replace(/[-]/g, '')
    .replace(/[']/g, '')
    .replace(/["]/g, '')
}

export function getNauticalMilesFromMeters (length) {
  return Math.round((length / 1000) * 100 * 0.539957) / 100
}

export function createGenericSlice (initialState, reducers, topic) {
  const initialStateCopy = Object.assign({}, initialState)
  const reducersCopy = Object.assign({}, reducers)
  const sliceObject = {
    name: topic,
    initialState: initialStateCopy,
    reducers: reducersCopy
  }
  return createSlice(sliceObject)
}

/**
 * @typedef SelectPickerObject
 * @prop {string} label
 * @prop {string} value
 * @prop {string} role
 */

/**
 * @param {string} element
 * @return {SelectPickerObject} */
const item = (e) => {
  return {
    label: e,
    value: e
  }
}

/**
 * @function convert a list of elements to a list of object :
 * [{label: element, value: element, role: groupName}]
 * @param {[SelectPickerObject]} list
 * @returns a new array
 */
export const formatDataForSelectPicker = (list, groupName) => {
  const orderedList = [...list]
  if (list?.length > 0) {
    const array = orderedList
      .sort()
      .map(e => {
        const i = item(e)
        if (groupName) {
          i.group = groupName
        }
        return i
      })
    return array
  }
  return []
}

/**
 * Format object's data as specified in the CSV column
 * @param {Object} initialObject - The value object
 * @param {Object} csvColumns - The columns to be exported in the CSV
 * @param {string[]=} filters - Filters of the exported columns contained in the csvColumns object
 * @returns a new array
 */
export function formatToCSVColumnsForExport (initialObject, csvColumns, filters) {
  let columnsKeys = Object.keys(csvColumns)

  if (filters?.length) {
    columnsKeys = columnsKeys.filter(value => {
      return filters.some(filter => value === filter)
    })
  }

  return columnsKeys
    .reduce(
      (obj, key) => {
        obj[csvColumns[key].name] = initialObject[csvColumns[key].code]
        return obj
      },
      {}
    )
}

/**
 * Get full days in date range (to avoid missing hours in the selected date range)
 * @param {string | Date} afterDateTime After date
 * @param {string | Date} beforeDateTime Before date
 * @returns {{
      afterDateTime: Date,
      beforeDateTime: Date
    }} date range
 */
export const convertToUTCFullDay = (afterDateTime, beforeDateTime) => {
  if (!afterDateTime && !beforeDateTime) {
    return {
      afterDateTime: null,
      beforeDateTime: null
    }
  }

  afterDateTime = new Date(afterDateTime instanceof Date
    ? afterDateTime.getTime()
    : afterDateTime)
  beforeDateTime = new Date(beforeDateTime instanceof Date
    ? beforeDateTime.getTime()
    : beforeDateTime)

  afterDateTime.setHours(0, 0, 0)
  beforeDateTime.setHours(23, 59, 59)

  afterDateTime.setMinutes(afterDateTime.getMinutes() - afterDateTime.getTimezoneOffset())
  beforeDateTime.setMinutes(beforeDateTime.getMinutes() - beforeDateTime.getTimezoneOffset())

  return {
    afterDateTime,
    beforeDateTime
  }
}
