package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookFishingCatch

data class ManualPriorNotificationFishingCatchDataOutput(
    val faoArea: String?,
    val quantity: Double?,
    val specyCode: String,
    val specyName: String,
    val weight: Double,
) {
    companion object {
        fun fromLogbookFishingCatch(
            logbookFishingCatch: LogbookFishingCatch,
            withFaoArea: Boolean,
        ): ManualPriorNotificationFishingCatchDataOutput {
            val faoArea = if (withFaoArea) logbookFishingCatch.faoZone else null
            val specyCode =
                requireNotNull(logbookFishingCatch.species) {
                    "`logbookFishingCatch.species` is null."
                }
            val specyName =
                requireNotNull(logbookFishingCatch.speciesName) {
                    "`logbookFishingCatch.speciesName` is null."
                }
            val weight =
                requireNotNull(logbookFishingCatch.weight) {
                    "`logbookFishingCatch.weight` is null."
                }

            return ManualPriorNotificationFishingCatchDataOutput(
                faoArea,
                quantity = logbookFishingCatch.nbFish,
                specyCode,
                specyName,
                weight,
            )
        }
    }
}
