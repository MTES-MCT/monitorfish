package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch

class LogbookMessageCatchDataOutput(
    var weight: Double?,
    var nbFish: Double?,
    var species: String?,
    var speciesName: String?,
    var faoZone: String?,
    var freshness: String?,
    var packaging: String?,
    var effortZone: String?,
    var presentation: String?,
    var economicZone: String?,
    var conversionFactor: Double?,
    var preservationState: String?,
    var statisticalRectangle: String?,
) {
    companion object {
        fun fromCatch(catch: LogbookFishingCatch): LogbookMessageCatchDataOutput {
            return LogbookMessageCatchDataOutput(
                weight = catch.weight,
                nbFish = catch.nbFish,
                species = catch.species,
                speciesName = catch.speciesName,
                faoZone = catch.faoZone,
                freshness = catch.freshness,
                packaging = catch.packaging,
                effortZone = catch.effortZone,
                presentation = catch.presentation,
                economicZone = catch.economicZone,
                conversionFactor = catch.conversionFactor,
                preservationState = catch.preservationState,
                statisticalRectangle = catch.statisticalRectangle,
            )
        }
    }
}
