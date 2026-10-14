import { Inquiry } from '@features/Inquiry/Inquiry.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { customDayjs, type UndefineExcept } from '@mtes-mct/monitor-ui'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

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
  controlsFromDate: string,
  controls: MissionAction.MissionAction[]
): Record<string, MissionAction.MissionAction[]> => {
  const nextYearsToControls = {}

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
 * A closed inquiry is dated by its end, as it may span over multiple years
 */
export const getInquiryDate = (inquiry: Inquiry.Inquiry): string | undefined =>
  inquiry.endDateTimeUtc ?? inquiry.startDateTimeUtc

/**
 * Get inquiries for each years : Years are keys and inquiries are values
 */
export const getYearsToInquiries = (
  controlsFromDate: string,
  inquiries: Inquiry.Inquiry[]
): Record<string, Inquiry.Inquiry[]> => {
  const nextYearsToInquiries: Record<string, Inquiry.Inquiry[]> = {}

  let fromYear = customDayjs(controlsFromDate).year()
  const toYear = customDayjs().utc().year()
  while (fromYear <= toYear) {
    nextYearsToInquiries[fromYear] = []
    fromYear += 1
  }

  inquiries.forEach(inquiry => {
    const year = customDayjs(getInquiryDate(inquiry)).year()

    nextYearsToInquiries[year] = (nextYearsToInquiries[year] ?? []).concat(inquiry)
  })

  return nextYearsToInquiries
}

export const isInquiryClosed = (inquiry: Inquiry.Inquiry): boolean => inquiry.status === Inquiry.InquiryStatus.CLOSED

export const getInquiryNumberOfInfractionsWithRecord = (inquiry: Inquiry.Inquiry): number =>
  inquiry.infractions.filter(infraction => infraction.infractionType === Inquiry.InquiryInfractionType.WITH_REPORT)
    .length

export const getInquiryNumberOfInfractionsWithoutRecord = (inquiry: Inquiry.Inquiry): number =>
  inquiry.infractions.filter(infraction => infraction.infractionType !== Inquiry.InquiryInfractionType.WITH_REPORT)
    .length

/**
 * Get the number of infractions in a control - Take care of infractions without NATINF
 */
export const getNumberOfInfractions = (
  control: MissionAction.MissionAction | MissionActionFormValues | undefined
): number => {
  if (!control) {
    return 0
  }

  return control.infractions?.length ?? 0
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

  return control.infractions?.filter(infractionWithRecordFilter).length ?? 0
}

export const isControl = actionType =>
  actionType === MissionAction.MissionActionType.SEA_CONTROL ||
  actionType === MissionAction.MissionActionType.LAND_CONTROL ||
  actionType === MissionAction.MissionActionType.AIR_CONTROL

export const infractionWithoutRecordFilter = (infraction: MissionAction.Infraction) =>
  infraction.infractionType === InfractionType.WITHOUT_RECORD || infraction.infractionType === InfractionType.PENDING

/**
 * Get the number of infractions without records in a control
 */
export const getNumberOfInfractionsWithoutRecord = (control: MissionAction.MissionAction | undefined): number => {
  if (!control) {
    return 0
  }

  return control.infractions.filter(infractionWithoutRecordFilter).length
}

export const getInfractionTitle = (
  infraction: UndefineExcept<MissionAction.Infraction, 'comments' | 'infractionType'>
): string => `${infraction.threat} - ${infraction.threatCharacterization}
${infraction.natinf} - ${infraction.natinfDescription}`
