import { keepOnlyInitialGeometriesOfMultiPolygon } from '../../entities/layers'
import { setDrawedGeometry } from '../../shared_slices/Draw'

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
