import { dayjs } from '../../utils/dayjs'
import { getUtcDayjs } from '../../utils/getUtcDayjs'
import { MissionAction } from '../types/missionAction'

import InfractionType = MissionAction.InfractionType

export const INITIAL_LAST_CONTROLS: MissionAction.LastControls = {
  LAND: {
    control: undefined,
    text: 'Dernier contrôle à quai'
  },
  SEA: {
    control: undefined,
    text: 'Dernier contrôle en mer'
  }
}

/**
 * Get last SEA and LAND controls
 */
export const getLastControls = (yearsToControls: {
  [s: string]: MissionAction.MissionAction[]
}): MissionAction.LastControls => {
  const lastControls = INITIAL_LAST_CONTROLS

  const controlsInDatetimeDescendingOrder = Object.values(yearsToControls)
    .flat()
    .sort((a, b) => (a.actionDatetimeUtc && b.actionDatetimeUtc && a.actionDatetimeUtc < b.actionDatetimeUtc ? 1 : -1))

  lastControls.SEA.control = controlsInDatetimeDescendingOrder.find(
    control => control.actionType === MissionAction.MissionActionType.SEA_CONTROL
  )
  lastControls.LAND.control = controlsInDatetimeDescendingOrder.find(
    control => control.actionType === MissionAction.MissionActionType.LAND_CONTROL
  )

  return lastControls
}

/**
 * Get mission actions for each years : Years are keys and actions are values
 */
export const getYearsToActions = (
  controlsFromDate: Date,
  controls: MissionAction.MissionAction[]
): Record<string, MissionAction.MissionAction[]> => {
  const nextYearsToControls = {}
  if (!controlsFromDate) {
    return {}
  }

  let fromYear = dayjs(controlsFromDate).year()
  const toYear = getUtcDayjs().year()
  while (fromYear <= toYear) {
    nextYearsToControls[fromYear] = []
    fromYear += 1
  }

  controls.forEach(control => {
    const year = dayjs(control.actionDatetimeUtc).year()

    if (nextYearsToControls[year].length) {
      nextYearsToControls[year] = nextYearsToControls[year].concat(control)
    } else {
      nextYearsToControls[year] = [control]
    }
  })

  return nextYearsToControls
}

/**
 * Get the number of infractions in a control - Take care of infractions without NATINF
 */
export const getNumberOfInfractions = (control: MissionAction.MissionAction | undefined): number => {
  if (!control) {
    return 0
  }

  return (
    control.gearInfractions.length +
    control.logbookInfractions.length +
    control.speciesInfractions.length +
    control.otherInfractions.length
  )
}

/**
 * Get the number of infractions with records in a control
 */
export const getNumberOfInfractionsWithRecord = (control: MissionAction.MissionAction | undefined): number => {
  if (!control) {
    return 0
  }

  const infractionWithRecordFilter = infraction => infraction.infractionType === InfractionType.WITH_RECORD

  return (
    control.gearInfractions.filter(infractionWithRecordFilter).length +
    control.logbookInfractions.filter(infractionWithRecordFilter).length +
    control.speciesInfractions.filter(infractionWithRecordFilter).length +
    control.otherInfractions.filter(infractionWithRecordFilter).length
  )
}

export const isControl = actionType =>
  actionType === MissionAction.MissionActionType.SEA_CONTROL ||
  actionType === MissionAction.MissionActionType.LAND_CONTROL ||
  actionType === MissionAction.MissionActionType.AIR_CONTROL
