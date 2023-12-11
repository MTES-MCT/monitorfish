import Feature from 'ol/Feature'
import { MultiPolygon } from 'ol/geom'
import { circular } from 'ol/geom/Polygon'

import { convertToGeoJSONGeometryObject } from '../../entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../entities/map/constants'
import { MissionAction } from '../../types/missionAction'

import type { MissionActionFormValues } from '../../../features/SideWindow/MissionForm/types'
import type { GeoJSON as GeoJSONType } from '../../types/GeoJSON'
import type { Port } from '../../types/port'

export const getLastControlCircleGeometry =
  (ports: Port.Port[], actionFormValues: MissionActionFormValues | MissionAction.MissionAction) => (): GeoJSONType.Geometry | undefined => {
    if (!isLandControl(actionFormValues) && !isAirOrSeaControl(actionFormValues)) {
      return undefined
    }

    const coordinates = getCoordinatesOfControl(ports, actionFormValues)
    if (!coordinates) {
      return undefined
    }

    const radius = isLandControl(actionFormValues) ? 1500 : 4000
    const circleGeometry = new Feature({
      geometry: circular(coordinates, radius, 64).transform(WSG84_PROJECTION, OPENLAYERS_PROJECTION)
    }).getGeometry()

    // @ts-ignore
    return convertToGeoJSONGeometryObject(new MultiPolygon([circleGeometry]))
  }

/**
 * Get latitude and longitude from controls
 * @return - the [longitude, latitude] coordinates array
 */
function getCoordinatesOfControl(ports: Port.Port[], action: MissionActionFormValues | MissionAction.MissionAction): [number, number] | undefined {
  if (
    action.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
    action.actionType === MissionAction.MissionActionType.SEA_CONTROL
  ) {
    // At this point the longitude and latitude could not be null as it is filtered by isAirOrSeaControl()
    return [action.longitude!, action.latitude!]
  }

  const lastControlPort = ports.find(port => port.locode === action.portLocode)
  if (lastControlPort?.latitude && lastControlPort?.longitude) {
    return [lastControlPort.longitude, lastControlPort.latitude]
  }

  return undefined
}

export function isLandControl(action: MissionActionFormValues | MissionAction.MissionAction) {
  return action.actionType === MissionAction.MissionActionType.LAND_CONTROL && action.portLocode
}

export function isAirOrSeaControl(action: MissionActionFormValues | MissionAction.MissionAction) {
  return (
    (action.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
      action.actionType === MissionAction.MissionActionType.SEA_CONTROL) &&
    action.latitude &&
    action.longitude
  )
}
