package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class ManualPriorNotificationComputeDataInput(
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataInput>,
    val globalFaoArea: String?,
    val portLocode: String,
    val tripGearCodes: List<String>,
    val vesselId: Int,
)
