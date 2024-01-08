import { ensureCoordinates } from './ensureCoordinates'
import { getDialogWindowPositionFromFeature } from './getDialogWindowPositionFromFeature'
import { monitorfishMap } from '../features/map/monitorfishMap'
import { FeatureWithCodeAndEntityId } from '../libs/FeatureWithCodeAndEntityId'
import { FrontendError } from '../libs/FrontendError'

import type { Coordinates } from '@mtes-mct/monitor-ui'

// TODO Move this type to a shared location (either in Fish or in MUI).
/** [Top, Right, Bottom, Left] */
export type Margins = [number, number, number, number]

const DEFAULT_WINDOW_MARGINS: Margins = [75, 75, 75, 75]

export function getDialogOverlayOffsetFromFeature(
  feature: FeatureWithCodeAndEntityId,
  dialogElement: HTMLDivElement,
  /** Margin between the feature position (top left extent) and the dialog. */
  featureMargins: Margins,
  /** Minimum margin between window borders and the dialog. */
  windowMargins: Margins = DEFAULT_WINDOW_MARGINS
): Coordinates {
  const geometry = feature.getGeometry()
  if (!geometry) {
    throw new FrontendError('`geometry` is undefined.')
  }

  const featureGeometryExtent = geometry.getExtent()
  const featureMapTopAndLeft = ensureCoordinates([featureGeometryExtent[0], featureGeometryExtent[3]])
  const featureWindowCoordinates = ensureCoordinates(monitorfishMap.getPixelFromCoordinate(featureMapTopAndLeft))

  const [leftPosition, topPosition] = getDialogWindowPositionFromFeature(
    feature,
    dialogElement,
    featureMargins,
    windowMargins
  )

  return [leftPosition - featureWindowCoordinates[0], topPosition - featureWindowCoordinates[1]]
}
