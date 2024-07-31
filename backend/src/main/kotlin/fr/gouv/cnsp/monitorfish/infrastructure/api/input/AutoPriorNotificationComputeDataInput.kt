package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class AutoPriorNotificationComputeDataInput(
    val isInVerificationScope: Boolean,
    val portLocode: String,
    val segmentCodes: List<String>,
    val vesselId: Int,
)
