import type { OverlayCardMargins } from '@features/Map/components/Overlay/types'

export const marginsWithoutAlert: OverlayCardMargins = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -210,
  yMiddle: -105,
  yTop: 20
}

/** Approximate base rendered height of the vessel card (px), excluding dynamic warnings/groups offset. */
export const VESSEL_CARD_BASE_HEIGHT = 200
export const VESSEL_CARD_WIDTH = 387

/** Heights of dynamic card sections used to grow the overlay when extra content is shown. */
export const WARNING_BANNER_HEIGHT = 28
export const VESSEL_GROUPS_SECTION_BASE_HEIGHT = 19.8
export const VESSEL_GROUP_ROW_HEIGHT = 27
export const HIDDEN_GROUPS_ROW_HEIGHT = 20
