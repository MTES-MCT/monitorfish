package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch

data class ManualPriorNotificationFishingCatchDataInput(
    val faoArea: String?,
    val quantity: Double?,
    val specyCode: String,
    val specyName: String,
    val weight: Double,
) {
    fun toLogbookFishingCatch(): LogbookFishingCatch {
        return LogbookFishingCatch(
            conversionFactor = null,
            economicZone = null,
            effortZone = null,
            faoZone = faoArea,
            freshness = null,
            nbFish = quantity,
            packaging = null,
            presentation = null,
            preservationState = null,
            species = specyCode,
            speciesName = specyName,
            statisticalRectangle = null,
            weight = weight,
        )
    }
}
