import type { ScipSpeciesType } from '@features/FleetSegment/types'

// TODO Exist both in Vessel and Specy.
export type Specy = {
  /** ID. */
  code: string
  name: string
  scipSpeciesType?: ScipSpeciesType
}

export type SpecyGroup = {
  comment: string
  group: string
}

export type SpeciesAndSpeciesGroupsAPIData = {
  groups: SpecyGroup[]
  species: Specy[]
}
