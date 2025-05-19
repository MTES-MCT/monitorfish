import { getColorWithAlpha, getHashDigitsFromString, getStyle } from '@features/Map/layers/styles/utils'
import { customDayjs, THEME } from '@mtes-mct/monitor-ui'

import { isForbiddenPeriod } from './utils/isForbiddenPeriod'
import { theme } from '../../../../ui/theme'

import type { BaseRegulatoryZone } from '../../types'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type { FeatureLike } from 'ol/Feature'
import type { Style } from 'ol/style'

const styleCache = new Map<string, Style>()

export function getCachedRegulatoryStyle(
  feature: FeatureLike | undefined,
  regulation: BaseRegulatoryZone | MonitorFishMap.ShowedLayer | null
): Style {
  const key = `${regulation?.topic}:${regulation?.zone}:${feature?.get('metadataIsShowed')}`

  if (!styleCache.has(key)) {
    const style = getRegulatoryLayerStyle(feature, regulation)

    styleCache.set(key, style)
  }

  return styleCache.get(key)!
}

export function getRegulatoryLayerStyle(
  feature: FeatureLike | undefined,
  regulation: BaseRegulatoryZone | MonitorFishMap.ShowedLayer | null
): Style {
  const randomDigits = getHashDigitsFromString(`${regulation?.topic}:${regulation?.zone}`)
  const currentDate = customDayjs().utc()
  const isForbidden = isForbiddenPeriod(feature, currentDate)
  const metadataIsShowed = feature?.get('metadataIsShowed')

  if (isForbidden) {
    return getStyle(getColorWithAlpha(THEME.color.lightCoral, 0.4), metadataIsShowed)
  }

  return getLayerColor(randomDigits, metadataIsShowed)
}

const DIGIT_TO_LAYER_COLOR_MAP = new Map<number, string>([
  [0, THEME.color.yaleBlue],
  [1, theme.color.queenBlue],
  [2, THEME.color.glaucous],
  [3, THEME.color.blueNcs],
  [4, THEME.color.iceberg],
  [5, THEME.color.lightSteelBlue],
  [6, THEME.color.lightPeriwinkle],
  [7, theme.color.aliceBlue],
  [8, theme.color.lightBlue],
  [9, theme.color.skyBlue],
  [10, theme.color.frenchBlue],
  [11, theme.color.prussianBlue]
])

const getLayerColor = (randomDigits, metadataIsShowed) => {
  const color = DIGIT_TO_LAYER_COLOR_MAP.get(randomDigits)
  if (!color) {
    return getStyle(getColorWithAlpha(THEME.color.yaleBlue, 0.4), metadataIsShowed)
  }

  return getStyle(getColorWithAlpha(color, 0.4), metadataIsShowed)
}
