import { closeDrawLayerModal } from './addMissionZone'
import { resetInteraction } from '../../shared_slices/Draw'

export const closeDraw = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
