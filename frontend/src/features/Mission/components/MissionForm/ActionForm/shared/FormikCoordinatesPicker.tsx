import { addOrEditControlCoordinates } from '@features/Mission/useCases/addOrEditControlCoordinates'
import { useListenForDrawedGeometry } from '@hooks/useListenForDrawing'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FieldError, MultiZoneEditor, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { isCypress } from '@utils/isCypress'
import { convertToGeoJSONGeometryObject } from 'domain/entities/layers'
import { InteractionListener, OpenLayersGeometryType } from 'domain/entities/map/constants'
import { fitToExtent } from 'domain/shared_slices/Map'
import { MissionAction } from 'domain/types/missionAction'
import { getCoordinatesExtent } from 'domain/use_cases/map/getCoordinatesExtent'
import { useField, useFormikContext } from 'formik'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'
import { useCallback, useEffect, useMemo } from 'react'

import { getCoordinates } from '../../../../../../coordinates'
import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'

import type { MissionActionFormValues } from '../../types'
import type { Coordinate } from 'ol/coordinate'

import MissionActionType = MissionAction.MissionActionType

/**
 * This is used to mock the user adding coordinates in Cypress tests
 * as we can't test two windows : the side window and the map window.
 */
const IS_CYPRESS = isCypress()
export const STUBBED_LATITUDE = 47.084
export const STUBBED_LONGITUDE = -3.872

export function FormikCoordinatesPicker() {
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const listener = useMainAppSelector(state => state.draw.listener)

  const { updateFAOAreasAndSegments, updateMissionLocation } = useGetMissionActionFormikUsecases()
  const { values } = useFormikContext<MissionActionFormValues>()
  const [{ value: longitudeValue }, longitudeMeta, longitudeHelpers] =
    useField<MissionActionFormValues['longitude']>('longitude')
  const [{ value: latitudeValue }, latitudeMeta, latitudeHelpers] =
    useField<MissionActionFormValues['latitude']>('latitude')

  const error = longitudeMeta.error ?? latitudeMeta.error

  const dispatch = useMainAppDispatch()
  const { drawedGeometry } = useListenForDrawedGeometry(InteractionListener.CONTROL_POINT)

  useEffect(() => {
    if (values.actionType !== MissionActionType.AIR_CONTROL && values.actionType !== MissionActionType.SEA_CONTROL) {
      return
    }

    if (IS_CYPRESS && !longitudeValue && !latitudeValue) {
      latitudeHelpers.setValue(STUBBED_LATITUDE)
      longitudeHelpers.setValue(STUBBED_LONGITUDE)

      const valuesWithLocation = {
        ...values,
        latitude: STUBBED_LATITUDE,
        longitude: STUBBED_LONGITUDE
      }
      updateFAOAreasAndSegments(valuesWithLocation)
      updateMissionLocation(valuesWithLocation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [longitudeValue, latitudeValue])

  const coordinates = useMemo(() => {
    if (!longitudeValue || !latitudeValue) {
      return []
    }

    const printedCoordinates = getCoordinates([longitudeValue, latitudeValue], WSG84_PROJECTION, coordinatesFormat)

    return [
      {
        latitude: latitudeValue,
        longitude: longitudeValue,
        name: `${printedCoordinates[0]}, ${printedCoordinates[1]}`
      }
    ]
  }, [longitudeValue, latitudeValue, coordinatesFormat])

  /**
   * Update formik fields after drawedGeometry modification
   */
  useEffect(
    () => {
      if (drawedGeometry?.type === OpenLayersGeometryType.POINT) {
        longitudeHelpers.setValue(drawedGeometry.coordinates[0])
        latitudeHelpers.setValue(drawedGeometry.coordinates[1])

        const valuesWithLocation = {
          ...values,
          latitude: drawedGeometry.coordinates[1],
          longitude: drawedGeometry.coordinates[0]
        }
        updateFAOAreasAndSegments(valuesWithLocation)
        updateMissionLocation(valuesWithLocation)
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drawedGeometry]
  )

  const handleCenterOnMap = (centeredCoordinates: Coordinate) => {
    if (centeredCoordinates.length !== 2 || !centeredCoordinates[0] || !centeredCoordinates[1]) {
      return
    }

    const bufferedExtent = getCoordinatesExtent(centeredCoordinates)
    dispatch(fitToExtent(bufferedExtent))
  }

  const addOrEditCoordinates = useCallback(async () => {
    if (!longitudeValue || !latitudeValue) {
      dispatch(addOrEditControlCoordinates(undefined))

      return
    }

    const nextGeometry = getGeometryFromCoordinates(longitudeValue, latitudeValue)
    dispatch(addOrEditControlCoordinates(nextGeometry))
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
    <>
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
        onAdd={addOrEditCoordinates}
        onCenter={centeredCoordinates =>
          handleCenterOnMap([centeredCoordinates.longitude, centeredCoordinates.latitude])
        }
        onDelete={deleteCoordinates}
        onEdit={addOrEditCoordinates}
      />
      {error && <FieldError>{error}</FieldError>}
    </>
  )
}

function getGeometryFromCoordinates(longitudeValue: number, latitudeValue: number) {
  const coordinates = transform([longitudeValue, latitudeValue], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
  const feature = new Feature({
    geometry: new Point(coordinates)
  })

  return convertToGeoJSONGeometryObject(feature.getGeometry() as Point)
}
