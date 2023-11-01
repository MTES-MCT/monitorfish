import { InfractionGroup } from './types'

export const infractionGroupToLabel: Record<InfractionGroup, string> = {
  [InfractionGroup.GEAR_INFRACTIONS]: 'Infraction engins',
  [InfractionGroup.LOGBOOK_INFRACTION]: 'Infraction obligations déclaratives et autorisations de pêche',
  [InfractionGroup.OTHER_INFRACTIONS]: 'Autre infraction',
  [InfractionGroup.SPECIES_INFRACTIONS]: 'Infraction espèces'
}
