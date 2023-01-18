import { closeDrawLayerModal } from './addMissionZone'
import { resetInteraction } from '../../shared_slices/Draw'

export const closeAddMissionZone = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
