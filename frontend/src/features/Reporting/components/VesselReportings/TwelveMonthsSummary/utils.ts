import type { ThreatSummary } from '@features/Reporting/types'

export const getTitle = (
  threat: string,
  infraction: ThreatSummary
): string => `${threat} - ${infraction.threatCharacterization}
${infraction.natinf} - ${infraction.natinf}`
