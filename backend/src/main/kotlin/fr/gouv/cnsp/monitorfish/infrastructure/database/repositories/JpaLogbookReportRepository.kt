package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.exceptions.*
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
    private val dbLogbookReportRepository: DBLogbookReportRepository,
    private val objectMapper: ObjectMapper,
) : LogbookReportRepository {
    private val logger = LoggerFactory.getLogger(JpaLogbookReportRepository::class.java)
    private val postgresChunkSize = 5000

    override fun findAllPriorNotifications(filter: PriorNotificationsFilter): List<PriorNotification> {
        val allLogbookReportModels = dbLogbookReportRepository.findAllEnrichedPnoReferencesAndRelatedOperations(
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
                    referenceLogbookReportModel.toPriorNotification(objectMapper, relatedLogbookReportModels)
                } catch (e: Exception) {
                    logger.warn(
                        "Error while converting logbook report models to prior notifications (reportId = ${referenceLogbookReportModel.reportId}).",
                        e,
                    )

                    null
                }
            }
    }

    override fun findPriorNotificationByReportId(reportId: String): PriorNotification? {
        val allLogbookReportModels = dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(
            reportId,
        )
        if (allLogbookReportModels.isEmpty()) {
            return null
        }

        try {
            val (referenceLogbookReportModel, relatedLogbookReportModels) =
                mapToReferenceWithRelatedModels(allLogbookReportModels).first()

            return referenceLogbookReportModel.toPriorNotification(objectMapper, relatedLogbookReportModels)
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
                    dbLogbookReportRepository.findTripsBeforeDatetime(
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
                    dbLogbookReportRepository.findPreviousTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val previousTrip =
                    dbLogbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
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
                    dbLogbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
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
                    dbLogbookReportRepository.findNextTripNumber(
                        internalReferenceNumber,
                        tripNumber,
                        PageRequest.of(0, 1),
                    ).first().tripNumber
                val nextTrip =
                    dbLogbookReportRepository.findFirstAndLastOperationsDatesOfTrip(
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
                return dbLogbookReportRepository.findAllMessagesByTripNumberBetweenDates(
                    internalReferenceNumber,
                    afterDate.toInstant().toString(),
                    beforeDate.toInstant().toString(),
                    tripNumber,
                ).map {
                    it.toLogbookMessage(objectMapper)
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
        val lanAndPnoMessages = dbLogbookReportRepository.findAllLANAndPNONotProcessedByRule(ruleType)

        val lanAndPnoMessagesWithoutCorrectedMessages =
            lanAndPnoMessages.filter { lanMessage ->
                getCorrectedMessageIfAvailable(lanMessage, lanAndPnoMessages)
            }

        return lanAndPnoMessagesWithoutCorrectedMessages.filter {
            it.internalReferenceNumber != null &&
                it.tripNumber != null &&
                it.messageType == LogbookMessageTypeMapping.LAN.name
        }.map { lanMessage ->
            val pnoMessage =
                lanAndPnoMessagesWithoutCorrectedMessages.singleOrNull { message ->
                    message.internalReferenceNumber == lanMessage.internalReferenceNumber &&
                        message.tripNumber == lanMessage.tripNumber &&
                        message.messageType == LogbookMessageTypeMapping.PNO.name
                }

            Pair(lanMessage.toLogbookMessage(objectMapper), pnoMessage?.toLogbookMessage(objectMapper))
        }
    }

    override fun findDistinctPriorNotificationTypes(): List<String> {
        return dbLogbookReportRepository.findDistinctPriorNotificationType() ?: emptyList()
    }

    override fun updateLogbookMessagesAsProcessedByRule(
        ids: List<Long>,
        ruleType: String,
    ) {
        ids.chunked(postgresChunkSize).forEach {
            dbLogbookReportRepository.updateERSMessagesAsProcessedByRule(it, ruleType)
        }
    }

    override fun findById(id: Long): LogbookMessage {
        return dbLogbookReportRepository.findById(id).get().toLogbookMessage(objectMapper)
    }

    override fun findLastMessageDate(): ZonedDateTime {
        return dbLogbookReportRepository.findLastOperationDateTime().atZone(UTC)
    }

    override fun findFirstAcknowledgedDateOfTripBeforeDateTime(
        internalReferenceNumber: String,
        beforeDateTime: ZonedDateTime,
    ): ZonedDateTime {
        try {
            if (internalReferenceNumber.isNotEmpty()) {
                val lastTrip =
                    dbLogbookReportRepository.findTripsBeforeDatetime(
                        internalReferenceNumber,
                        beforeDateTime.toInstant(),
                        PageRequest.of(0, 1),
                    ).first()

                return dbLogbookReportRepository.findFirstAcknowledgedDateOfTrip(
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
        return dbLogbookReportRepository.findLastTwoYearsTripNumbers(internalReferenceNumber)
    }

    override fun findLastReportSoftware(internalReferenceNumber: String): String? {
        return dbLogbookReportRepository.findLastReportSoftware(internalReferenceNumber)
    }

    // For test purpose
    @Modifying
    @Transactional
    override fun deleteAll() {
        dbLogbookReportRepository.deleteAll()
    }

    @Modifying
    @Transactional
    override fun save(message: LogbookMessage) {
        dbLogbookReportRepository.save(LogbookReportEntity.fromLogbookMessage(objectMapper, message))
    }

    @Modifying
    @Transactional
    override fun savePriorNotification(logbookMessageTyped: LogbookMessageTyped<PNO>): PriorNotification {
        return dbLogbookReportRepository
            .save(LogbookReportEntity.fromLogbookMessage(objectMapper, logbookMessageTyped.logbookMessage))
            .toPriorNotification(objectMapper, emptyList())
    }

    @Transactional
    override fun updatePriorNotificationState(reportId: String, isBeingSent: Boolean, isVerified: Boolean) {
        val logbookReportEntities =
            dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(reportId)
        if (logbookReportEntities.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        // We need to update both DAT and related COR operations (which also covers orphan COR cases)
        logbookReportEntities
            .filter { it.operationType in listOf(LogbookOperationType.DAT, LogbookOperationType.COR) }
            .map { logbookReportEntity ->
                val pnoMessage = objectMapper.readValue(logbookReportEntity.message, PNO::class.java)
                pnoMessage.isBeingSent = isBeingSent
                pnoMessage.isVerified = isVerified

                val nextMessage = objectMapper.writeValueAsString(pnoMessage)

                val updatedEntity = logbookReportEntity.copy(message = nextMessage)

                dbLogbookReportRepository.save(updatedEntity)
            }
    }

    @Transactional
    override fun updatePriorNotificationNote(reportId: String, note: String?) {
        val logbookReportEntities =
            dbLogbookReportRepository.findEnrichedPnoReferenceAndRelatedOperationsByReportId(reportId)
        if (logbookReportEntities.isEmpty()) {
            throw BackendUsageException(BackendUsageErrorCode.NOT_FOUND)
        }

        // We need to update both DAT and related COR operations (which also covers orphan COR cases)
        logbookReportEntities
            .filter { it.operationType in listOf(LogbookOperationType.DAT, LogbookOperationType.COR) }
            .map { logbookReportEntity ->
                val pnoMessage = objectMapper.readValue(logbookReportEntity.message, PNO::class.java)
                pnoMessage.note = note

                val nextMessage = objectMapper.writeValueAsString(pnoMessage)

                val updatedEntity = logbookReportEntity.copy(message = nextMessage)

                dbLogbookReportRepository.save(updatedEntity)
            }
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
