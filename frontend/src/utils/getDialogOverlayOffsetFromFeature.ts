import { getDialogWindowPositionFromFeature, type Margins } from './getDialogWindowPositionFromFeature'
import { FeatureWithCodeAndEntityId } from '../libs/FeatureWithCodeAndEntityId'

import type { Coordinates } from '@mtes-mct/monitor-ui'

const DEFAULT_WINDOW_MARGINS: Margins = [75, 75, 75, 75]

export function getDialogOverlayOffsetFromFeature(
  feature: FeatureWithCodeAndEntityId,
  dialogElement: HTMLDivElement,
  /** Margin between the feature position (top left extent) and the dialog. */
  featureMargins: Margins,
  /** Minimum margin between window borders and the dialog. */
  windowMargins: Margins = DEFAULT_WINDOW_MARGINS
): Coordinates {
  return getDialogWindowPositionFromFeature(feature, dialogElement, featureMargins, windowMargins, true)
}
