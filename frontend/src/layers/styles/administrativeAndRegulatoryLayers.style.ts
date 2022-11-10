import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import { COLORS } from '../../constants/constants'
import { Layer } from '../../domain/entities/layers/constants'
import { theme } from '../../ui/theme'
import { getHashDigitsFromRegulation } from '../utils'
import { isForbiddenPeriod } from './isForbiddenPeriod'
import { getColorWithAlpha, getStyle } from './utils'

import type { BaseRegulatoryZone } from '../../domain/types/regulation'
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
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
            fill: new Fill({ color: COLORS.gunMetal }),
            font: '12px Marianne',
            stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 }),
            text: `${feature?.get(Layer.transversal_sea_limit.subZoneFieldKey) || ''}`
          })
        })
    case Layer.REGULATORY.code:
      return (feature: Feature | undefined, regulation: BaseRegulatoryZone | null) => {
        const randomDigits = getHashDigitsFromRegulation(regulation)
        const isForbidden = isForbiddenPeriod(feature)
        const metadataIsShowed = feature?.get('metadataIsShowed')

        if (isForbidden) {
          return getStyle(getColorWithAlpha(theme.color.lightCoral, 0.75), metadataIsShowed)
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

const getLayerColor = (randomDigits, metadataIsShowed) => {
  switch (randomDigits) {
    case 0:
      return getStyle(getColorWithAlpha(theme.color.yaleBlue, 0.75), metadataIsShowed)
    case 1:
      return getStyle(getColorWithAlpha(theme.color.queenBlue, 0.75), metadataIsShowed)
    case 2:
      return getStyle(getColorWithAlpha(theme.color.glaucous, 0.75), metadataIsShowed)
    case 3:
      return getStyle(getColorWithAlpha(theme.color.blueNcs, 0.75), metadataIsShowed)
    case 4:
      return getStyle(getColorWithAlpha(theme.color.iceberg, 0.75), metadataIsShowed)
    case 5:
      return getStyle(getColorWithAlpha(theme.color.lightSteelBlue, 0.75), metadataIsShowed)
    case 6:
      return getStyle(getColorWithAlpha(theme.color.lightPeriwinkle, 0.75), metadataIsShowed)
    case 7:
      return getStyle(getColorWithAlpha(theme.color.aliceBlue, 0.75), metadataIsShowed)
    case 8:
      return getStyle(getColorWithAlpha(theme.color.lightBlue, 0.75), metadataIsShowed)
    case 9:
      return getStyle(getColorWithAlpha(theme.color.skyBlue, 0.75), metadataIsShowed)
    case 10:
      return getStyle(getColorWithAlpha(theme.color.frenchBlue, 0.75), metadataIsShowed)
    case 11:
      return getStyle(getColorWithAlpha(theme.color.prussianBlue, 0.75), metadataIsShowed)
    default:
      return getStyle(getColorWithAlpha(theme.color.yaleBlue, 0.75), metadataIsShowed)
  }
}
