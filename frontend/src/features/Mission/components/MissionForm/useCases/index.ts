import { initMissionLocation } from '@features/Mission/components/MissionForm/useCases/initMissionLocation'
import { updateFAOAreas } from '@features/Mission/components/MissionForm/useCases/updateFAOAreas'
import { updateGearsOnboard } from '@features/Mission/components/MissionForm/useCases/updateGearsOnboard'
import { updateMissionLocation } from '@features/Mission/components/MissionForm/useCases/updateMissionLocation'
import { updateOtherControlsCheckboxes } from '@features/Mission/components/MissionForm/useCases/updateOtherControlsCheckboxes'
import { updateSegments } from '@features/Mission/components/MissionForm/useCases/updateSegments'
import { updateSpeciesOnboard } from '@features/Mission/components/MissionForm/useCases/updateSpeciesOnboard'

export const formUsecase = {
  initMissionLocation,
  updateFAOAreas,
  updateGearsOnboard,
  updateMissionLocation,
  updateOtherControlsCheckboxes,
  updateSegments,
  updateSpeciesOnboard
}
