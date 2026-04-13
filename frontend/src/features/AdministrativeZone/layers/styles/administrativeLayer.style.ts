// TODO Remove legacy colors.

import { AdminLayerProperties } from '@features/Map/constants'
import { getColorWithAlpha } from '@features/Map/layers/styles/utils'
import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import type Feature from 'ol/Feature'
import type { FlatStyleLike } from 'ol/style/flat'

function makeTextStyle(propertyKey: string, textStrokeColor: string, overflow = false) {
  return (feature: Feature | undefined) =>
    new Style({
      text: new Text({
        fill: new Fill({ color: THEME.color.gunMetal }),
        font: '12px Marianne',
        overflow,
        stroke: new Stroke({ color: textStrokeColor, width: 2 }),
        text: `${feature?.get(propertyKey) || ''}`
      })
    })
}

export function getAdministrativeLabelStyle(type: string) {
  const adminLayer = Object.values(AdminLayerProperties).find(p => p.code === type)
  if (!adminLayer?.zoneNamePropertyKey) {
    return () => new Style({})
  }

  const textStrokeColor = STRONG_TEXT_STROKE_ZONES.has(type) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
  const overflow = type === AdminLayerProperties.FAO.code

  return makeTextStyle(adminLayer.zoneNamePropertyKey, textStrokeColor, overflow)
}

const MILES_ZONES = new Set(['3_miles_areas', '6_miles_areas', '12_miles_areas'])
const STRONG_TEXT_STROKE_ZONES = new Set(['eez_areas', 'facades_zee_fr_shom'])

function getZoneStrokeColor(type: string): string {
  if (MILES_ZONES.has(type)) {
    return 'rgba(5, 5, 94, 0.5)'
  }

  return '#767AB2'
}

function getZoneStrokeWidth(type: string): number {
  if (type === 'situs_areas' || MILES_ZONES.has(type)) {
    return 2
  }
  if (type === 'saltwater_limit_areas' || type === 'transversal_sea_limit_areas') {
    return 3
  }

  return 1
}

export function getAdministrativeWebGLStyle(type: string): FlatStyleLike {
  const adminLayer = Object.values(AdminLayerProperties).find(p => p.code === type)

  if (!adminLayer) {
    return {
      'stroke-color': 'rgba(123, 159, 204, 0.6)',
      'stroke-width': 2
    }
  }

  const strokeColor = getZoneStrokeColor(type)
  const strokeWidth = getZoneStrokeWidth(type)
  const baseStyle = {
    'stroke-color': strokeColor,
    'stroke-width': strokeWidth
  }

  return baseStyle
}

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
