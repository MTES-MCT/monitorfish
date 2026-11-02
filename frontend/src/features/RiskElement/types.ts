import type { NonCompliantTripSchema, VesselRiskElementSchema } from './schemas'
import type { z } from 'zod'

export namespace RiskElement {
  export enum MetricsType {
    OCCURRENCES = 'OCCURRENCES',
    TRIPS = 'TRIPS'
  }

  export type NonCompliantTrip = z.infer<typeof NonCompliantTripSchema>
  export type VesselRiskElement = z.infer<typeof VesselRiskElementSchema>

  export type DisplayedRiskElement = {
    code: string
    description: string
    label: string
  }
}
