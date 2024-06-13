package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class ManualPriorNotificationComputeDataInput(
    val faoArea: String,
    val fishingCatches: List<ManualPriorNotificationFishingCatchInput>,
    val portLocode: String,
    val tripGearCodes: List<String>,
    val vesselId: Int,
)
