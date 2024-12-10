import { customDayjs } from '@mtes-mct/monitor-ui'
import { asArray, asString } from 'ol/color'
import { Style, Circle } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import type { DateInterval } from '../../../Regulation/types'
import type { Dayjs } from 'dayjs'

/**
 * Get hash number between [0, 11] for a given string - Uses the DJB2 hash function
 */
export function getHashDigitsFromString(stringToHash: string | null): number | undefined {
  if (!stringToHash) {
    return undefined
  }

  const MAX_INT = 11

  // We make sure the string will have enough length
  const biggerString = stringToHash.repeat(3)
  const { length } = biggerString

  // Make this function uniform

  // DJB2 hash function to derive a number from the string
  let hash = 5381
  /* eslint-disable-next-line no-plusplus */
  for (let i = 0; i < length; i++) {
    /* eslint-disable-next-line no-bitwise */
    hash = (hash * 33) ^ biggerString.charCodeAt(i)
  }

  /**
   *    This magic number *2* makes the random number looks a bit more distributed in an uniform manner:
   0: 13%
   1: 9%
   2: 7%
   3: 7%
   4: 6%
   5: 7%
   6: 9%
   7: 7%
   8: 8%
   9: 7%
   10: 9%
   11: 6%
   */
  /* eslint-disable-next-line no-bitwise */
  const randomNumber = hash >>> 2

  // We take the first three digits of the random number, to have a fixed range ([0, 999])
  const randomThreeDigits = parseInt(randomNumber.toString().slice(0, 3), 10)

  // We convert the random number of range [0, 999] to the range [0, MAX_INT]
  return Math.floor((randomThreeDigits * (MAX_INT + 2)) / 999) - 1
}

export function getStyle(color: string | undefined, isSelected: boolean, strokeColor?: string) {
  const fill = new Fill({
    color
  })

  const stroke = new Stroke({
    color: strokeColor ?? 'rgba(5, 5, 94, 0.7)',
    width: isSelected ? 3 : 1
  })

  return new Style({
    fill,
    image: new Circle({
      fill,
      radius: 5,
      stroke
    }),
    stroke
  })
}

/**
 * Given a color in hex format and a alpha number, returns the color as an rgba string.
 */
export function getColorWithAlpha(colorHex: string, alpha: number) {
  const [r, g, b] = asArray(colorHex)

  if (!Number.isInteger(r) || !Number.isInteger(g) || !Number.isInteger(b)) {
    return undefined
  }

  return asString([
    Number.parseInt(String(r), 10),
    Number.parseInt(String(g), 10),
    Number.parseInt(String(b), 10),
    alpha
  ])
}

export function getStartAndEndDatesSetWithCurrentYear(
  dateRange: DateInterval,
  currentDate: Dayjs
): Record<string, Dayjs> {
  const currentYear = currentDate.get('year')
  const endDateWithCurrentYear = customDayjs(dateRange.endDate).set('year', currentYear)
  const startDateWithCurrentYear = customDayjs(dateRange.startDate).set('year', currentYear)

  return {
    endDateWithOffsetApplied: endDateWithCurrentYear,
    startDateWithOffsetApplied: startDateWithCurrentYear
  }
}
