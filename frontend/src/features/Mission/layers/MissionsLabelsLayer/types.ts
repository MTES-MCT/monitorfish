export type FeatureAndLabel = {
  color: string
  coordinates: [number, number]
  featureId: string
  label: Record<string, any>
  offset: number[] | null
}
