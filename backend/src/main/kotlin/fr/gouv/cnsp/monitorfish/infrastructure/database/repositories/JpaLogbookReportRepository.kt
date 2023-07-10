package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.VoyageDatesAndTripNumber
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookReportRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.repository.Modifying
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaLogbookReportRepository(
    private val dbERSRepository: DBLogbookReportRepository,
    private val mapper: ObjectMapper,
) : LogbookReportRepository {

    private val postgresChunkSize = 5000

    override fun findLastTripBeforeDateTime(internalReferenceNumber: String, beforeDateTime: ZonedDateTime): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip = dbERSRepository.findTripsBeforeDatetime(
                    internalReferenceNumber,
                    beforeDateTime.toInstant(),
                    PageRequest.of(0, 1),
                ).first()

                return VoyageDatesAndTripNumber(
                    lastTrip.tripNumber,
                    lastTrip.startDate.atZone(UTC),
                    lastTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    @Cacheable(value = ["previous_logbook"])
    override fun findTripBeforeTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val previousTripNumber = dbERSRepository.findPreviousTripNumber(
                    internalReferenceNumber,
                    tripNumber,
                    PageRequest.of(0, 1),
                ).first().tripNumber
                val previousTrip = dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
                    internalReferenceNumber,
                    previousTripNumber,
                )

                return VoyageDatesAndTripNumber(
                    previousTripNumber,
                    previousTrip.startDate.atZone(UTC),
                    previousTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    @Cacheable(value = ["next_logbook"])
    override fun findTripAfterTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val nextTripNumber = dbERSRepository.findNextTripNumber(
                    internalReferenceNumber,
                    tripNumber,
                    PageRequest.of(0, 1),
                ).first().tripNumber
                val nextTrip = dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
                    internalReferenceNumber,
                    nextTripNumber,
                )

                return VoyageDatesAndTripNumber(
                    nextTripNumber,
                    nextTrip.startDate.atZone(UTC),
                    nextTrip.endDate.atZone(UTC),
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    private fun getTripNotFoundExceptionMessage(internalReferenceNumber: String) =
        "No trip found found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

    @Cacheable(value = ["logbook_messages"])
    override fun findAllMessagesByTripNumberBetweenDates(
        internalReferenceNumber: String,
        afterDate: ZonedDateTime,
        beforeDate: ZonedDateTime,
        tripNumber: String,
    ): List<LogbookMessage> {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                return dbERSRepository.findAllMessagesByTripNumberBetweenDates(
                    internalReferenceNumber,
                    afterDate.toInstant().toString(),
                    beforeDate.toInstant().toString(),
                    tripNumber,
                ).map {
                    it.toLogbookMessage(mapper)
                }
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: EmptyResultDataAccessException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoERSMessagesFound(getAllMessagesExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findLANAndPNOMessagesNotAnalyzedBy(ruleType: String): List<Pair<LogbookMessage, LogbookMessage?>> {
        val lanAndPnoMessages = dbERSRepository.findAllLANAndPNONotProcessedByRule(ruleType)

        val lanAndPnoMessagesWithoutCorrectedMessages = lanAndPnoMessages.filter { lanMessage ->
            getCorrectedMessageIfAvailable(lanMessage, lanAndPnoMessages)
        }

        return lanAndPnoMessagesWithoutCorrectedMessages.filter {
            it.internalReferenceNumber != null &&
                it.tripNumber != null &&
                it.messageType == LogbookMessageTypeMapping.LAN.name
        }.map { lanMessage ->
            val pnoMessage = lanAndPnoMessagesWithoutCorrectedMessages.singleOrNull { message ->
                message.internalReferenceNumber == lanMessage.internalReferenceNumber &&
                    message.tripNumber == lanMessage.tripNumber &&
                    message.messageType == LogbookMessageTypeMapping.PNO.name
            }

            Pair(lanMessage.toLogbookMessage(mapper), pnoMessage?.toLogbookMessage(mapper))
        }
    }

    override fun updateLogbookMessagesAsProcessedByRule(ids: List<Long>, ruleType: String) {
        ids.chunked(postgresChunkSize).forEach {
            dbERSRepository.updateERSMessagesAsProcessedByRule(it, ruleType)
        }
    }

    override fun findById(id: Long): LogbookMessage {
        return dbERSRepository.findById(id)
            .get().toLogbookMessage(mapper)
    }

    @Modifying
    @Transactional
    override fun deleteAll() {
        dbERSRepository.deleteAll()
    }

    override fun findLastMessageDate(): ZonedDateTime {
        return dbERSRepository.findLastOperationDateTime().atZone(UTC)
    }

    override fun findFirstAcknowledgedDateOfTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): ZonedDateTime {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip = dbERSRepository.findTripsBeforeDatetime(
                    internalReferenceNumber,
                    beforeDateTime.toInstant(),
                    PageRequest.of(0, 1),
                ).first()

                return dbERSRepository.findFirstAcknowledgedDateOfTrip(
                    internalReferenceNumber,
                    lastTrip.tripNumber,
                ).atZone(
                    UTC,
                )
            }

            throw IllegalArgumentException("No CFR given to find the vessel.")
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    private fun getCorrectedMessageIfAvailable(pnoMessage: LogbookReportEntity, messages: List<LogbookReportEntity>): Boolean {
        return if (pnoMessage.operationType == LogbookOperationType.DAT) {
            !messages.any {
                it.operationType == LogbookOperationType.COR && it.referencedReportId == pnoMessage.reportId
            }
        } else {
            true
        }
    }

    private fun getAllMessagesExceptionMessage(internalReferenceNumber: String) =
        "No messages found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"
}
