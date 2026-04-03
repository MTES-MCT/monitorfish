import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs, OPENLAYERS_PROJECTION, THEME, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'

export const getEstimatedPositionFeatures = (
  vessel: Vessel.ActiveVesselEmittingPosition,
  options: {
    isLight: boolean
    isOpacityReducedEpochMilli: number
  }
): [Vessel.VesselEstimatedPositionFeature, Vessel.VesselEstimatedPositionFeature] | undefined => {
  const { dateTime, estimatedCurrentLatitude, estimatedCurrentLongitude, latitude, longitude } = vessel

  if (!longitude || !latitude || !estimatedCurrentLongitude || !estimatedCurrentLatitude) {
    return undefined
  }

  const currentCoordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const estimatedCoordinates = transform(
    [estimatedCurrentLongitude, estimatedCurrentLatitude],
    WSG84_PROJECTION,
    OPENLAYERS_PROJECTION
  )
  const vesselCompositeIdentifier = vessel.vesselFeatureId.replace(`${MonitorFishMap.MonitorFishLayer.VESSELS}:`, '')

  const estimatedPositionData = {
    dateTime,
    latitude: estimatedCurrentLatitude,
    longitude: estimatedCurrentLongitude
  }

  const lineColor = options.isLight ? 'rgba(202, 204, 224, 0.2)' : THEME.color.charcoalShadow
  const vesselColor = options.isLight ? 'rgb(202, 204, 224)' : THEME.color.charcoal

  if (customDayjs(dateTime).valueOf() < options.isOpacityReducedEpochMilli) {
    return undefined
  }

  const lineFeature = new Feature({
    color: lineColor,
    geometry: new LineString([currentCoordinates, estimatedCoordinates])
  }) as Vessel.VesselEstimatedPositionFeature
  lineFeature.estimatedPosition = estimatedPositionData
  lineFeature.setId(`${LayerProperties.VESSEL_ESTIMATED_POSITION.code}:${vesselCompositeIdentifier}`)

  const circleFeature = new Feature({
    color: vesselColor,
    geometry: new Point(estimatedCoordinates),
    isCircle: true
  }) as Vessel.VesselEstimatedPositionFeature
  circleFeature.estimatedPosition = estimatedPositionData
  circleFeature.setId(`${LayerProperties.VESSEL_ESTIMATED_POSITION.code}:circle:${vesselCompositeIdentifier}`)

  return [lineFeature, circleFeature]
}
