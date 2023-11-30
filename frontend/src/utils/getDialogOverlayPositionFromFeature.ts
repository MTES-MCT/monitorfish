import { ensureCoordinates } from './ensureCoordinates'
import { monitorfishMap } from '../features/map/monitorfishMap'
import { FeatureWithCodeAndEntityId } from '../libs/FeatureWithCodeAndEntityId'
import { FrontendError } from '../libs/FrontendError'

import type { Margins } from './getDialogWindowPositionFromFeature'
import type { Coordinates } from '@mtes-mct/monitor-ui'

export function getDialogOverlayPositionFromFeature(
  feature: FeatureWithCodeAndEntityId,
  dialogElementOrDialogWidthAndHeight: HTMLDivElement | [number, number],
  /** Margin between the feature position (top left extent) and the dialog. */
  featureMargins: Margins
): Coordinates {
  const geometry = feature.getGeometry()
  if (!geometry) {
    throw new FrontendError('`geometry` is undefined.')
  }

  const dialogWidth = Array.isArray(dialogElementOrDialogWidthAndHeight)
    ? dialogElementOrDialogWidthAndHeight[0]
    : dialogElementOrDialogWidthAndHeight.offsetWidth
  const dialogHeight = Array.isArray(dialogElementOrDialogWidthAndHeight)
    ? dialogElementOrDialogWidthAndHeight[1]
    : dialogElementOrDialogWidthAndHeight.offsetHeight

  const featureGeometryExtent = geometry.getExtent()
  const featurePixel = ensureCoordinates(monitorfishMap.getPixelFromCoordinate(featureGeometryExtent))
  const topWindowPosition = featurePixel[1] - dialogHeight - featureMargins[0]
  const leftWindowPosition = featurePixel[0] - Math.round(dialogWidth / 2)
  const overlayCoordinates = ensureCoordinates(
    monitorfishMap.getCoordinateFromPixel([leftWindowPosition, topWindowPosition])
  )

  return overlayCoordinates
}
