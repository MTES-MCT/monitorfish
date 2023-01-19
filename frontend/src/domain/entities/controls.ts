import { dayjs } from '../../utils/dayjs'
import { getUtcDayjs } from '../../utils/getUtcDayjs'
import { INITIAL_LAST_CONTROLS, MissionActionType } from '../types/missionAction'

import type { LastControls, MissionAction } from '../types/missionAction'

/**
 * Get last SEA and LAND controls
 */
export const getLastControls = (yearsToControls: { [s: string]: MissionAction[] }): LastControls => {
  const lastControls = INITIAL_LAST_CONTROLS

  const sortedLastYearControlList = Object.values(yearsToControls)
    .flat()
    .sort((a, b) => (a.actionDatetimeUtc < b.actionDatetimeUtc ? 1 : -1))

  let i = 0
  while (i < sortedLastYearControlList.length && Object.keys(lastControls).length < 2) {
    if (sortedLastYearControlList[i]?.actionType === MissionActionType.SEA_CONTROL && !lastControls.SEA.control) {
      lastControls.SEA = { ...lastControls.SEA, control: sortedLastYearControlList[i] }
    } else if (
      sortedLastYearControlList[i]?.actionType === MissionActionType.LAND_CONTROL &&
      !lastControls.LAND.control
    ) {
      lastControls.LAND = { ...lastControls.LAND, control: sortedLastYearControlList[i] }
    }

    // eslint-disable-next-line no-plusplus
    i++
  }

  return lastControls
}

/**
 * Get mission actions for each years : Years are keys and actions are values
 */
export const getYearsToActions = (
  controlsFromDate: Date,
  controls: MissionAction[]
): Record<string, MissionAction[]> => {
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
export const getNumberOfInfractions = (control: MissionAction | undefined): number => {
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
