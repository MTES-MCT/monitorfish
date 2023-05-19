import { closeDrawLayerModal } from './addMissionZone'
import { resetInteraction } from '../../shared_slices/Draw'

export const validateMissionZone = () => dispatch => {
  dispatch(closeDrawLayerModal)
  dispatch(resetInteraction())
}
