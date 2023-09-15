import type { LogbookMessage } from '../../Logbook.types'
import type { SpeciesToSpeciesInsight, SpeciesToSpeciesInsightList } from '../../types'

export type LogbookTripSummary = {
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
