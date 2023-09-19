import { GeoJSON } from '../../domain/types/GeoJSON'

export type CustomZone = {
  feature: GeoJSON.GeoJson
  isShown: boolean
  name: string
  uuid: string
}
