import { THEME, type Station } from '@mtes-mct/monitor-ui'
import { isEmpty } from 'lodash'
import { uniq } from 'lodash/fp'
import { GeoJSON } from 'ol/format'
import { LineString, Point } from 'ol/geom'
import { Fill, Icon, Stroke, Style, Text } from 'ol/style'
import CircleStyle from 'ol/style/Circle'

import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../../domain/entities/map/constants'
import { FeatureWithCodeAndEntityId } from '../../../../libs/FeatureWithCodeAndEntityId'

import type { StyleFunction } from 'ol/style/Style'

export const getFeatureStyle = ((feature: FeatureWithCodeAndEntityId) => {
  const featureProps = feature.getProperties()

  const iconStyle = new Style({
    image: new Icon({
      displacement: [0, 19],
      src: `/map-icons/station-layer-icon${feature.isHighlighted || feature.isSelected ? '-highlighted' : ''}.svg`
    })
  })

  const badgeStyle = new Style({
    image: new CircleStyle({
      displacement: [16, 36],
      fill: new Fill({
        color: THEME.color.charcoal
      }),
      radius: 10
    })
  })

  const counterStyle = new Style({
    text: new Text({
      fill: new Fill({
        color: THEME.color.white
      }),
      font: `11px 'Open Sans'`,
      offsetX: 16.5,
      offsetY: -35.5,
      text: featureProps.controlUnitsCount.toString(),
      textAlign: 'center'
    })
  })

  const lineStyle = new Style({
    geometry: () => {
      const overlayPostion = feature.get('overlayCoordinates')
      if (isEmpty(overlayPostion)) {
        return undefined
      }
      const featureGeometry = (feature?.getGeometry() as Point)?.getCoordinates()

      return new LineString([overlayPostion.coordinates, featureGeometry])
    },
    stroke: new Stroke({
      color: THEME.color.slateGray,
      lineDash: [4, 4],
      width: 2
    })
  })

  return [iconStyle, badgeStyle, counterStyle, lineStyle]
}) as unknown as StyleFunction

export function getStationPointFeature(station: Station.Station) {
  const controlUnitsCount = uniq(station.controlUnitResources.map(({ controlUnitId }) => controlUnitId)).length

  const geoJSON = new GeoJSON()
  const geometry = geoJSON.readGeometry(
    {
      coordinates: [station.longitude, station.latitude],
      type: 'Point'
    },
    {
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }
  )

  const feature = new FeatureWithCodeAndEntityId({
    code: MonitorFishLayer.STATION,
    entityId: station.id,
    geometry
  })
  feature.setProperties({
    controlUnitsCount,
    isHighlighted: false,
    isSelected: false,
    station
  })

  return feature
}
