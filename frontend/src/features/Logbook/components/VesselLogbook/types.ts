import type { CPSMessageValue, LogbookMessage, ProtectedSpeciesCatch } from '../../Logbook.types'
import type { SpeciesToSpeciesInsight, SpeciesToSpeciesInsightList } from '../../types'

export type LogbookTripSummary = {
  cps: {
    areAllMessagesNotAcknowledged: boolean
    logs: CPSMessageValue[]
    numberOfSpecies: number
  }
  dep: {
    log: LogbookMessage | undefined
    totalWeight: number
  }
  dis: {
    areAllMessagesNotAcknowledged: boolean
    logs: LogbookMessage[]
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalWeight: number
  }
  far: {
    areAllMessagesNotAcknowledged: boolean
    logs: LogbookMessage[]
    speciesAndPresentationToWeight: SpeciesToSpeciesInsightList | undefined
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalWeight: number
  }
  lan: {
    log: LogbookMessage | undefined
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalWeight: number
  }
  pno: {
    log: LogbookMessage | undefined
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalFARAndDEPWeight: number
    totalWeight: number
  }
}

export type CatchWithProperties = {
  nbFish: number
  properties: CatchProperty[]
  species: string
  speciesName: string | undefined
  weight: number
}

export type ProtectedCatchWithProperties = {
  nbFish: number
  properties: ProtectedSpeciesCatch[]
  species: string
  speciesName: string | undefined
  weight: number
}

export type CatchProperty = {
  conversionFactor: number | undefined
  economicZone: string | undefined
  effortZone: string | undefined
  faoZone: string | undefined
  nbFish: number | undefined
  packaging: string | undefined
  presentation: string | undefined
  preservationState: string | undefined
  statisticalRectangle: string | undefined
  weight: number | undefined
}
