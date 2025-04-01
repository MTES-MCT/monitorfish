import { marginsWithoutAlert } from '@features/Vessel/components/VesselCardOverlay/constants'

export function getOverlayMargins(yOffset: number) {
  return {
    ...marginsWithoutAlert,
    yBottom: marginsWithoutAlert.yBottom - yOffset,
    yMiddle: marginsWithoutAlert.yMiddle - yOffset / 2
  }
}
