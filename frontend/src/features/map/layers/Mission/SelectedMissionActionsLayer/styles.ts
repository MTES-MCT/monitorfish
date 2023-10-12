import { THEME } from '@mtes-mct/monitor-ui'
import { getCenter } from 'ol/extent'
import { MultiPoint, MultiPolygon } from 'ol/geom'
import { Fill, Icon, Stroke, Style } from 'ol/style'

import { isControl } from '../../../../../domain/entities/controls'
import { MissionAction } from '../../../../../domain/types/missionAction'
import { getColorWithAlpha } from '../../styles/utils'

import MissionActionType = MissionAction.MissionActionType

export const selectedMissionActionsStyles = [
  new Style({
    fill: new Fill({
      color: getColorWithAlpha(THEME.color.blueGray, 0.35)
    }),
    stroke: new Stroke({
      color: THEME.color.blueGray,
      width: 2
    })
  }),
  new Style({
    geometry: feature => {
      if (!isControl(feature.get('actionType'))) {
        return undefined
      }

      if (!(feature.get('numberOfInfractionsWithRecords') > 0)) {
        return undefined
      }

      return feature.getGeometry()
    },
    image: new Icon({
      displacement: [-1, 12],
      scale: 0.8,
      src: 'map-icons/Icone_controle_avec_infraction.svg?react'
    })
  }),
  new Style({
    geometry: feature => {
      if (!isControl(feature.get('actionType'))) {
        return undefined
      }

      if (!(feature.get('numberOfInfractionsWithRecords') === 0)) {
        return undefined
      }

      return feature.getGeometry()
    },
    image: new Icon({
      displacement: [-1, 12],
      scale: 0.8,
      src: 'map-icons/Icone_controle_sans_infraction.svg?react'
    })
  }),
  new Style({
    geometry: feature => {
      if (feature.get('actionType') !== MissionActionType.AIR_SURVEILLANCE) {
        return undefined
      }

      const geometry = feature?.getGeometry() as MultiPolygon
      const polygons = geometry?.getPolygons()
      const points = polygons?.map(p => getCenter(p.getExtent()))

      if (!points) {
        return undefined
      }

      return new MultiPoint(points)
    },
    image: new Icon({
      scale: 1,
      src: 'map-icons/Observation.svg?react'
    })
  })
]
