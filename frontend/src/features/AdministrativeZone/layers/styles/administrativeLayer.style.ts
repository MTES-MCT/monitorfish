// TODO Remove legacy colors.

import { AdminLayerProperties } from '@features/Map/constants'
import { getColorWithAlpha } from '@features/Map/layers/styles/utils'
import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import type Feature from 'ol/Feature'

export function getAdministrativeLayerStyle(type: string) {
  switch (type) {
    case AdminLayerProperties.EEZ.code:
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
            text: `${
              (AdminLayerProperties.EEZ.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.EEZ.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.FAO.code:
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
            text: `${
              (AdminLayerProperties.FAO.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.FAO.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.AEM.code:
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
            text: `${
              (AdminLayerProperties.AEM.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.AEM.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.effort_zones_areas.code:
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
            text: `${
              (AdminLayerProperties.effort_zones_areas.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.effort_zones_areas.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.cormoran.code:
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
            text: `${
              (AdminLayerProperties.cormoran.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.cormoran.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.situations.code:
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
            text: `${
              (AdminLayerProperties.situations.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.situations.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.rectangles_stat.code:
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
            text: `${
              (AdminLayerProperties.rectangles_stat.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.rectangles_stat.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.THREE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case AdminLayerProperties.SIX_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case AdminLayerProperties.TWELVE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case AdminLayerProperties.cgpm_areas.code:
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
            text: `${
              (AdminLayerProperties.cgpm_areas.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.cgpm_areas.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.cgpm_statistical_rectangles_areas.code:
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
            text: `${
              (AdminLayerProperties.cgpm_statistical_rectangles_areas.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.cgpm_statistical_rectangles_areas.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.saltwater_limit.code:
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
            text: `${
              (AdminLayerProperties.saltwater_limit.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.saltwater_limit.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.transversal_sea_limit.code:
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
            text: `${
              (AdminLayerProperties.transversal_sea_limit.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.transversal_sea_limit.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
    case AdminLayerProperties.facades_zee_fr_shom.code:
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
            text: `${
              (AdminLayerProperties.facades_zee_fr_shom.zoneNamePropertyKey &&
                feature?.get(AdminLayerProperties.facades_zee_fr_shom.zoneNamePropertyKey)) ||
              ''
            }`
          })
        })
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
