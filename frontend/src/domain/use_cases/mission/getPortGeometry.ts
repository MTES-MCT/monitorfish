import { sortBy } from 'lodash'
import Feature from 'ol/Feature'
import { MultiPolygon } from 'ol/geom'
import { circular } from 'ol/geom/Polygon'

import { convertToGeoJSONGeometryObject } from '../../entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map/constants'
import { MissionAction } from '../../types/missionAction'

import type { MissionActionFormValues } from '../../../features/SideWindow/MissionForm/types'
import type { GeoJSON as GeoJSONType } from '../../types/GeoJSON'
import type { Port } from '../../types/port'

export const getPortGeometry =
  (ports: Port.Port[], actionsFormValues: MissionActionFormValues[]) => (): GeoJSONType.Geometry | undefined => {
    const actions: MissionActionFormValues[] = sortBy(
      actionsFormValues,
      ({ actionDatetimeUtc }) => actionDatetimeUtc
    ).reverse()

    const lastLandControl = actions.find(
      action => action.actionType === MissionAction.MissionActionType.LAND_CONTROL && action.portLocode
    )
    if (!lastLandControl) {
      return undefined
    }

    const lastControlPort = ports.find(port => port.locode === lastLandControl.portLocode)
    if (!lastControlPort?.latitude || !lastControlPort?.longitude) {
      return undefined
    }

    const circleGeometry = new Feature({
      geometry: circular([lastControlPort.longitude, lastControlPort.latitude], 1000, 64).transform(
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      )
    }).getGeometry()

    // @ts-ignore
    return convertToGeoJSONGeometryObject(new MultiPolygon([circleGeometry]))
  }
