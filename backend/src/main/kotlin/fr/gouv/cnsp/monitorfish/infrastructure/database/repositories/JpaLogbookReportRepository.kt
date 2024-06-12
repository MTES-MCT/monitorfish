package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.exceptions.EntityConversionException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.utils.toSqlArrayString
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(JpaLogbookReportRepository::class.java)
    private val postgresChunkSize = 5000

    override fun findAllPriorNotifications(filter: PriorNotificationsFilter): List<PriorNotification> {
        val allLogbookReportModels = dbERSRepository.findAllEnrichedPnoReferencesAndRelatedOperations(
            flagStates = filter.flagStates ?: emptyList(),
            hasOneOrMoreReportings = filter.hasOneOrMoreReportings,
            isLessThanTwelveMetersVessel = filter.isLessThanTwelveMetersVessel,
            lastControlledAfter = filter.lastControlledAfter,
            lastControlledBefore = filter.lastControlledBefore,
            portLocodes = filter.portLocodes ?: emptyList(),
            priorNotificationTypesAsSqlArrayString = toSqlArrayString(filter.priorNotificationTypes),
            searchQuery = filter.searchQuery,
            specyCodesAsSqlArrayString = toSqlArrayString(filter.specyCodes),
            tripGearCodesAsSqlArrayString = toSqlArrayString(filter.tripGearCodes),
            tripSegmentCodesAsSqlArrayString = toSqlArrayString(filter.tripSegmentCodes),
            willArriveAfter = filter.willArriveAfter,
            willArriveBefore = filter.willArriveBefore,
        )

        return mapToReferenceWithRelatedModels(allLogbookReportModels)
            .mapNotNull { (referenceLogbookReportModel, relatedLogbookReportModels) ->
                try {
                    referenceLogbookReportModel.toPriorNotification(mapper, relatedLogbookReportModels)
                } catch (e: Exception) {
                    logger.warn(
                        "Error while converting logbook report models to prior notifications (reoportId = ${referenceLogbookReportModel.reportId}).",
                        e,
                    )

                    null
                }
            }
    }

    override fun findPriorNotificationByReportId(reportId: String): PriorNotification? {
        val allLogbookReportModels = dbERSRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(
            reportId,
        )
        if (allLogbookReportModels.isEmpty()) {
            return null
        }

        try {
            val (referenceLogbookReportModel, relatedLogbookReportModels) =
                mapToReferenceWithRelatedModels(allLogbookReportModels).first()

            return referenceLogbookReportModel.toPriorNotification(mapper, relatedLogbookReportModels)
        } catch (e: Exception) {
            throw EntityConversionException(
                "Error while converting logbook report models to prior notification (reoportId = $reportId).",
                e,
            )
        }
    }

    override fun findLastTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip =
                    dbERSRepository.findTripsBeforeDatetime(
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
                val previousTripNumber =
                    dbERSRepository.findPreviousTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val previousTrip =
                    dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
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

    @Cacheable(value = ["first_and_last_trip_dates"])
    override fun findFirstAndLastOperationsDatesOfTrip(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val nextTrip =
                    dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
                        internalReferenceNumber,
                        tripNumber,
                    )

                return VoyageDatesAndTripNumber(
                    tripNumber,
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

    @Cacheable(value = ["next_logbook"])
    override fun findTripAfterTripNumber(
        internalReferenceNumber: String,
        tripNumber: String,
    ): VoyageDatesAndTripNumber {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val nextTripNumber =
                    dbERSRepository.findNextTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val nextTrip =
                    dbERSRepository.findFirstAndLastOperationsDatesOfTrip(
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
        "No trip found for the vessel. (internalReferenceNumber: \"$internalReferenceNumber\")"

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

        val lanAndPnoMessagesWithoutCorrectedMessages =
            lanAndPnoMessages.filter { lanMessage ->
                getCorrectedMessageIfAvailable(lanMessage, lanAndPnoMessages)
            }

        return lanAndPnoMessagesWithoutCorrectedMessages.filter {
            it.cfr != null &&
                it.tripNumber != null &&
                it.messageType == LogbookMessageTypeMapping.LAN.name
        }.map { lanMessage ->
            val pnoMessage =
                lanAndPnoMessagesWithoutCorrectedMessages.singleOrNull { message ->
                    message.cfr == lanMessage.cfr &&
                        message.tripNumber == lanMessage.tripNumber &&
                        message.messageType == LogbookMessageTypeMapping.PNO.name
                }

            Pair(lanMessage.toLogbookMessage(mapper), pnoMessage?.toLogbookMessage(mapper))
        }
    }

    override fun findDistinctPriorNotificationTypes(): List<String> {
        return dbERSRepository.findDistinctPriorNotificationType() ?: emptyList()
    }

    override fun updateLogbookMessagesAsProcessedByRule(
        ids: List<Long>,
        ruleType: String,
    ) {
        ids.chunked(postgresChunkSize).forEach {
            dbERSRepository.updateERSMessagesAsProcessedByRule(it, ruleType)
        }
    }

    override fun findById(id: Long): LogbookMessage {
        return dbERSRepository.findById(id).get().toLogbookMessage(mapper)
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
                val lastTrip =
                    dbERSRepository.findTripsBeforeDatetime(
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
        } catch (e: EmptyResultDataAccessException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: NoSuchElementException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        } catch (e: IllegalArgumentException) {
            throw NoLogbookFishingTripFound(getTripNotFoundExceptionMessage(internalReferenceNumber), e)
        }
    }

    override fun findLastTwoYearsTripNumbers(internalReferenceNumber: String): List<String> {
        return dbERSRepository.findLastTwoYearsTripNumbers(internalReferenceNumber)
    }

    override fun findLastReportSoftware(internalReferenceNumber: String): String? {
        return dbERSRepository.findLastReportSoftware(internalReferenceNumber)
    }

    // For test purpose
    @Modifying
    @Transactional
    override fun deleteAll() {
        dbERSRepository.deleteAll()
    }

    @Modifying
    @Transactional
    override fun save(message: LogbookMessage) {
        dbERSRepository.save(LogbookReportEntity.fromLogbookMessage(mapper, message))
    }

    @Modifying
    @Transactional
    override fun savePriorNotification(logbookMessageTyped: LogbookMessageTyped<PNO>): PriorNotification {
        return dbERSRepository
            .save(LogbookReportEntity.fromLogbookMessage(mapper, logbookMessageTyped.logbookMessage))
            .toPriorNotification(mapper, emptyList())
    }

    private fun getCorrectedMessageIfAvailable(
        pnoMessage: LogbookReportEntity,
        messages: List<LogbookReportEntity>,
    ): Boolean {
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

    companion object {
        fun mapToReferenceWithRelatedModels(
            allLogbookReportModels: List<LogbookReportEntity>,
        ): List<Pair<LogbookReportEntity, List<LogbookReportEntity>>> {
            // DAT operations are references by definition
            val datLogbookReportModels = allLogbookReportModels.filter { it.operationType == LogbookOperationType.DAT }
            // Orphan COR operations are also considered as references for lack of anything better
            // They can be orphan for various reasons, like an error along the external JPE flow.
            val orphanCorLogbookReportModels = allLogbookReportModels
                .filter { it.operationType == LogbookOperationType.COR }
                .filter { corOperation ->
                    corOperation.referencedReportId == null ||
                        datLogbookReportModels.none { it.reportId == corOperation.referencedReportId }
                }
            val referenceLogbookReportModels = datLogbookReportModels + orphanCorLogbookReportModels

            return referenceLogbookReportModels.map { referenceLogbookReportModel ->
                val directlyAssociatedLogbookReportModels = allLogbookReportModels.filter {
                    it.referencedReportId == referenceLogbookReportModel.reportId
                }
                // COR operation also have their own `reportId` which can also be associated to their own operations
                // For example, a RET (aknlowledgement) operation can be associated to a COR operation.
                val directlyAssociatedReportIds = directlyAssociatedLogbookReportModels.mapNotNull { it.reportId }
                val indirectlyAssociatedLogbookReportModels = allLogbookReportModels.filter {
                    it.referencedReportId in directlyAssociatedReportIds
                }
                val associatedLogbookReportModels = directlyAssociatedLogbookReportModels +
                    indirectlyAssociatedLogbookReportModels

                Pair(referenceLogbookReportModel, associatedLogbookReportModels)
            }
        }
    }
}
