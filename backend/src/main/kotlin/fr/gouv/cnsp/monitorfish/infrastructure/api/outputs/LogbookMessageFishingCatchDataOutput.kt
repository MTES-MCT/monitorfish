package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch

class LogbookMessageFishingCatchDataOutput(
    var conversionFactor: Double?,
    var economicZone: String?,
    var effortZone: String?,
    var faoZone: String?,
    var freshness: String?,
    var nbFish: Double?,
    var packaging: String?,
    var presentation: String?,
    var preservationState: String?,
    var species: String?,
    var speciesName: String?,
    var statisticalRectangle: String?,
    var weight: Double?,
) {
    companion object {
        fun fromLogbookFishingCatch(logbookFishingCatch: LogbookFishingCatch): LogbookMessageFishingCatchDataOutput {
            return LogbookMessageFishingCatchDataOutput(
                conversionFactor = logbookFishingCatch.conversionFactor,
                economicZone = logbookFishingCatch.economicZone,
                effortZone = logbookFishingCatch.effortZone,
                faoZone = logbookFishingCatch.faoZone,
                freshness = logbookFishingCatch.freshness,
                nbFish = logbookFishingCatch.nbFish,
                packaging = logbookFishingCatch.packaging,
                presentation = logbookFishingCatch.presentation,
                preservationState = logbookFishingCatch.preservationState,
                species = logbookFishingCatch.species,
                speciesName = logbookFishingCatch.speciesName,
                statisticalRectangle = logbookFishingCatch.statisticalRectangle,
                weight = logbookFishingCatch.weight,
            )
        }
    }
}
