package fr.gouv.cnsp.monitorfish.infrastructure.api.input

data class PriorNotificationDataInput(
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String,
    val expectedLandingDate: String,
    val faoArea: String,
    val fishingCatches: List<LogbookFishingCatchInput>,
    val note: String?,
    val portLocode: String,
    val sentAt: String,
    val tripGearCodes: List<String>,
    val vesselId: Int,
)
