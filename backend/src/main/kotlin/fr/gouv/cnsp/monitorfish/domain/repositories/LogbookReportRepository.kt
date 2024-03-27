package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import java.time.ZonedDateTime

interface LogbookReportRepository {
    fun findAllPriorNotifications(filter: LogbookReportFilter): List<PriorNotification>

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

    fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<LogbookMessage, LogbookMessage?>>

    fun updateLogbookMessagesAsProcessedByRule(
        ids: List<Long>,
        ruleType: String,
    )

    fun findById(id: Long): LogbookMessage

    fun findLastMessageDate(): ZonedDateTime

    fun findLastTwoYearsTripNumbers(internalReferenceNumber: String): List<String>

    fun findFirstAndLastOperationsDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber

    fun findDistinctPriorNotificationTypes(): List<String>

    // For test purpose
    fun deleteAll()

    fun save(message: LogbookMessage)
}
