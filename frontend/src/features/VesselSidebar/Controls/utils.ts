import type { MissionAction } from '@features/Mission/missionAction.types'

export function getControlUnitsLabel(missionAction: MissionAction.MissionAction | undefined) {
  const controlUnits = missionAction?.controlUnits

  if (!controlUnits || controlUnits.length === 0) {
    return 'Unité manquante'
  }

  return controlUnits.map(controlUnit => controlUnit.name.replace('(historique)', '')).join(', ')
}
