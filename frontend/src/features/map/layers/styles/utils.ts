import { asArray, asString } from 'ol/color'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { dayjs } from '../../../../utils/dayjs'

import type { DateInterval } from '../../../../domain/types/regulation'
import type { Dayjs } from 'dayjs'

export function getStyle(color: string | undefined, isSelected: boolean) {
  return new Style({
    fill: new Fill({
      color
    }),
    stroke: new Stroke({
      color: 'rgba(5, 5, 94, 0.7)',
      width: isSelected ? 3 : 1
    })
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
  const endDateWithCurrentYear = dayjs(dateRange.endDate).set('year', currentYear)
  const startDateWithCurrentYear = dayjs(dateRange.startDate).set('year', currentYear)

  return {
    endDateWithOffsetApplied: endDateWithCurrentYear,
    startDateWithOffsetApplied: startDateWithCurrentYear
  }
}
