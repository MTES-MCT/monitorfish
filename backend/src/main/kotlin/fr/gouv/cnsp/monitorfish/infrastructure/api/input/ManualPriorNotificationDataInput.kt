package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessagePurpose
import java.time.ZonedDateTime

data class ManualPriorNotificationDataInput(
    val hasPortEntranceAuthorization: Boolean,
    val hasPortLandingAuthorization: Boolean,
    val authorTrigram: String,
    val didNotFishAfterZeroNotice: Boolean,
    val expectedArrivalDate: ZonedDateTime,
    val expectedLandingDate: ZonedDateTime,
    val faoArea: String,
    val fishingCatches: List<ManualPriorNotificationFishingCatchDataInput>,
    val note: String?,
    val portLocode: String,
    val purpose: LogbookMessagePurpose,
    val sentAt: ZonedDateTime,
    val tripGearCodes: List<String>,
    val vesselId: Int,
)
