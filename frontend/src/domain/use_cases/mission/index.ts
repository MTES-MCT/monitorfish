import { addOrEditMissionZone } from './addOrEditMissionZone'
import { closeDraw } from './closeDraw'
import { validateMissionZone } from './validateMissionZone'

export const missionDispatchers = {
  addMissionZone: addOrEditMissionZone,
  closeAddMissionZone: closeDraw,
  validateMissionZone
}
