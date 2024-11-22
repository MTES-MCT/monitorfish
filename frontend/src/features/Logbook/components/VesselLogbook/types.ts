import type { SpeciesToSpeciesInsight, SpeciesToSpeciesInsightList } from '../../types'
import type { Logbook } from '@features/Logbook/Logbook.types'

export type LogbookTripSummary = {
  cps: {
    areAllMessagesNotAcknowledged: boolean
    logs: Logbook.CpsMessageValue[]
    numberOfSpecies: number
  }
  dep: {
    log: Logbook.DepMessage | undefined
    totalWeight: number
  }
  dis: {
    areAllMessagesNotAcknowledged: boolean
    logs: Logbook.DisMessage[]
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalWeight: number
  }
  far: {
    areAllMessagesNotAcknowledged: boolean
    logs: Logbook.FarMessage[]
    speciesAndPresentationToWeight: SpeciesToSpeciesInsightList | undefined
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalWeight: number
  }
  lan: {
    log: Logbook.LanMessage | undefined
    speciesToWeight: SpeciesToSpeciesInsight | undefined
    totalWeight: number
  }
  pno: {
    log: Logbook.PnoMessage | undefined
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
  properties: Logbook.ProtectedSpeciesCatch[]
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
