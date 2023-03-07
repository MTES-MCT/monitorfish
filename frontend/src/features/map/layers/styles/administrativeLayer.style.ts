// TODO Remove legacy colors.

import { THEME } from '@mtes-mct/monitor-ui'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'

import { getColorWithAlpha } from './utils'
import { LayerProperties } from '../../../../domain/entities/layers/constants'

import type Feature from 'ol/Feature'

export function getAdministrativeLayerStyle(type: string) {
  switch (type) {
    case LayerProperties.EEZ.code:
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
            text: `${(LayerProperties.EEZ.subZoneFieldKey && feature?.get(LayerProperties.EEZ.subZoneFieldKey)) || ''}`
          })
        })
    case LayerProperties.FAO.code:
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
            text: LayerProperties.FAO.getZoneName && LayerProperties.FAO.getZoneName(feature)
          })
        })
    case LayerProperties.AEM.code:
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
            text: `${(LayerProperties.AEM.subZoneFieldKey && feature?.get(LayerProperties.AEM.subZoneFieldKey)) || ''}`
          })
        })
    case LayerProperties.effort_zones_areas.code:
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
              (LayerProperties.effort_zones_areas.subZoneFieldKey &&
                feature?.get(LayerProperties.effort_zones_areas.subZoneFieldKey)) ||
              ''
            }`
          })
        })
    case LayerProperties.cormoran.code:
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
              (LayerProperties.cormoran.subZoneFieldKey && feature?.get(LayerProperties.cormoran.subZoneFieldKey)) || ''
            }`
          })
        })
    case LayerProperties.situations.code:
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
              (LayerProperties.situations.subZoneFieldKey &&
                feature?.get(LayerProperties.situations.subZoneFieldKey)) ||
              ''
            }`
          })
        })
    case LayerProperties.brexit.code:
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
              (LayerProperties.brexit.subZoneFieldKey && feature?.get(LayerProperties.brexit.subZoneFieldKey)) || ''
            }`
          })
        })
    case LayerProperties.rectangles_stat.code:
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
              (LayerProperties.rectangles_stat.subZoneFieldKey &&
                feature?.get(LayerProperties.rectangles_stat.subZoneFieldKey)) ||
              ''
            }`
          })
        })
    case LayerProperties.THREE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case LayerProperties.SIX_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case LayerProperties.TWELVE_MILES.code:
      return () =>
        new Style({
          stroke: new Stroke({
            color: 'rgba(5, 5, 94, 0.5)',
            width: 2
          })
        })
    case LayerProperties.cgpm_areas.code:
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
              (LayerProperties.cgpm_areas.subZoneFieldKey &&
                feature?.get(LayerProperties.cgpm_areas.subZoneFieldKey)) ||
              ''
            }`
          })
        })
    case LayerProperties.cgpm_statistical_rectangles_areas.code:
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
              (LayerProperties.cgpm_statistical_rectangles_areas.subZoneFieldKey &&
                feature?.get(LayerProperties.cgpm_statistical_rectangles_areas.subZoneFieldKey)) ||
              ''
            }`
          })
        })
    case LayerProperties.saltwater_limit.code:
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
              (LayerProperties.saltwater_limit.subZoneFieldKey &&
                feature?.get(LayerProperties.saltwater_limit.subZoneFieldKey)) ||
              ''
            }`
          })
        })
    case LayerProperties.transversal_sea_limit.code:
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
              (LayerProperties.transversal_sea_limit.subZoneFieldKey &&
                feature?.get(LayerProperties.transversal_sea_limit.subZoneFieldKey)) ||
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
