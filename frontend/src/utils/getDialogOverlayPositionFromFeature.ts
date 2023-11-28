import { ensureCoordinates } from './ensureCoordinates'
import { monitorfishMap } from '../features/map/monitorfishMap'
import { FeatureWithCodeAndEntityId } from '../libs/FeatureWithCodeAndEntityId'
import { FrontendError } from '../libs/FrontendError'

import type { Coordinates } from '@mtes-mct/monitor-ui'

/** [Top, Right, Bottom, Left] */
export type Margins = [number, number, number, number]

export function getDialogOverlayPositionFromFeature(
  feature: FeatureWithCodeAndEntityId,
  dialogHeight: number,
  dialogWidth: number,
  /** Margin between the feature position (top left extent) and the dialog. */
  featureMargins: Margins
): Coordinates {
  const geometry = feature.getGeometry()
  if (!geometry) {
    throw new FrontendError('`geometry` is undefined.')
  }

  const featureGeometryExtent = geometry.getExtent()
  const featurePixel = ensureCoordinates(monitorfishMap.getPixelFromCoordinate(featureGeometryExtent))
  const topWindowPosition = featurePixel[1] - dialogHeight - featureMargins[0]
  const leftWindowPosition = featurePixel[0] - Math.round(dialogWidth / 2)

  const overlayCoordinates = ensureCoordinates(
    monitorfishMap.getCoordinateFromPixel([leftWindowPosition, topWindowPosition])
  )

  return overlayCoordinates
}
