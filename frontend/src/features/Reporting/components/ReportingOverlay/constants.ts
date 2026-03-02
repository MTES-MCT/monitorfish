import type { OverlayCardMargins } from '@features/Map/components/Overlay/types'

/**
 * height: 187px
 * width: 348px
 */
export const OVERLAY_HEIGHT = 187

/** Height added to the card when a tag is displayed. */
export const TAG_ROW_HEIGHT = 28 // Tag ≈ 24 px + flex gap 4 px

export const margins: OverlayCardMargins = {
  xLeft: 30,
  xMiddle: -174,
  xRight: -368,
  yBottom: -234,
  yMiddle: -94,
  yTop: 20
}
