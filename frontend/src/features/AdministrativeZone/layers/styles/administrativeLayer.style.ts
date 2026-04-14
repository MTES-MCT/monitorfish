// TODO Remove legacy colors.

import { AdminLayerProperties } from '@features/Map/constants'
import { getColorWithAlpha } from '@features/Map/layers/styles/utils'
import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import type Feature from 'ol/Feature'

type TextConfig = {
  overflow?: boolean
  propertyKey: string | undefined
  textStrokeColor: string
}

const MILES_ZONES = new Set([
  AdminLayerProperties.THREE_MILES.code,
  AdminLayerProperties.SIX_MILES.code,
  AdminLayerProperties.TWELVE_MILES.code
])

const STRONG_TEXT_STROKE_ZONES = new Set([AdminLayerProperties.EEZ.code, AdminLayerProperties.facades_zee_fr_shom.code])

const WIDE_STROKE_WIDTH_ZONES = new Set([
  AdminLayerProperties.saltwater_limit.code,
  AdminLayerProperties.transversal_sea_limit.code
])

function makeZoneStyle(strokeColor: string, strokeWidth: number, textConfig?: TextConfig) {
  return (feature: Feature | undefined) =>
    new Style({
      stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
      text: textConfig?.propertyKey
        ? new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            overflow: textConfig.overflow ?? false,
            stroke: new Stroke({ color: textConfig.textStrokeColor, width: 2 }),
            text: `${feature?.get(textConfig.propertyKey) || ''}`
          })
        : undefined
    })
}

function getStrokeWidth(type: string): number {
  if (WIDE_STROKE_WIDTH_ZONES.has(type)) {
    return 3
  }
  if (type === AdminLayerProperties.situations.code) {
    return 2
  }

  return 1
}

function getTextStrokeColor(type: string): string {
  return STRONG_TEXT_STROKE_ZONES.has(type) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
}

export function getAdministrativeLayerStyle(type: string) {
  if (MILES_ZONES.has(type)) {
    return makeZoneStyle('rgba(5, 5, 94, 0.5)', 2)
  }

  const adminLayer = Object.values(AdminLayerProperties).find(p => p.code === type)
  if (!adminLayer) {
    return () =>
      new Style({
        fill: new Fill({ color: getColorWithAlpha('#7B9FCC', 0.2) }),
        stroke: new Stroke({ color: getColorWithAlpha('#7B9FCC', 0.6), width: 2 })
      })
  }

  return makeZoneStyle('#767AB2', getStrokeWidth(type), {
    overflow: type === AdminLayerProperties.FAO.code,
    propertyKey: adminLayer.zoneNamePropertyKey,
    textStrokeColor: getTextStrokeColor(type)
  })
}
