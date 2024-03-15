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
        fun fromCatch(priorNotificationType: Catch): LogbookMessageCatchDataOutput {
            return LogbookMessageCatchDataOutput(
                weight = priorNotificationType.weight,
                numberFish = priorNotificationType.numberFish,
                species = priorNotificationType.species,
                speciesName = priorNotificationType.speciesName,
                faoZone = priorNotificationType.faoZone,
                freshness = priorNotificationType.freshness,
                packaging = priorNotificationType.packaging,
                effortZone = priorNotificationType.effortZone,
                presentation = priorNotificationType.presentation,
                economicZone = priorNotificationType.economicZone,
                conversionFactor = priorNotificationType.conversionFactor,
                preservationState = priorNotificationType.preservationState,
                statisticalRectangle = priorNotificationType.statisticalRectangle,
            )
        }
    }
}
