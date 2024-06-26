package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose

data class ManualPriorNotificationDataInput(
    val hasPortEntranceAuthorization: Boolean,
    val hasPortLandingAuthorization: Boolean,
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: String,
    val expectedLandingDate: String,
    val faoArea: String,
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataInput>,
    val note: String?,
    val portLocode: String,
    val purpose: LogbookMessagePurpose,
    val sentAt: String,
    val tripGearCodes: List<String>,
    val vesselId: Int,
)
