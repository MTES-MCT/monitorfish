import { measurementStyle, measurementStyleWithCenter } from '@features/Measurement/layers/measurement.style'
import { saveMeasurement } from '@features/Measurement/useCases/saveMeasurement'
import Feature from 'ol/Feature'
import { circular } from 'ol/geom/Polygon'
import { METERS_PER_UNIT, transform } from 'ol/proj'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../MainMap/constants'

import type { MeasurementInProgress } from '@features/Measurement/types'
import type { Coordinate } from 'ol/coordinate'

export const addCustomCircleMeasurement =
  (measurementInProgress: MeasurementInProgress | undefined) => (dispatch, getState) => {
    const { circleMeasurementToAdd } = getState().measurement
    const metersForOneNauticalMile = 1852
    const longitude = 1
    const latitude = 0
    const numberOfVertices = 64

    if (
      !circleMeasurementHasCoordinatesAndRadiusFromForm() &&
      !circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()
    ) {
      return
    }

    const radiusInMeters =
      METERS_PER_UNIT.m * ((circleMeasurementToAdd?.circleRadiusToAdd ?? 0) as number) * metersForOneNauticalMile

    let coordinates: Coordinate = []
    if (circleMeasurementHasCoordinatesAndRadiusFromForm()) {
      coordinates = [
        circleMeasurementToAdd!.circleCoordinatesToAdd![longitude]!,
        circleMeasurementToAdd!.circleCoordinatesToAdd![latitude]!
      ]
    } else if (circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw()) {
      coordinates = transform(measurementInProgress!.center!, OPENLAYERS_PROJECTION, WSG84_PROJECTION)
    }

    const circleFeature = new Feature({
      geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(
        WSG84_PROJECTION,
        OPENLAYERS_PROJECTION
      ),
      style: [measurementStyle, measurementStyleWithCenter]
    })

    dispatch(saveMeasurement(circleFeature, `r = ${circleMeasurementToAdd?.circleRadiusToAdd} nm`))

    function circleMeasurementHasCoordinatesAndRadiusFromForm() {
      return circleMeasurementToAdd?.circleCoordinatesToAdd?.length === 2 && circleMeasurementToAdd?.circleRadiusToAdd
    }

    function circleMeasurementHasRadiusFromFormAndCoordinatesFromDraw() {
      return circleMeasurementToAdd?.circleRadiusToAdd && measurementInProgress?.center?.length === 2
    }
  }
