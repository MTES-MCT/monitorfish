package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.Catch

class LogbookMessageCatchDataOutput(
    var weight: Double?,
    var numberFish: Double?,
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
        fun fromCatch(catch: Catch): LogbookMessageCatchDataOutput {
            return LogbookMessageCatchDataOutput(
                weight = catch.weight,
                numberFish = catch.numberFish,
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
