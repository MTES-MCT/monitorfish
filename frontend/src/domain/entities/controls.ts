import { customDayjs } from '@mtes-mct/monitor-ui'

import { MissionAction } from '../types/missionAction'

import type { MissionActionFormValues } from '../../features/SideWindow/MissionForm/types'

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

  let fromYear = customDayjs(controlsFromDate).year()
  const toYear = customDayjs().utc().year()
  while (fromYear <= toYear) {
    nextYearsToControls[fromYear] = []
    fromYear += 1
  }

  controls.forEach(control => {
    const year = customDayjs(control.actionDatetimeUtc).year()

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
export const getNumberOfInfractions = (
  control: MissionAction.MissionAction | MissionActionFormValues | undefined
): number => {
  if (!control) {
    return 0
  }

  return (
    (control.gearInfractions?.length || 0) +
    (control.logbookInfractions?.length || 0) +
    (control.speciesInfractions?.length || 0) +
    (control.otherInfractions?.length || 0)
  )
}

/**
 * Get the number of infractions with records in a control
 */
export const getNumberOfInfractionsWithRecord = (
  control: MissionAction.MissionAction | MissionActionFormValues | undefined
): number => {
  if (!control) {
    return 0
  }

  const infractionWithRecordFilter = infraction => infraction.infractionType === InfractionType.WITH_RECORD

  return (
    (control.gearInfractions?.filter(infractionWithRecordFilter).length || 0) +
    (control.logbookInfractions?.filter(infractionWithRecordFilter).length || 0) +
    (control.speciesInfractions?.filter(infractionWithRecordFilter).length || 0) +
    (control.otherInfractions?.filter(infractionWithRecordFilter).length || 0)
  )
}

export const isControl = actionType =>
  actionType === MissionAction.MissionActionType.SEA_CONTROL ||
  actionType === MissionAction.MissionActionType.LAND_CONTROL ||
  actionType === MissionAction.MissionActionType.AIR_CONTROL

const infractionWithoutRecordFilter = (
  infraction:
    | MissionAction.GearInfraction
    | MissionAction.LogbookInfraction
    | MissionAction.SpeciesInfraction
    | MissionAction.OtherInfraction
) => infraction.infractionType === InfractionType.WITHOUT_RECORD || infraction.infractionType === InfractionType.PENDING

/**
 * Get the number of infractions without records in a control
 */
export const getNumberOfInfractionsWithoutRecord = (control: MissionAction.MissionAction | undefined): number => {
  if (!control) {
    return 0
  }

  return (
    control.gearInfractions.filter(infractionWithoutRecordFilter).length +
    control.logbookInfractions.filter(infractionWithoutRecordFilter).length +
    control.speciesInfractions.filter(infractionWithoutRecordFilter).length +
    control.otherInfractions.filter(infractionWithoutRecordFilter).length
  )
}

/**
 * Get the natinf of infractions without records in a control
 */
export const getNatinfForInfractionsWithoutRecord = (control: MissionAction.MissionAction | undefined): number[] => {
  if (!control) {
    return []
  }

  const listOfNatinfForInfractionsWithoutRecords: number[] = [
    ...control.gearInfractions.filter(infractionWithoutRecordFilter).map(infraction => infraction.natinf),
    ...control.logbookInfractions.filter(infractionWithoutRecordFilter).map(infraction => infraction.natinf),
    ...control.speciesInfractions.filter(infractionWithoutRecordFilter).map(infraction => infraction.natinf),
    ...control.otherInfractions.filter(infractionWithoutRecordFilter).map(infraction => infraction.natinf)
  ]

  return listOfNatinfForInfractionsWithoutRecords
}
