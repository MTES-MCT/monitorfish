export type SpeciesInsight = {
  presentation?: string | undefined
  species: string
  speciesName: string | undefined
  totalWeight?: number | undefined
  weight: number
}
export type SpeciesInsightWithHeight = SpeciesInsight & {
  height: number
}

// The key is the species FAO code
export type SpeciesToSpeciesInsight = Record<string, SpeciesInsight>

// The key is the species FAO code
export type SpeciesToSpeciesInsightList = Record<string, SpeciesInsight[]>
