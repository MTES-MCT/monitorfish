package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch

data class ManualPriorNotificationFishingCatchInput(
    // TODO What to do with this prop that doesn't exist in `LogbookFishingCatch`?
    val isIncidentalCatch: Boolean,
    val quantity: Double?,
    val specyCode: String,
    val specyName: String,
    val weight: Double,
) {
    companion object {
        fun fromLogbookFishingCatch(logbookFishingCatch: LogbookFishingCatch): ManualPriorNotificationFishingCatchInput {
            return ManualPriorNotificationFishingCatchInput(
                isIncidentalCatch = false,
                quantity = logbookFishingCatch.numberFish,
                specyCode = requireNotNull(logbookFishingCatch.species),
                specyName = requireNotNull(logbookFishingCatch.speciesName),
                weight = requireNotNull(logbookFishingCatch.weight),
            )
        }
    }

    fun toLogbookFishingCatch(): LogbookFishingCatch {
        return LogbookFishingCatch(
            conversionFactor = 1.toDouble(),
            economicZone = null,
            effortZone = null,
            faoZone = null,
            freshness = null,
            numberFish = quantity,
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
