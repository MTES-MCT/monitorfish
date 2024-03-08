import { closeDrawLayerModal } from '@features/Mission/useCases/addOrEditMissionZone'

import { resetInteraction } from '../slice'

export const closeDraw = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
