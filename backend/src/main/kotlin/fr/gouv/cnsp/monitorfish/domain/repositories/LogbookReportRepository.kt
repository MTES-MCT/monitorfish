package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import java.time.ZonedDateTime

interface LogbookReportRepository {
    fun findAllAcknowledgedPriorNotifications(filter: PriorNotificationsFilter): List<PriorNotification>

    fun findAllTrips(internalReferenceNumber: String): List<VoyageDatesAndTripNumber>

    fun findAllMessagesByTripNumberBetweenOperationDates(
        internalReferenceNumber: String,
        firstOperationDateTime: ZonedDateTime,
        lastOperationDateTime: ZonedDateTime,
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

    fun findDistinctPriorNotificationTypes(): List<String>

    fun findLastReportSoftware(internalReferenceNumber: String): String?

    fun findLastOperationNumber(internalReferenceNumber: String): String?

    fun findAllCfrWithVisioCaptures(): List<String>

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
