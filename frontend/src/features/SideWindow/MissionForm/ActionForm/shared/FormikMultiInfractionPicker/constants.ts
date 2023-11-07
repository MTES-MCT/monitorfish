import { InfractionCategory } from './types'

export const infractionGroupToLabel: Record<InfractionCategory, string> = {
  [InfractionCategory.GEAR_INFRACTIONS]: 'Infraction engins',
  [InfractionCategory.LOGBOOK_INFRACTION]: 'Infraction obligations déclaratives et autorisations de pêche',
  [InfractionCategory.OTHER_INFRACTIONS]: 'Autre infraction',
  [InfractionCategory.SPECIES_INFRACTIONS]: 'Infraction espèces'
}
