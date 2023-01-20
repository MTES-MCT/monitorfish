// TODO Remove legacy colors.

import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import { Layer } from '../../../../domain/entities/layers/constants'
import { theme } from '../../../../ui/theme'
import { getUtcDayjs } from '../../../../utils/getUtcDayjs'
import { getHashDigitsFromRegulation } from '../utils'
import { isForbiddenPeriod } from './isForbiddenPeriod'
import { getColorWithAlpha, getStyle } from './utils'

import type { BaseRegulatoryZone } from '../../../../domain/types/regulation'
import type Feature from 'ol/Feature'

export function getAdministrativeAndRegulatoryLayersStyle(type: string) {
  switch (type) {
    case Layer.EEZ.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.9)', width: 2 }),
            text: `${feature?.get(Layer.EEZ.subZoneFieldKey) || ''}`
          })
        })
    case Layer.FAO.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            overflow: true,
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: Layer.FAO.getZoneName(feature)
          })
        })
    case Layer.AEM.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.AEM.subZoneFieldKey) || ''}`
          })
        })
    case Layer.effort_zones_areas.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.effort_zones_areas.subZoneFieldKey) || ''}`
          })
        })
    case Layer.cormoran.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.cormoran.subZoneFieldKey) || ''}`
          })
        })
    case Layer.situations.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 2
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.situations.subZoneFieldKey) || ''}`
          })
        })
    case Layer.brexit.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 2
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.brexit.subZoneFieldKey) || ''}`
          })
        })
    case Layer.rectangles_stat.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.rectangles_stat.subZoneFieldKey) || ''}`
          })
        })
    case Layer.THREE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case Layer.SIX_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case Layer.TWELVE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case Layer.cgpm_areas.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.cgpm_areas.subZoneFieldKey) || ''}`
          })
        })
    case Layer.cgpm_statistical_rectangles_areas.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 1
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.cgpm_statistical_rectangles_areas.subZoneFieldKey) || ''}`
          })
        })
    case Layer.saltwater_limit.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 3
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.saltwater_limit.subZoneFieldKey) || ''}`
          })
        })
    case Layer.transversal_sea_limit.code:
      return (feature: Feature | undefined) =>
        new Style({
          stroke: new Stroke({
            color: '#767AB2',
            width: 3
          }),
          text: new Text({
            fill: new Fill({ color: THEME.color.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.transversal_sea_limit.subZoneFieldKey) || ''}`
          })
        })
    case Layer.REGULATORY.code:
      return (feature: Feature | undefined, regulation: BaseRegulatoryZone | null) => {
        const randomDigits = getHashDigitsFromRegulation(regulation)
        const currentDate = getUtcDayjs()
        const isForbidden = isForbiddenPeriod(feature, currentDate)
        const metadataIsShowed = feature?.get('metadataIsShowed')

        if (isForbidden) {
          return getStyle(getColorWithAlpha(THEME.color.lightCoral, 0.75), metadataIsShowed)
        }

        return getLayerColor(randomDigits, metadataIsShowed)
      }
    default:
      return () =>
        new Style({
          fill: new Fill({
            color: getColorWithAlpha('#7B9FCC', 0.2)
          }),
          stroke: new Stroke({
            color: getColorWithAlpha('#7B9FCC', 0.6),
            width: 2
          })
        })
  }
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
    return getStyle(getColorWithAlpha(THEME.color.yaleBlue, 0.75), metadataIsShowed)
  }

  return getStyle(getColorWithAlpha(color, 0.75), metadataIsShowed)
}
