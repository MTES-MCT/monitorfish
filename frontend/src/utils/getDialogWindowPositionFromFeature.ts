import { ensureCoordinates } from './ensureCoordinates'
import { monitorfishMap } from '../features/map/monitorfishMap'
import { FeatureWithCodeAndEntityId } from '../libs/FeatureWithCodeAndEntityId'
import { FrontendError } from '../libs/FrontendError'

import type { Coordinates } from '@mtes-mct/monitor-ui'

// TODO Move this type to a shared location (either in Fish or in MUI).
/** [Top, Right, Bottom, Left] */
export type Margins = [number, number, number, number]

const DEFAULT_WINDOW_MARGINS: Margins = [75, 75, 75, 75]

export function getDialogWindowPositionFromFeature(
  feature: FeatureWithCodeAndEntityId | undefined,
  dialogElement: HTMLDivElement | null,
  /** Margin between the feature position (top left extent) and the dialog. */
  featureMargins: Margins,
  /** Minimum margin between window borders and the dialog. */
  windowMargins: Margins = DEFAULT_WINDOW_MARGINS
): Coordinates {
  if (!dialogElement || !feature) {
    return [0, 0]
  }

  const geometry = feature.getGeometry()
  if (!geometry) {
    throw new FrontendError('`geometry` is undefined.')
  }

  const dialogHeight = dialogElement.offsetHeight
  const dialogWidth = dialogElement.offsetWidth
  const featureGeometryExtent = geometry.getExtent()
  const featureMapTopAndLeft = ensureCoordinates([featureGeometryExtent[0], featureGeometryExtent[3]])
  const featureWindowCoordinates = ensureCoordinates(monitorfishMap.getPixelFromCoordinate(featureMapTopAndLeft))

  let topPosition = featureWindowCoordinates[1] - dialogHeight - featureMargins[0]
  if (topPosition < windowMargins[0]) {
    topPosition = featureWindowCoordinates[1] + featureMargins[2]
  }

  let leftPosition = featureWindowCoordinates[0] - Math.round(dialogWidth / 2)
  if (leftPosition < windowMargins[3]) {
    leftPosition = featureWindowCoordinates[0] + featureMargins[1]
    topPosition = featureWindowCoordinates[1] - Math.round(dialogHeight / 2)

    if (topPosition < windowMargins[0]) {
      topPosition = featureWindowCoordinates[1] + featureMargins[2]
    }
    if (topPosition > window.innerHeight - (dialogHeight + windowMargins[2])) {
      topPosition = featureWindowCoordinates[1] - dialogHeight - featureMargins[0]
    }
  }
  if (leftPosition > window.innerWidth - (dialogWidth + windowMargins[1])) {
    leftPosition = featureWindowCoordinates[0] - dialogWidth - featureMargins[3]
    topPosition = featureWindowCoordinates[1] - Math.round(dialogHeight / 2)

    if (topPosition < windowMargins[0]) {
      topPosition = featureWindowCoordinates[1] + featureMargins[2]
    }
    if (topPosition > window.innerHeight - (dialogHeight + windowMargins[2])) {
      topPosition = featureWindowCoordinates[1] - dialogHeight - featureMargins[0]
    }
  }

  return [topPosition, leftPosition]
}
