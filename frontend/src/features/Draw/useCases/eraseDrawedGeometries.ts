import { setDrawedGeometry } from '@features/Draw/slice'

import { keepOnlyInitialGeometriesOfMultiPolygon } from '../../../domain/entities/layers'

export const eraseDrawedGeometries = initialFeatureNumber => (dispatch, getState) => {
  const { drawedGeometry } = getState().draw
  if (!drawedGeometry) {
    return
  }

  const nextGeometry = keepOnlyInitialGeometriesOfMultiPolygon(drawedGeometry, initialFeatureNumber)
  if (nextGeometry) {
    dispatch(setDrawedGeometry(nextGeometry))
  }
}
