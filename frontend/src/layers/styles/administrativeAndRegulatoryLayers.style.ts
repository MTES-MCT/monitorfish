import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import { COLORS } from '../../constants/constants'
import { Layers } from '../../domain/entities/layers/constants'
import { theme } from '../../ui/theme'
import { getHashDigitsFromRegulation } from '../utils'
import { isForbiddenPeriod } from './isForbiddenPeriod'
import { getColorWithAlpha, getStyle } from './utils'

import type { BaseRegulatoryZone } from '../../domain/types/regulation'
import type Feature from 'ol/Feature'

export function getAdministrativeAndRegulatoryLayersStyle(type: string) {
  switch (type) {
    case Layers.EEZ.code:
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
            text: `${feature?.get(Layers.EEZ.subZoneFieldKey) || ''}`
          })
        })
    case Layers.FAO.code:
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
            text: Layers.FAO.getZoneName(feature)
          })
        })
    case Layers.AEM.code:
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
            text: `${feature?.get(Layers.AEM.subZoneFieldKey) || ''}`
          })
        })
    case Layers.effort_zones_areas.code:
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
            text: `${feature?.get(Layers.effort_zones_areas.subZoneFieldKey) || ''}`
          })
        })
    case Layers.cormoran.code:
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
            text: `${feature?.get(Layers.cormoran.subZoneFieldKey) || ''}`
          })
        })
    case Layers.situations.code:
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
            text: `${feature?.get(Layers.situations.subZoneFieldKey) || ''}`
          })
        })
    case Layers.brexit.code:
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
            text: `${feature?.get(Layers.brexit.subZoneFieldKey) || ''}`
          })
        })
    case Layers.rectangles_stat.code:
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
            text: `${feature?.get(Layers.rectangles_stat.subZoneFieldKey) || ''}`
          })
        })
    case Layers.THREE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case Layers.SIX_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case Layers.TWELVE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case Layers.cgpm_areas.code:
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
            text: `${feature?.get(Layers.cgpm_areas.subZoneFieldKey) || ''}`
          })
        })
    case Layers.cgpm_statistical_rectangles_areas.code:
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
            text: `${feature?.get(Layers.cgpm_statistical_rectangles_areas.subZoneFieldKey) || ''}`
          })
        })
    case Layers.saltwater_limit.code:
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
            text: `${feature?.get(Layers.saltwater_limit.subZoneFieldKey) || ''}`
          })
        })
    case Layers.transversal_sea_limit.code:
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
            text: `${feature?.get(Layers.transversal_sea_limit.subZoneFieldKey) || ''}`
          })
        })
    case Layers.REGULATORY.code:
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
      return getStyle(getColorWithAlpha(theme.color.glaucous, 0.75), metadataIsShowed)
    case 2:
      return getStyle(getColorWithAlpha(theme.color.blueNcs, 0.75), metadataIsShowed)
    case 3:
      return getStyle(getColorWithAlpha(theme.color.iceberg, 0.75), metadataIsShowed)
    case 4:
      return getStyle(getColorWithAlpha(theme.color.lightSteelBlue, 0.75), metadataIsShowed)
    case 5:
      return getStyle(getColorWithAlpha(theme.color.lightPeriwinkle, 0.75), metadataIsShowed)
    case 6:
      return getStyle(getColorWithAlpha(theme.color.aliceBlue, 0.75), metadataIsShowed)
    case 7:
      return getStyle(getColorWithAlpha(theme.color.lightCyan, 0.75), metadataIsShowed)
    case 8:
      return getStyle(getColorWithAlpha(theme.color.middleBlueGreen, 0.75), metadataIsShowed)
    case 9:
      return getStyle(getColorWithAlpha(theme.color.verdigris, 0.75), metadataIsShowed)
    case 10:
      return getStyle(getColorWithAlpha(theme.color.viridianGreen, 0.75), metadataIsShowed)
    case 11:
      return getStyle(getColorWithAlpha(theme.color.paoloVeroneseGreen, 0.75), metadataIsShowed)
    case 12:
      return getStyle(getColorWithAlpha(theme.color.skobeloff, 0.75), metadataIsShowed)
    case 13:
      return getStyle(getColorWithAlpha(theme.color.blueSapphire, 0.75), metadataIsShowed)
    case 14:
      return getStyle(getColorWithAlpha(theme.color.indigoDye, 0.75), metadataIsShowed)
    default:
      return getStyle(getColorWithAlpha(theme.color.yaleBlue, 0.75), metadataIsShowed)
  }
}
