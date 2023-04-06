import { addMissionZone } from './addMissionZone'
import { closeDraw } from './closeDraw'
import { validateMissionZone } from './validateMissionZone'

export const missionDispatchers = {
  addMissionZone,
  closeAddMissionZone: closeDraw,
  validateMissionZone
}
