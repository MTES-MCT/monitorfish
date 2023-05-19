import { MultiZoneEditor, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'
import { useCallback, useEffect, useMemo } from 'react'

import { getCoordinates } from '../../../../../coordinates'
import { convertToGeoJSONGeometryObject } from '../../../../../domain/entities/layers'
import { InteractionListener, OpenLayersGeometryType } from '../../../../../domain/entities/map/constants'
import { fitToExtent } from '../../../../../domain/shared_slices/Map'
import { getCoordinatesExtent } from '../../../../../domain/use_cases/map/getCoordinatesExtent'
import { addControlCoordinates } from '../../../../../domain/use_cases/mission/addControlCoordinates'
import { useListenForDrawedGeometry } from '../../../../../hooks/useListenForDrawing'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'

import type { MissionActionFormValues } from '../../types'
import type { Coordinate } from 'ol/coordinate'

export function FormikCoordinatesPicker() {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const listener = useMainAppSelector(state => state.draw.listener)

  const [{ value: longitudeValue }, , longitudeHelpers] = useField<MissionActionFormValues['longitude']>('longitude')
  const [{ value: latitudeValue }, , latitudeHelpers] = useField<MissionActionFormValues['latitude']>('latitude')

  const dispatch = useMainAppDispatch()
  const { geometry } = useListenForDrawedGeometry(InteractionListener.CONTROL_POINT)

  const coordinates = useMemo(() => {
    if (!longitudeValue || !latitudeValue) {
      return []
    }

    const printedCoordinates = getCoordinates([longitudeValue, latitudeValue], WSG84_PROJECTION, coordinatesFormat)

    return (
      [
        {
          latitude: latitudeValue,
          longitude: longitudeValue,
          name: `${printedCoordinates[0]}, ${printedCoordinates[1]}`
        }
      ] || []
    )
  }, [longitudeValue, latitudeValue, coordinatesFormat])

  useEffect(
    () => {
      if (geometry?.type === OpenLayersGeometryType.POINT) {
        longitudeHelpers.setValue(geometry.coordinates[0])
        latitudeHelpers.setValue(geometry.coordinates[1])
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geometry]
  )

  const handleCenterOnMap = (centeredCoordinates: Coordinate) => {
    const bufferedExtent = getCoordinatesExtent(centeredCoordinates)
    dispatch(fitToExtent(bufferedExtent))
  }

  const addCoordinates = useCallback(async () => {
    if (!longitudeValue || !latitudeValue) {
      dispatch(addControlCoordinates(undefined))

      return
    }

    const nextGeometry = getGeometryFromCoordinates(longitudeValue, latitudeValue)
    dispatch(addControlCoordinates(nextGeometry))
  }, [dispatch, longitudeValue, latitudeValue])

  const deleteCoordinates = useCallback(
    () => {
      if (!longitudeValue || !latitudeValue) {
        return
      }

      longitudeHelpers.setValue(undefined)
      latitudeHelpers.setValue(undefined)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [longitudeValue, latitudeValue]
  )

  return (
    <MultiZoneEditor
      addButtonLabel="Ajouter un point de contrôle"
      defaultValue={coordinates}
      initialZone={{
        name: 'Nouvelle coordonnée'
      }}
      isAddButtonDisabled={!!coordinates.length || listener === InteractionListener.CONTROL_POINT}
      isLight
      label="Lieu du contrôle"
      labelPropName="name"
      onAdd={addCoordinates}
      onCenter={centeredCoordinates => handleCenterOnMap([centeredCoordinates.longitude, centeredCoordinates.latitude])}
      onDelete={deleteCoordinates}
      onEdit={addCoordinates}
    />
  )
}

function getGeometryFromCoordinates(longitudeValue: number, latitudeValue: number) {
  const coordinates = transform([longitudeValue, latitudeValue], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const feature = new Feature({
    geometry: new Point(coordinates)
  })

  return convertToGeoJSONGeometryObject(feature.getGeometry() as Point)
}
