import { Style } from 'ol/style'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import Fill from 'ol/style/Fill'
import Layers from '../../domain/entities/layers'
import { getColorWithAlpha } from '../../utils'
import { COLORS } from '../../constants/constants'
import { metadataIsShowedPropertyName } from '../RegulatoryLayers'
import { theme } from '../../ui/theme'
import { getHashDigitsFromRegulation } from '../utils'

export const getAdministrativeAndRegulatoryLayersStyle = type => {
  switch (type) {
    case Layers.EEZ.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.EEZ.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.9)', width: 2 })
        })
      })
    case Layers.FAO.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          overflow: true,
          text: Layers.FAO.getZoneName(feature),
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.AEM.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.AEM.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.effort_zones_areas.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.effort_zones_areas.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.cormoran.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.cormoran.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.situations.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 2
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.situations.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.brexit.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 2
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.brexit.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.rectangles_stat.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.rectangles_stat.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.THREE_MILES.code:
      return _ => new Style({
        stroke: new Stroke({
          color: 'rgba(5, 5, 94, 0.5)',
          width: 2
        })
      })
    case Layers.SIX_MILES.code:
      return _ => new Style({
        stroke: new Stroke({
          color: 'rgba(5, 5, 94, 0.5)',
          width: 2
        })
      })
    case Layers.TWELVE_MILES.code:
      return _ => new Style({
        stroke: new Stroke({
          color: 'rgba(5, 5, 94, 0.5)',
          width: 2
        })
      })
    case Layers.cgpm_areas.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.cgpm_areas.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.cgpm_statistical_rectangles_areas.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 1
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.cgpm_statistical_rectangles_areas.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.saltwater_limit.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 3
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.saltwater_limit.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.transversal_sea_limit.code:
      return feature => new Style({
        stroke: new Stroke({
          color: '#767AB2',
          width: 3
        }),
        text: new Text({
          font: '12px Marianne',
          text: `${feature.get(Layers.transversal_sea_limit.subZoneFieldKey) || ''}`,
          fill: new Fill({ color: COLORS.gunMetal }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.4)', width: 2 })
        })
      })
    case Layers.REGULATORY.code:
      return (feature, regulation) => {
        const randomDigits = getHashDigitsFromRegulation(regulation)
        const metadataIsShowed = feature?.get(metadataIsShowedPropertyName)

        return getLayerColor(randomDigits, metadataIsShowed)
      }
    default:
      return () => new Style({
        stroke: new Stroke({
          color: getColorWithAlpha('#7B9FCC', 0.60),
          width: 2
        }),
        fill: new Fill({
          color: getColorWithAlpha('#7B9FCC', 0.2)
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

const getStyle = (color, metadataIsShowed) => new Style({
  stroke: new Stroke({
    color: 'rgba(5, 5, 94, 0.7)',
    width: metadataIsShowed ? 3 : 1
  }),
  fill: new Fill({
    color: color
  })
})
