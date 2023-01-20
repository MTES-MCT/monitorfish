import { resetInteraction } from '../../shared_slices/Draw'
import { closeDrawLayerModal } from './addMissionZone'

export const closeAddMissionZone = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
