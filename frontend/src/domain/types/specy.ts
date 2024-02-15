// TODO Exist both in Vessel and Specy.
export type Specy = {
  /** ID. */
  code: string
  name: string
}

export type SpecyGroup = {
  comment: string
  group: string
}

export type SpeciesAndSpeciesGroupsAPIData = {
  groups: SpecyGroup[]
  species: Specy[]
}

export type SpeciesAndSpecyGroups = {
  groups: SpecyGroup[]
  species: Specy[]
  // TODO Type this prop.
  speciesByCode: Record<string, Record<string, any>>
}
