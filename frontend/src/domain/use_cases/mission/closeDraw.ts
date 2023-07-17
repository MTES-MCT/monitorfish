import { closeDrawLayerModal } from './addOrEditMissionZone'
import { resetInteraction } from '../../shared_slices/Draw'

export const closeDraw = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
