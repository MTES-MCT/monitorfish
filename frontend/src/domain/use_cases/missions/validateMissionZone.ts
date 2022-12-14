import { resetInteraction } from '../../shared_slices/Draw'
import { closeDrawLayerModal } from './addMissionZone'

export const validateMissionZone = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
