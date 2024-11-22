package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import java.time.ZonedDateTime

interface LogbookReportRepository {
    fun findAllAcknowledgedPriorNotifications(filter: PriorNotificationsFilter): List<PriorNotification>

    @Throws(NoLogbookFishingTripFound::class)
    fun findLastTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): VoyageDatesAndTripNumber

    @Throws(NoLogbookFishingTripFound::class)
    fun findFirstAcknowledgedDateOfTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): ZonedDateTime

    @Throws(NoLogbookFishingTripFound::class)
    fun findTripBeforeTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber

    @Throws(NoLogbookFishingTripFound::class)
    fun findTripAfterTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber

    fun findAllMessagesByTripNumberBetweenDates(
        internalReferenceNumber: String,
        afterDate: ZonedDateTime,
        beforeDate: ZonedDateTime,
        tripNumber: String,
    ): List<LogbookMessage>

    // Only used in tests
    fun findById(id: Long): LogbookMessage

    fun findAcknowledgedPriorNotificationByReportId(
        reportId: String,
        operationDate: ZonedDateTime,
    ): PriorNotification?

    fun findLastMessageDate(): ZonedDateTime

    fun findLastThreeYearsTripNumbers(internalReferenceNumber: String): List<String>

    fun findFirstAndLastOperationsDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber

    fun findDistinctPriorNotificationTypes(): List<String>

    fun findLastReportSoftware(internalReferenceNumber: String): String?

    // Only used in tests
    fun save(message: LogbookMessage)

    fun savePriorNotification(logbookMessageAndValue: LogbookMessageAndValue<PNO>): PriorNotification

    fun updatePriorNotificationState(
        reportId: String,
        operationDate: ZonedDateTime,
        isBeingSent: Boolean,
        isSent: Boolean,
        isVerified: Boolean,
    )

    fun findAllPriorNotificationsToVerify(): List<PriorNotification>

    fun updatePriorNotificationNote(
        reportId: String,
        operationDate: ZonedDateTime,
        note: String?,
        updatedBy: String?,
    )

    fun invalidate(
        reportId: String,
        operationDate: ZonedDateTime,
    )

    // For test purpose
    fun deleteAll()
}
