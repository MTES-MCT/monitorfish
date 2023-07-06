export type SpeciesInsight = {
  presentation?: number | undefined
  species: string
  speciesName: string | undefined
  totalWeight?: number | undefined
  weight: number
}

export type SpeciesToSpeciesInsight = Record<string, SpeciesInsight>

export type CatchWithProperties = {
  properties: CatchProperty[]
  species: string
  speciesName: string | undefined
  weight: number
}

export type CatchProperty = {
  conversionFactor: string | undefined
  economicZone: number | undefined
  effortZone: number | undefined
  faoZone: string | undefined
  packaging: number | undefined
  presentation: number | undefined
  preservationState: number | undefined
  statisticalRectangle: number | undefined
  weight: number
}
