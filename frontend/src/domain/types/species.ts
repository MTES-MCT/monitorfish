export type Species = {
  code: string
  name: string
}

export type SpeciesGroup = {
  comment: string
  group: string
}

export type SpeciesAndSpeciesGroupsAPIData = {
  groups: SpeciesGroup[]
  species: Species[]
}

export type SpeciesAndSpeciesGroups = {
  groups: SpeciesGroup[]
  species: Species[]
  speciesByCode: Record<string, Record<string, any>>
}
